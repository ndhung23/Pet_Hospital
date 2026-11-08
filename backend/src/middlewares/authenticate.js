const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Middleware: Authenticate User
 * Supports simulated header authentication (x-user-id, x-user-role) for module decoupling
 * and standard Bearer JWT Access Token for production.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Simulated authentication via headers (as required by SWD392 modular assignment)
    const simulatedUserId = req.headers['x-user-id'];
    if (simulatedUserId) {
      const simulatedRole = req.headers['x-user-role'] || 'PET_OWNER';
      const simulatedEmail = req.headers['x-user-email'] || `${simulatedUserId}@phms.local`;

      req.user = {
        id: simulatedUserId,
        role: simulatedRole,
        email: simulatedEmail,
        userName: simulatedUserId,
        fullName: simulatedRole === 'RECEPTIONIST' ? 'Receptionist Staff' : 'Pet Owner Client',
        isActive: true,
      };
      return next();
    }

    // 2. Standard JWT Bearer token authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing token or x-user-id header.', 401, null, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Session expired, please log in again', 401, null, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid authentication token.', 401, null, 'INVALID_TOKEN'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        userName: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return next(new AppError('User account not found.', 401, null, 'USER_NOT_FOUND'));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been locked or deactivated. Please contact the Clinic Manager', 403, null, 'ACCOUNT_LOCKED'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
