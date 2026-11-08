const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const { validatePasswordComplexity } = require('../utils/password');
const otpService = require('./otp.service');
const emailService = require('./email.service');
const tokenService = require('./token.service');

/**
 * UC-AUTH-01: Initiate Registration
 */
const register = async (data) => {
  const { fullName, userName, email, phone, address, password } = data;

  // Validate Password Complexity (BR-10)
  const passwordCheck = validatePasswordComplexity(password, userName);
  if (!passwordCheck.isValid) {
    throw new AppError(passwordCheck.message, 400);
  }

  // Check unique constraints for username, email, and phone
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userName }, { email }, { phone }],
    },
  });

  if (existingUser) {
    if (existingUser.userName === userName || existingUser.email === email) {
      throw new AppError('Email or username is already registered', 409);
    }
    if (existingUser.phone === phone) {
      throw new AppError('Phone number or Email is already in use', 409);
    }
  }

  // Cryptographically hash password (BR-01, cost factor >= 10)
  const passwordHash = await bcrypt.hash(password, 10);

  // Store registration payload in OtpToken record until verified
  const payload = {
    fullName,
    userName,
    email,
    phone,
    address: address || null,
    passwordHash,
  };

  const otpCode = await otpService.createOtp({
    email,
    purpose: 'REGISTER',
    payload,
  });

  await emailService.sendOtpEmail(email, otpCode, 'REGISTER');

  console.log(`\n======================================================`);
  console.log(`[AUTH SERVICE OTP] Email: ${email} | Code: ${otpCode} | Purpose: REGISTER`);
  console.log(`======================================================\n`);

  return {
    email,
    message: 'Verification OTP sent to your email address.',
    devOtp: env.NODE_ENV === 'development' ? otpCode : undefined,
  };
};

/**
 * UC-AUTH-01: Verify Registration OTP & activate user account
 */
const verifyRegisterOtp = async ({ email, otp }) => {
  const otpRecord = await otpService.verifyOtp({
    email,
    purpose: 'REGISTER',
    code: otp,
  });

  if (!otpRecord.payload) {
    throw new AppError('Registration session expired. Please register again.', 400);
  }

  const { fullName, userName, phone, address, passwordHash } = otpRecord.payload;

  // Final race-condition check before inserting
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userName }, { email }, { phone }],
    },
  });

  if (existingUser) {
    throw new AppError('Email or username is already registered', 409);
  }

  // Transaction: Create User with PET_OWNER role and linked PetOwner profile
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        userName,
        email,
        passwordHash,
        fullName,
        phone,
        role: 'PET_OWNER',
        isActive: true,
      },
    });

    await tx.petOwner.create({
      data: {
        userId: user.id,
        address: address || null,
      },
    });

    return user;
  });

  return {
    userId: newUser.id,
    userName: newUser.userName,
    email: newUser.email,
    role: newUser.role,
  };
};

/**
 * Resend OTP code for REGISTER or RESET_PASSWORD
 */
const resendOtp = async ({ email, purpose }) => {
  let dispatchedCode = null;

  if (purpose === 'REGISTER') {
    // Check if there is an unconsumed registration payload
    const existingOtp = await prisma.otpToken.findFirst({
      where: { email, purpose: 'REGISTER', consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingOtp || !existingOtp.payload) {
      throw new AppError('No pending registration found for this email. Please register again.', 404);
    }

    const newCode = await otpService.createOtp({
      email,
      purpose: 'REGISTER',
      payload: existingOtp.payload,
    });

    await emailService.sendOtpEmail(email, newCode, 'REGISTER');
    dispatchedCode = newCode;
  } else if (purpose === 'RESET_PASSWORD') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('No account found with this email address', 404);
    }

    const newCode = await otpService.createOtp({
      email,
      purpose: 'RESET_PASSWORD',
    });

    await emailService.sendOtpEmail(email, newCode, 'RESET_PASSWORD');
    dispatchedCode = newCode;
  }

  console.log(`\n======================================================`);
  console.log(`[AUTH SERVICE OTP RESEND] Email: ${email} | Code: ${dispatchedCode} | Purpose: ${purpose}`);
  console.log(`======================================================\n`);

  return {
    message: 'A new OTP code has been sent to your email.',
    devOtp: env.NODE_ENV === 'development' ? dispatchedCode : undefined,
  };
};

/**
 * UC-AUTH-02: Login / Logout (RBAC)
 */
const login = async ({ identifier, password }) => {
  // Support login via either username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ userName: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  // Account active status check
  if (!user.isActive) {
    throw new AppError('Your account has been locked or deactivated. Please contact the Clinic Manager', 403);
  }

  // Compare input password against BCrypt hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid username or password', 401);
  }

  // Generate tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * UC-AUTH-03: Forgot Password - Dispatch OTP
 */
const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('No account found with this email address', 404);
  }

  const otpCode = await otpService.createOtp({
    email,
    purpose: 'RESET_PASSWORD',
  });

  await emailService.sendOtpEmail(email, otpCode, 'RESET_PASSWORD');

  console.log(`\n======================================================`);
  console.log(`[AUTH SERVICE OTP] Email: ${email} | Code: ${otpCode} | Purpose: RESET_PASSWORD`);
  console.log(`======================================================\n`);

  return {
    message: 'Password reset OTP has been dispatched to your email.',
    devOtp: env.NODE_ENV === 'development' ? otpCode : undefined,
  };
};

/**
 * UC-AUTH-03: Reset Password via OTP
 */
const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('No account found with this email address', 404);
  }

  // Validate password complexity rules (BR-10)
  const passwordCheck = validatePasswordComplexity(newPassword, user.userName);
  if (!passwordCheck.isValid) {
    throw new AppError(passwordCheck.message, 400);
  }

  // Verify OTP
  await otpService.verifyOtp({
    email,
    purpose: 'RESET_PASSWORD',
    code: otp,
  });

  // Cryptographically hash new password using BCrypt (cost >= 10, BR-01)
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password in database
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  // Revoke all existing active refresh tokens for this user
  await tokenService.revokeAllUserRefreshTokens(user.id);

  return { message: 'Password has been successfully reset. Please log in with your new password.' };
};

module.exports = {
  register,
  verifyRegisterOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
};
