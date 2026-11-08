const crypto = require('crypto');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/* =========================================================================
   VNPay configuration
   ========================================================================= */

const VNP_CONFIG = {
  tmnCode: env.VNPAY_TMN_CODE || '',
  hashSecret: env.VNPAY_HASH_SECRET || '',
  url: env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: env.VNPAY_RETURN_URL || 'http://localhost:5000/api/billing/vnpay/return',
  apiUrl: env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};

const isVnpayConfigured = () => Boolean(VNP_CONFIG.tmnCode && VNP_CONFIG.hashSecret);

/* =========================================================================
   Helpers
   ========================================================================= */

/** VNPay requires yyyyMMddHHmmss in GMT+7. */
const toVnpayDate = (date = new Date()) => {
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${gmt7.getUTCFullYear()}${pad(gmt7.getUTCMonth() + 1)}${pad(gmt7.getUTCDate())}` +
    `${pad(gmt7.getUTCHours())}${pad(gmt7.getUTCMinutes())}${pad(gmt7.getUTCSeconds())}`
  );
};

/** Deterministic, sortable invoice code: INV-YYYYMMDD-XXXX */
const buildInvoiceCode = async (tx = prisma) => {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const dayStart = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const count = await tx.invoice.count({ where: { createdAt: { gte: dayStart } } });
  return `INV-${stamp}-${String(count + 1).padStart(4, '0')}`;
};

/** VNPay HMAC-SHA512 over the sorted, URL-encoded parameter string. */
const buildVnpaySignature = (params) => {
  const sorted = Object.keys(params)
    .filter((key) => params[key] !== '' && params[key] !== null && params[key] !== undefined)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key])).replace(/%20/g, '+')}`)
    .join('&');
  return crypto.createHmac('sha512', VNP_CONFIG.hashSecret).update(Buffer.from(sorted, 'utf-8')).digest('hex');
};

const verifyVnpaySignature = (query) => {
  const received = query.vnp_SecureHash;
  if (!received) return false;
  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const expected = buildVnpaySignature(params);
  // Constant-time compare to avoid leaking the hash through timing
  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(String(received).toLowerCase(), 'utf-8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/* =========================================================================
   UC-BILL-01: Consolidate charges into an invoice
   ========================================================================= */

/**
 * Collect every billable artefact attached to one medical record:
 *   - the consultation itself (Service row matching the vet's department, or a
 *     flat fallback consultation fee)
 *   - every LabOrderItem from UC-LAB-01
 *   - every PrescriptionItem from UC-PRES-01
 *
 * Prices are copied, not referenced, so a later catalogue change never rewrites
 * a settled invoice (BR-05).
 */
const collectChargeableItems = async (tx, record) => {
  const items = [];

  // --- Consultation -------------------------------------------------------
  const consultationService = await tx.service.findFirst({
    where: { isActive: true, category: 'CONSULTATION' },
    orderBy: { unitPrice: 'asc' },
  });

  if (consultationService) {
    items.push({
      type: 'CONSULTATION',
      refId: consultationService.id,
      description: consultationService.name,
      unitPrice: consultationService.unitPrice,
      quantity: 1,
      amount: consultationService.unitPrice,
    });
  }

  // --- Laboratory ---------------------------------------------------------
  const labOrders = await tx.labOrder.findMany({
    where: { recordId: record.id },
    include: { items: { include: { labTest: true } } },
  });

  for (const order of labOrders) {
    for (const line of order.items) {
      const unitPrice = line.labTest.unitPrice;
      items.push({
        type: 'LAB',
        refId: line.labTest.id,
        description: line.labTest.name,
        unitPrice,
        quantity: line.quantity,
        amount: unitPrice * line.quantity,
      });
    }
  }

  // --- Pharmacy -----------------------------------------------------------
  const prescription = await tx.prescription.findUnique({
    where: { recordId: record.id },
    include: { items: { include: { drug: true } } },
  });

  if (prescription) {
    for (const line of prescription.items) {
      const unitPrice = line.drug.unitPrice;
      items.push({
        type: 'DRUG',
        refId: line.drug.id,
        description: `${line.drug.name} (${line.drug.unit})`,
        unitPrice,
        quantity: line.quantity,
        amount: unitPrice * line.quantity,
      });
    }
  }

  return items;
};

/**
 * UC-BILL-01 step 1-3: build the consolidated invoice for an encounter.
 * Idempotent: recordId is UNIQUE, so re-billing returns the existing invoice
 * instead of creating a duplicate (NF-08).
 */
const buildInvoice = async (actor, { recordId, discount = 0 }) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    include: { pet: { select: { id: true, name: true, ownerId: true } } },
  });

  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  const existing = await prisma.invoice.findUnique({
    where: { recordId },
    include: { items: true, payments: true },
  });

  if (existing) {
    return { invoice: existing, created: false };
  }

  const items = await collectChargeableItems(prisma, record);

  if (items.length === 0) {
    throw new AppError('This medical record has no billable charges yet.', 400);
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const total = subtotal - safeDiscount;

  const invoice = await prisma.$transaction(async (tx) => {
    const code = await buildInvoiceCode(tx);

    return tx.invoice.create({
      data: {
        code,
        recordId: record.id,
        petId: record.petId,
        ownerId: record.pet.ownerId,
        createdBy: actor.id,
        subtotal,
        discount: safeDiscount,
        total,
        status: 'UNPAID',
        items: { create: items },
      },
      include: {
        items: true,
        pet: { select: { id: true, name: true, species: true } },
        owner: { select: { id: true, fullName: true, phone: true } },
      },
    });
  });

  return { invoice, created: true };
};

