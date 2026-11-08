const { z } = require('zod');

/**
 * UC-EMR-01: Conduct Examination & EMR Schema
 * Exception 3.0.E1: If Vet attempts to save without entering Diagnosis or Weight, system highlights missing fields and blocks record finalize.
 */
const createEmrSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  petId: z.string().uuid('Valid Pet ID is required'),
  weight: z
    .number({
      required_error: 'Weight is mandatory per Exception 3.0.E1',
      invalid_type_error: 'Weight must be a valid positive number',
    })
    .positive('Weight must be greater than 0'),
  temperature: z.number().positive('Temperature must be a positive number').optional().nullable(),
  heartRate: z.number().int().positive('Heart rate must be a positive integer').optional().nullable(),
  clinicalFindings: z.string().trim().max(3000).optional(),
  diagnosis: z
    .string({
      required_error: 'Diagnosis is mandatory per Exception 3.0.E1',
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
});

module.exports = {
  createEmrSchema,
};
