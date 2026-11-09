const { z } = require('zod');

const emergencyTriageSchema = z.object({
  ownerMode: z.enum(['REGISTERED', 'ANONYMOUS']),
  ownerPhone: z.string().trim().optional(),
  ownerName: z.string().trim().optional(),
  petId: z.string().optional().nullable(),
  petName: z.string().trim().min(1, 'Pet name is required'),
  species: z.string().trim().min(1, 'Species is required'),
  breed: z.string().trim().optional(),
  weight: z.number().positive().optional().nullable(),
  conditionLevel: z.enum(['LEVEL_1_CRITICAL', 'LEVEL_2_URGENT', 'LEVEL_3_STANDARD']),
  initialSymptoms: z
    .string()
    .trim()
    .min(3, 'Observed triage symptoms must be at least 3 characters')
    .max(2000, 'Symptoms description cannot exceed 2000 characters'),
  vetId: z.string().optional().nullable(),
});

module.exports = {
  emergencyTriageSchema,
};
