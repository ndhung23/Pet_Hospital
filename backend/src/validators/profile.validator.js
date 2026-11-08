const { z } = require('zod');

const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().regex(phoneRegex, 'Invalid Vietnamese phone number format').optional(),
  email: z.string().trim().email('Invalid email address').max(100).optional(),
  address: z.string().trim().max(255).optional(),
});

module.exports = {
  updateProfileSchema,
};
