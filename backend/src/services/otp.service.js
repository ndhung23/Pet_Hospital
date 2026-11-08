const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Generate a secure 6-digit numeric OTP code
 */
const generate6DigitCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Create and persist an OTP token in DB
 */
const createOtp = async ({ email, purpose, payload = null }) => {
  // Invalidate any existing unused OTPs for this email and purpose
  await prisma.otpToken.updateMany({
    where: {
      email,
      purpose,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const rawCode = generate6DigitCode();
  const codeHash = await bcrypt.hash(rawCode, 10);

  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.otpToken.create({
    data: {
      email,
      purpose,
      codeHash,
      payload: payload ? payload : undefined,
      expiresAt,
    },
  });

  return rawCode;
};

/**
 * Verify OTP code
 */
const verifyOtp = async ({ email, purpose, code }) => {
  const tokenRecord = await prisma.otpToken.findFirst({
    where: {
      email,
      purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!tokenRecord) {
    throw new AppError('Invalid or expired OTP code', 400);
  }

  // Check expiration (5 minutes TTL)
  if (new Date() > tokenRecord.expiresAt) {
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });
    throw new AppError('Invalid or expired OTP code', 400);
  }

  // Check maximum attempts to prevent brute-force
  if (tokenRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });
    throw new AppError('Too many failed attempts. Please request a new OTP code.', 400);
  }

  const isMatch = await bcrypt.compare(code, tokenRecord.codeHash);
  if (!isMatch) {
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { attempts: tokenRecord.attempts + 1 },
    });
    throw new AppError('Invalid or expired OTP code', 400);
  }

  // Mark as consumed
  await prisma.otpToken.update({
    where: { id: tokenRecord.id },
    data: { consumedAt: new Date() },
  });

  return tokenRecord;
};

module.exports = {
  createOtp,
  verifyOtp,
};
