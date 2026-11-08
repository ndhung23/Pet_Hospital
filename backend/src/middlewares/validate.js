const AppError = require('../utils/AppError');

/**
 * Middleware factory to validate request body/query/params using Zod schemas
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message);
        return next(new AppError(errorMessages[0] || 'Validation error', 400, parsed.error.format()));
      }
      req[source] = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
