const { z } = require('zod');

const askAiSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question must not exceed 1000 characters'),
  petId: z.string().uuid('Invalid pet ID').optional().nullable(),
});

module.exports = {
  askAiSchema,
};
