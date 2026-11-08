const express = require('express');
const billingController = require('../controllers/billing.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  buildInvoiceSchema,
  cashPaymentSchema,
  listInvoiceQuerySchema,
  invoiceIdParamSchema,
} = require('../validators/billing.validator');

const router = express.Router();

/* =========================================================================
   Public VNPay callbacks — must be registered BEFORE router.use(authenticate)
   because VNPay calls them server-to-server with no session.
   ========================================================================= */
router.get('/vnpay/ipn', billingController.vnpayIpn);
router.get('/vnpay/return', billingController.vnpayReturn);

/* =========================================================================
   Authenticated routes
   ========================================================================= */
router.use(authenticate);

// UC-BILL-01: build the consolidated invoice from an encounter
router.post(
  '/invoices',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(buildInvoiceSchema),
  billingController.buildInvoice
);

// Billing queue
router.get(
  '/invoices',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(listInvoiceQuerySchema, 'query'),
  billingController.listInvoices
);

// UC-BILL-02: Pet Owner invoice history
router.get('/invoices/mine', authorize('PET_OWNER'), billingController.listMyInvoices);

// UC-BILL-02: itemised detail (staff, or owner of the invoice)
router.get(
  '/invoices/:invoiceId',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER', 'PET_OWNER'),
  validate(invoiceIdParamSchema, 'params'),
  billingController.getInvoiceDetail
);

// UC-BILL-01: settle by cash
router.post(
  '/invoices/:invoiceId/pay-cash',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(invoiceIdParamSchema, 'params'),
  validate(cashPaymentSchema),
  billingController.payCash
);

// UC-BILL-01: settle by VNPay
router.post(
  '/invoices/:invoiceId/pay-vnpay',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(invoiceIdParamSchema, 'params'),
  billingController.initVnpayPayment
);

module.exports = router;
