const { z } = require('zod');

const PAYMENT_METHODS = ['CASH', 'VNPAY'];

const invoiceIdParamSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice id'),
});

const buildInvoiceSchema = z.object({
  recordId: z.string().uuid('A valid medical record is required'),
  discount: z.number().int().min(0).optional().default(0),
});

const cashPaymentSchema = z.object({
  amountReceived: z
    .number()
    .int('Amount received must be a whole number of VND')
    .positive('Amount received must be greater than zero'),
});

const listInvoiceQuerySchema = z.object({
  status: z.enum(['UNPAID', 'PAID', 'REFUNDED', 'CANCELLED', 'ALL']).optional(),
  search: z.string().trim().max(100).optional(),
  ownerId: z.string().uuid().optional(),
});

module.exports = {
  PAYMENT_METHODS,
  invoiceIdParamSchema,
  buildInvoiceSchema,
  cashPaymentSchema,
  listInvoiceQuerySchema,
};
