const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');
const { authLimiter, otpResendLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

// UC-AUTH-01: Register
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/register/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', otpResendLimiter, validate(resendOtpSchema), authController.resendOtp);

// UC-AUTH-02: Login, Refresh, Logout
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// UC-AUTH-03: Reset Password via OTP
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
