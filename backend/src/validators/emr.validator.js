const { z } = require('zod');

// EMR01: Conduct Examination & Create EMR Validator
const createEmrSchema = z.object({
  petId: z.string({ required_error: 'Pet ID is required' }).uuid('Invalid Pet ID format'),
  // Per Business Rule 3.0.E1: Weight and Diagnosis are strictly mandatory
  weight: z
    .number({ required_error: 'Patient weight is mandatory for clinical examination' })
    .positive('Weight must be a positive number'),
  temperature: z.number().optional().nullable(),
  heartRate: z.number().int().positive().optional().nullable(),
  symptoms: z.string().optional().nullable(),
  diagnosis: z
    .string({ required_error: 'Clinical diagnosis is mandatory' })
    .min(3, 'Diagnosis description must be at least 3 characters'),
  treatmentPlan: z
    .string({ required_error: 'Treatment plan is required' })
    .min(3, 'Treatment plan must be at least 3 characters'),
  status: z
    .enum(['IN_PROGRESS', 'WAITING_LAB_RESULT', 'EXAMINATION_COMPLETED', 'COMPLETED'])
    .default('EXAMINATION_COMPLETED'),
  // Optional inline lab order or prescription during exam session
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
  diagnosis: z.string().min(3).optional(),
  treatmentPlan: z.string().min(3).optional(),
  status: z
    .enum(['IN_PROGRESS', 'WAITING_LAB_RESULT', 'EXAMINATION_COMPLETED', 'COMPLETED'])
    .optional(),
});

module.exports = {
  createEmrSchema,
  updateEmrSchema,
};

