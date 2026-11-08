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
