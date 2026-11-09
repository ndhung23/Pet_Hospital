const { z } = require('zod');

// LAB01: Issue Paraclinical Lab Order Validator
const createLabOrderSchema = z.object({
  recordId: z.string({ required_error: 'Medical Record ID is required' }).uuid('Invalid record ID format'),
  petId: z.string().uuid().optional(),
  testType: z.string({ required_error: 'Test type is mandatory' }).min(2, 'Test type name is too short'),
  urgency: z.enum(['ROUTINE', 'URGENT']).default('ROUTINE'),
  requestNote: z.string().optional().nullable(),
});

// LAB02: Process Lab Order & Submit Results Validator
const processLabOrderSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  resultValues: z.record(z.any()).optional().nullable(),
  resultSummary: z.string().optional().nullable(),
  resultImageUrl: z.string().optional().nullable(),
  sampleTakenAt: z.string().datetime().optional().nullable(),
});

module.exports = {
  createLabOrderSchema,
  processLabOrderSchema,
};

