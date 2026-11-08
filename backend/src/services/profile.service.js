const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * UC-AUTH-04: View Profile
 */
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userName: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      petOwner: {
        select: {
          address: true,
          pets: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              gender: true,
              dob: true,
              weight: true,
            },
          },
        },
      },
      employee: {
        select: {
          empCode: true,
          department: true,
          salary: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  return user;
};

/**
 * UC-AUTH-05: Update Profile
 * Note: RBAC role, employee salary, and employee code (empCode) are read-only and cannot be self-modified.
 */
const updateUserProfile = async (userId, updateData) => {
  const { fullName, phone, email, address } = updateData;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { petOwner: true, employee: true },
  });

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  // Check uniqueness if email or phone is changing
  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existingEmail) {
      throw new AppError('Phone number or Email is already in use', 409);
    }
  }

  if (phone && phone !== user.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    });
    if (existingPhone) {
      throw new AppError('Phone number or Email is already in use', 409);
    }
  }

  // Persist updates in transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(email && { email }),
      },
      select: {
        id: true,
        userName: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user.role === 'PET_OWNER') {
      await tx.petOwner.upsert({
        where: { userId },
        create: {
          userId,
          address: address || null,
        },
        update: {
          ...(address !== undefined && { address: address || null }),
        },
      });
    }

    return updated;
  });

  return getUserProfile(updatedUser.id);
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