/**
 * Billing queue for the reception desk.
 */
const listInvoices = async (query = {}) => {
  const { status = 'UNPAID', search, ownerId } = query;

  const where = {};
  if (status !== 'ALL') where.status = status;
  if (ownerId) where.ownerId = ownerId;

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { owner: { fullName: { contains: search, mode: 'insensitive' } } },
      { pet: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.invoice.findMany({
    where,
    include: {
      pet: { select: { id: true, name: true, species: true } },
      owner: { select: { id: true, fullName: true, phone: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
};

/**
 * UC-BILL-02: itemised invoice detail.
 * A Pet Owner may only read invoices belonging to their own pets.
 */
const getInvoiceDetail = async (invoiceId, requester) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      pet: { select: { id: true, name: true, species: true, breed: true } },
      owner: { select: { id: true, fullName: true, phone: true, email: true } },
      record: {
        select: {
          id: true,
          diagnosis: true,
          treatmentPlan: true,
          createdAt: true,
          veterinarian: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found.', 404);
  }

  // Ownership check — the most common place to leak another owner's data
  if (requester.role === 'PET_OWNER' && invoice.ownerId !== requester.id) {
    throw new AppError('You do not have access to this invoice.', 403);
  }

  return invoice;
};

/**
 * BR-05: a settled invoice is immutable.
 */
const assertInvoiceMutable = (invoice) => {
  if (invoice.status === 'PAID') {
    throw new AppError('This invoice has already been settled and cannot be modified.', 409);
  }
  if (invoice.status === 'CANCELLED') {
    throw new AppError('This invoice has been cancelled.', 409);
  }
  if (invoice.status === 'REFUNDED') {
    throw new AppError('This invoice has been refunded.', 409);
  }
};

/* =========================================================================
   UC-BILL-01: Settle — cash
   ========================================================================= */

/**
 * Cash settlement. The status transition is guarded by a conditional updateMany
 * so two receptionists clicking at the same time cannot both settle it.
 */
const payCash = async (receptionist, invoiceId, amountReceived) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });

  if (!invoice) {
    throw new AppError('Invoice not found.', 404);
  }

  assertInvoiceMutable(invoice);

  if (amountReceived < invoice.total) {
    throw new AppError(
      `Insufficient payment. Invoice total is ${invoice.total} VND but only ${amountReceived} VND was received.`,
      400
    );
  }

  const changeAmount = amountReceived - invoice.total;

  return prisma.$transaction(async (tx) => {
    // Guarded transition: only one caller can flip UNPAID -> PAID
    const claimed = await tx.invoice.updateMany({
      where: { id: invoiceId, status: 'UNPAID' },
      data: { status: 'PAID', paidAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new AppError('This invoice was already settled by another transaction.', 409);
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        method: 'CASH',
        status: 'SUCCESS',
        txnRef: `CASH-${invoice.code}-${Date.now()}`,
        amount: invoice.total,
        receivedAmount: amountReceived,
        changeAmount,
        collectedBy: receptionist.id,
        paidAt: new Date(),
      },
    });

    // BR-09: decrement pharmacy stock for every drug line
    await decrementStockForInvoice(tx, invoice.items);

    return { invoice: { ...invoice, status: 'PAID' }, payment, changeAmount };
  });
};

/**
 * BR-09. Runs inside the settlement transaction so a stock failure rolls the
 * payment back rather than leaving a paid invoice with un-decremented stock.
 */
const decrementStockForInvoice = async (tx, items) => {
  const drugLines = items.filter((item) => item.type === 'DRUG' && item.refId);

  for (const line of drugLines) {
    const drug = await tx.drug.findUnique({ where: { id: line.refId } });
    if (!drug) continue;

    if (drug.stockQty < line.quantity) {
      throw new AppError(
        `Insufficient stock for ${drug.name}: ${drug.stockQty} ${drug.unit} available, ${line.quantity} required.`,
        409
      );
    }

    await tx.drug.update({
      where: { id: drug.id },
      data: { stockQty: { decrement: line.quantity } },
    });
  }
};

/* =========================================================================
   UC-BILL-01: Settle — VNPay
   ========================================================================= */

/**
 * Create a PENDING payment and hand back the signed payment URL.
 */
const initVnpayPayment = async (receptionist, invoiceId, ipAddr) => {
  if (!isVnpayConfigured()) {
    throw new AppError(
      'VNPay is not configured. Set VNPAY_TMN_CODE and VNPAY_HASH_SECRET in the backend environment.',
      503
    );
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    throw new AppError('Invoice not found.', 404);
  }
  assertInvoiceMutable(invoice);

  // Reuse an outstanding PENDING attempt rather than stacking new ones
  const pending = await prisma.payment.findFirst({
    where: { invoiceId, method: 'VNPAY', status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  let txnRef = pending?.txnRef;

  if (!txnRef) {
    txnRef = `${invoice.code.replace(/-/g, '')}${Date.now()}`.slice(0, 32);
    await prisma.payment.create({
      data: {
        invoiceId,
        method: 'VNPAY',
        status: 'PENDING',
        txnRef,
        amount: invoice.total,
        collectedBy: receptionist.id,
      },
    });
  }

  const now = new Date();
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNP_CONFIG.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    // VNPay expects VND * 100
    vnp_Amount: String(invoice.total * 100),
    vnp_OrderInfo: `Thanh toan hoa don ${invoice.code}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: VNP_CONFIG.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: toVnpayDate(now),
    vnp_ExpireDate: toVnpayDate(new Date(now.getTime() + 15 * 60 * 1000)),
  };

  const signature = buildVnpaySignature(params);
  const query = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key])).replace(/%20/g, '+')}`)
    .join('&');

  return {
    txnRef,
    amount: invoice.total,
    paymentUrl: `${VNP_CONFIG.url}?${query}&vnp_SecureHash=${signature}`,
  };
};

/**
 * UC-BILL-01 step 6: VNPay IPN (server-to-server).
 * NF-08: VNPay retries this callback, so the whole handler must be idempotent.
 * The status transition is claimed with a conditional updateMany keyed on
 * txnRef + PENDING, which makes a duplicate callback a no-op.
 */
const handleVnpayIpn = async (query) => {
  const respond = (RspCode, Message) => ({ RspCode, Message });

  if (!verifyVnpaySignature(query)) {
    return respond('97', 'Invalid signature');
  }

  const txnRef = query.vnp_TxnRef;
  const payment = await prisma.payment.findUnique({ where: { txnRef } });

  if (!payment) {
    return respond('01', 'Order not found');
  }

  // Amount must match what we asked for (VNPay sends VND * 100)
  const expectedAmount = payment.amount * 100;
  if (Number(query.vnp_Amount) !== expectedAmount) {
    return respond('04', 'Invalid amount');
  }

  // Already settled: acknowledge without touching state again
  if (payment.status === 'SUCCESS') {
    return respond('02', 'Order already confirmed');
  }

  const isSuccess = query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';

  if (!isSuccess) {
    await prisma.payment.updateMany({
      where: { txnRef, status: 'PENDING' },
      data: {
        status: 'FAILED',
        vnpResponseCode: query.vnp_ResponseCode || null,
        vnpTransactionNo: query.vnp_TransactionNo || null,
      },
    });
    return respond('00', 'Confirm Success');
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: payment.invoiceId },
    include: { items: true },
  });

  if (!invoice) {
    return respond('01', 'Order not found');
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Claim the PENDING payment — a retried IPN finds count 0 and stops here
      const claimed = await tx.payment.updateMany({
        where: { txnRef, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          vnpResponseCode: query.vnp_ResponseCode,
          vnpTransactionNo: query.vnp_TransactionNo || null,
        },
      });

      if (claimed.count !== 1) {
        return; // another callback already settled it
      }

      const invoiceClaimed = await tx.invoice.updateMany({
        where: { id: invoice.id, status: 'UNPAID' },
        data: { status: 'PAID', paidAt: new Date() },
      });

      if (invoiceClaimed.count !== 1) {
        throw new AppError('Invoice is no longer payable.', 409);
      }

      await decrementStockForInvoice(tx, invoice.items);
    });
  } catch (error) {
    if (error instanceof AppError) {
      return respond('02', error.message);
    }
    return respond('99', 'Unknown error');
  }

  return respond('00', 'Confirm Success');
};

/**
 * Browser return URL. Display only — never changes state, because the IPN is
 * the authoritative settlement signal.
 */
const handleVnpayReturn = async (query) => {
  const signatureValid = verifyVnpaySignature(query);
  const payment = query.vnp_TxnRef
    ? await prisma.payment.findUnique({
        where: { txnRef: query.vnp_TxnRef },
        include: { invoice: { select: { id: true, code: true, status: true, total: true } } },
      })
    : null;

  return {
    signatureValid,
    responseCode: query.vnp_ResponseCode || null,
    transactionStatus: query.vnp_TransactionStatus || null,
    txnRef: query.vnp_TxnRef || null,
    // The invoice status here is whatever the IPN has already written
    invoice: payment?.invoice ?? null,
    paymentStatus: payment?.status ?? null,
    message:
      query.vnp_ResponseCode === '00'
        ? 'Payment completed. The invoice status is confirmed by the VNPay server callback.'
        : 'Payment was not completed. You may retry or choose another method.',
  };
};

/* =========================================================================
   UC-BILL-02: Pet Owner invoice history
   ========================================================================= */

const listMyInvoices = async (ownerId) => {
  return prisma.invoice.findMany({
    where: { ownerId },
    include: {
      pet: { select: { id: true, name: true, species: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  isVnpayConfigured,
  buildInvoice,
  listInvoices,
  getInvoiceDetail,
  payCash,
  initVnpayPayment,
  handleVnpayIpn,
  handleVnpayReturn,
  listMyInvoices,
};
