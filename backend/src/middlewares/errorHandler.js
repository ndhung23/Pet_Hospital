/**
 * File: errorHandler.js
 * Module: Centralized Error Handler
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Global error handler formatting unified error responses with HTTP status, code, message, and details.
 */

const env = require('../config/env');

/**
 * Centralized Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  let code = err.code || `ERR_${statusCode}`;

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'SLOT_CONFLICT';
    message = 'The requested time slot has been booked concurrently by another user. Please select another slot.';
  }

  // Handle Prisma unique constraint violation error (P2002)
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'DUPLICATE_RECORD';
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `Duplicate value error on ${target}. Record already exists.`;
  }

  // Handle JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Session expired, please log in again';
  }

  if (env.NODE_ENV === 'development') {
    console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(details && { details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
