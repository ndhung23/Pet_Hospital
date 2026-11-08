const rateLimit = require('express-rate-limit');

// Generic API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Strict limiter for authentication endpoints (login, forgot password, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

// OTP resend limiter (prevent spamming email service)
const otpResendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Please wait at least 60 seconds before requesting a new OTP.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpResendLimiter,
};
