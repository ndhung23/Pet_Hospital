/**
 * File: AppError.js
 * Module: Operational Application Error Class
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Custom Error class supporting status code, operational flag, error code, and detailed field validations.
 */

class AppError extends Error {
  constructor(message, statusCode, details = null, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    this.code = code || `ERR_${statusCode}`;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
