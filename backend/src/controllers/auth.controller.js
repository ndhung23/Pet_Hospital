const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const { successResponse } = require('../utils/response');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const REFRESH_COOKIE_NAME = 'phms_refresh_token';

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

/**
 * UC-AUTH-01: Register Account
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 200, result.message, { email: result.email });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-01: Verify Registration OTP
 */
const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyRegisterOtp(req.body);
    return successResponse(
      res,
      201,
      'Account successfully registered and activated. Please log in.',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
const resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendOtp(req.body);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-02: Login (RBAC)
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login({ identifier, password });

    setRefreshCookie(res, result.refreshToken);

    return successResponse(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token
 */
const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      return next(new AppError('No refresh token provided', 401));
    }

    const rotated = await tokenService.verifyAndRotateRefreshToken(rawRefreshToken);
    if (!rotated) {
      clearRefreshCookie(res);
      return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
    }

    setRefreshCookie(res, rotated.refreshToken);

    return successResponse(res, 200, 'Token refreshed successfully', {
      user: {
        id: rotated.user.id,
        userName: rotated.user.userName,
        email: rotated.user.email,
        fullName: rotated.user.fullName,
        phone: rotated.user.phone,
        role: rotated.user.role,
      },
      accessToken: rotated.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-02: Logout
 */
const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (rawRefreshToken) {
      await tokenService.revokeRefreshToken(rawRefreshToken);
    }
    clearRefreshCookie(res);
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-03: Forgot Password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-03: Reset Password via OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    clearRefreshCookie(res);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
