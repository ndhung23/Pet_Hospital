const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles - Allowed role enum values
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = authorize;
