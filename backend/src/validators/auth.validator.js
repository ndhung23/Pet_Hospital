const { z } = require('zod');

// Phone regex for Vietnam numbers: starts with 0 or +84, followed by 9 digits
const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  userName: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, or hyphens'),
  email: z.string().trim().email('Invalid email address').max(100),
  phone: z.string().trim().regex(phoneRegex, 'Invalid Vietnamese phone number format'),
  address: z.string().trim().max(255).optional(),
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Confirm password does not match',
  path: ['confirmPassword'],
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

const resendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  purpose: z.enum(['REGISTER', 'RESET_PASSWORD']),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
  newPassword: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Confirm password does not match',
  path: ['confirmPassword'],
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
