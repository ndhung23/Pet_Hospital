// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
const { z } = require('zod');

/**
 * UC-EMR-01: Conduct Examination & EMR Schema
 * Exception 3.0.E1: If Vet attempts to save without entering Diagnosis or Weight, system highlights missing fields and blocks record finalize.
 */
const createEmrSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  petId: z.string({ required_error: 'Pet ID is required' }).uuid('Valid Pet ID is required'),
  weight: z
    .number({
      required_error: 'Patient weight is mandatory per Exception 3.0.E1',
      invalid_type_error: 'Weight must be a valid positive number',
    })
    .positive('Weight must be greater than 0'),
  temperature: z.number().positive().optional().nullable(),
  heartRate: z.number().int().positive().optional().nullable(),
  symptoms: z.string().optional().nullable(),
  clinicalFindings: z.string().trim().max(3000).optional().nullable(),
  diagnosis: z
    .string({
      required_error: 'Clinical diagnosis is mandatory per Exception 3.0.E1',
    })
    .trim()
    .min(2, 'Diagnosis is mandatory and cannot be empty'),
  treatmentPlan: z
    .string({
      required_error: 'Treatment plan is required',
    })
    .trim()
    .min(2, 'Treatment plan cannot be empty')
    .max(3000),
  status: z
    .enum(['IN_PROGRESS', 'WAITING_LAB_RESULT', 'EXAMINATION_COMPLETED', 'COMPLETED'])
    .default('EXAMINATION_COMPLETED'),
  labOrders: z
    .array(
      z.object({
        testType: z.string().min(2, 'Test type is required'),
        urgency: z.enum(['ROUTINE', 'URGENT']).default('ROUTINE'),
        requestNote: z.string().optional().nullable(),
      })
    )
    .optional(),
  prescriptions: z
    .array(
      z.object({
        medicineName: z.string().min(1, 'Medicine name is required'),
        dosage: z.string().min(1, 'Dosage instructions are required'),
        quantity: z.number().int().positive().default(1),
        unit: z.string().optional().nullable(),
        duration: z.string().optional().nullable(),
        instructions: z.string().optional().nullable(),
      })
    )
    .optional(),
});

// Update EMR schema
const updateEmrSchema = z.object({
  weight: z.number().positive().optional(),
  temperature: z.number().optional().nullable(),
  heartRate: z.number().int().positive().optional().nullable(),
  symptoms: z.string().optional().nullable(),
  clinicalFindings: z.string().trim().max(3000).optional().nullable(),
  diagnosis: z.string().min(2).optional(),
  treatmentPlan: z.string().min(2).optional(),
  status: z
    .enum(['IN_PROGRESS', 'WAITING_LAB_RESULT', 'EXAMINATION_COMPLETED', 'COMPLETED'])
    .optional(),
});

module.exports = {
  createEmrSchema,
  updateEmrSchema,
};
