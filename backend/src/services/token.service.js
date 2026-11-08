const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const prisma = require('../config/prisma');

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate Access Token (short-lived, 15m)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      userName: user.userName,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );
};

/**
 * Generate Refresh Token and persist hash to database
 */
const generateRefreshToken = async (user) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
};

/**
 * Verify and rotate refresh token
 */
const verifyAndRotateRefreshToken = async (rawRefreshToken) => {
  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken) {
    return null;
  }

  // If already revoked or expired
  if (storedToken.revokedAt || new Date() > storedToken.expiresAt) {
    return null;
  }

  // Revoke current refresh token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Check if user is still active
  if (!storedToken.user || !storedToken.user.isActive) {
    return null;
  }

  // Issue new access and refresh tokens
  const newAccessToken = generateAccessToken(storedToken.user);
  const newRefreshToken = await generateRefreshToken(storedToken.user);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: storedToken.user,
  };
};

/**
 * Revoke specific refresh token (used on logout)
 */
const revokeRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Revoke all refresh tokens for a user (used on password reset or account lock)
 */
const revokeAllUserRefreshTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAndRotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
