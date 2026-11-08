const AppError = require('../utils/AppError');

/**
 * Replace a request property with the parsed value.
 *
 * Express 5 defines `req.params` (and `req.query`) as getter-only properties on
 * the request prototype, so a plain `req[source] = parsed.data` assignment
 * silently does nothing outside strict mode. Defining an own property shadows
 * the prototype getter and actually takes effect.
 */
const replaceRequestProperty = (req, source, value) => {
  try {
    Object.defineProperty(req, source, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (error) {
    // Last resort for exotic request objects
    req[source] = value;
  }
};

/**
 * Middleware factory to validate request body/query/params using Zod schemas.
 *
 * The parsed (and therefore coerced/transformed) value replaces the raw input,
 * so downstream handlers always see normalised data — e.g. `date` arrives as a
 * Date, not a string.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message);
        return next(new AppError(errorMessages[0] || 'Validation error', 400, parsed.error.format()));
      }
      replaceRequestProperty(req, source, parsed.data);
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
