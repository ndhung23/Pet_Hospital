const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Get active on-duty Veterinarians and on-call Clinic Managers
 */
const getOnDutyVets = async () => {
  const vets = await prisma.user.findMany({
    where: {
      role: 'VETERINARIAN',
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      phone: true,
      employee: {
        select: {
          empCode: true,
          department: true,
        },
      },
    },
  });

  const onCallManagers = await prisma.user.findMany({
    where: {
      role: 'CLINIC_MANAGER',
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      phone: true,
      employee: {
        select: {
          empCode: true,
          department: true,
        },
      },
    },
  });

  return {
    vets,
    onCallManagers,
  };
};

/**
 * Search existing Pet Owner and their pets by phone, email, or name
 */
const searchOwnerOrPet = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const trimmed = query.trim();

  return prisma.user.findMany({
    where: {
      role: 'PET_OWNER',
      OR: [
        { phone: { contains: trimmed, mode: 'insensitive' } },
        { email: { contains: trimmed, mode: 'insensitive' } },
        { fullName: { contains: trimmed, mode: 'insensitive' } },
        { userName: { contains: trimmed, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      petOwner: {
        select: {
          address: true,
          pets: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              weight: true,
            },
          },
        },
      },
    },
    take: 10,
  });
};

/**
 * UC-EMG-01: Emergency Triage Intake
 * Registers walk-in emergency cases, evaluates severity (Level 1-3), and routes to priority vet queue
 */
const createEmergencyTriage = async (receptionistUser, data) => {
  const {
    ownerMode,
    ownerPhone,
    ownerName,
    petId,
    petName,
    species,
    breed,
    weight,
    conditionLevel,
    initialSymptoms,
    vetId,
  } = data;

  // 1. Resolve Duty Vet or On-Call Manager (Exception 2.0.E1)
  let assignedVetId = vetId;

  if (!assignedVetId) {
    const defaultVet = await prisma.user.findFirst({
      where: { role: 'VETERINARIAN', isActive: true },
    });

    if (defaultVet) {
      assignedVetId = defaultVet.id;
    } else {
      const onCallManager = await prisma.user.findFirst({
        where: { role: 'CLINIC_MANAGER', isActive: true },
      });
      if (!onCallManager) {
        throw new AppError('No Vet on Duty and no on-call Clinic Manager available.', 400);
      }
      assignedVetId = onCallManager.id;
    }
  }

  // 2. Resolve Pet & PetOwner inside Database Transaction
  const result = await prisma.$transaction(async (tx) => {
    let targetPetId = petId;

    if (ownerMode === 'ANONYMOUS') {
      // Alternative Flow 2.1: Anonymous Emergency Owner
      const timestamp = Date.now().toString();
      const tempUsername = `anon_${timestamp.slice(-6)}`;
      const tempEmail = `emergency_${timestamp.slice(-6)}@phms.local`;
      const tempPhone = `09${timestamp.slice(-8)}`;
      const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      const tempUser = await tx.user.create({
        data: {
          userName: tempUsername,
          email: tempEmail,
          fullName: ownerName?.trim() || 'Anonymous Emergency Owner',
          phone: tempPhone,
          passwordHash: randomPasswordHash,
          role: 'PET_OWNER',
          isActive: true,
          petOwner: {
            create: {
              address: 'Walk-in Emergency Intake (Unregistered)',
            },
          },
        },
        include: { petOwner: true },
      });

      const tempPet = await tx.pet.create({
        data: {
          ownerId: tempUser.id,
          name: petName || 'Emergency Patient',
          species: species || 'Canine/Feline',
          breed: breed || 'Unknown',
          weight: weight ? parseFloat(weight) : null,
          history: 'Unscheduled walk-in emergency intake',
        },
      });

      targetPetId = tempPet.id;
    } else {
      // REGISTERED OWNER
      if (!targetPetId) {
        let existingUser = null;
        if (ownerPhone) {
          existingUser = await tx.user.findUnique({
            where: { phone: ownerPhone },
            include: { petOwner: true },
          });
        }

        if (!existingUser) {
          throw new AppError('Registered Pet Owner not found. Please verify phone number or select Anonymous Emergency Owner.', 404);
        }

        const newPet = await tx.pet.create({
          data: {
            ownerId: existingUser.id,
            name: petName,
            species: species,
            breed: breed || null,
            weight: weight ? parseFloat(weight) : null,
            history: 'Registered via Emergency Walk-In',
          },
        });

        targetPetId = newPet.id;
      }
    }

    // 3. Create Appointment (status = EMERGENCY_WAITING, type = EMERGENCY)
    const appointment = await tx.appointment.create({
      data: {
        petId: targetPetId,
        recepId: receptionistUser.id,
        vetId: assignedVetId,
        startTime: new Date(),
        status: 'EMERGENCY_WAITING',
        type: 'EMERGENCY',
        notes: `Emergency Triage: [${conditionLevel}] - ${initialSymptoms}`,
      },
    });

    // 4. Create TriageRecord
    const triageRecord = await tx.triageRecord.create({
      data: {
        appId: appointment.id,
        recepId: receptionistUser.id,
        conditionLevel,
        initialSymptoms,
        triageTime: new Date(),
      },
    });

    return {
      appointment,
      triageRecord,
    };
  });

  // Query updated emergency encounter with complete relation details
  const encounter = await prisma.appointment.findUnique({
    where: { id: result.appointment.id },
    include: {
      triageRecord: true,
      pet: {
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      veterinarian: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
      receptionist: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return encounter;
};

/**
 * Retrieve Active Emergency Queue with Priority Overriding (BR-04)
 * Priority 1: LEVEL_1_CRITICAL (Position #1, interrupts routine, ordered by triageTime asc)
 * Priority 2: LEVEL_2_URGENT (Position #2, 15-min SLA, ordered by triageTime asc)
 * Priority 3: LEVEL_3_STANDARD (FIFO, 30-min reminder)
 */
const getEmergencyQueue = async (vetId = null) => {
  const appointments = await prisma.appointment.findMany({
    where: {
      type: 'EMERGENCY',
      status: { in: ['EMERGENCY_WAITING', 'IN_EXAMINATION'] },
      ...(vetId && { vetId }),
    },
    include: {
      triageRecord: true,
      pet: {
        include: {
          owner: {
            include: {
              user: {
                select: {
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      veterinarian: {
        select: {
          id: true,
          fullName: true,
        },
      },
      receptionist: {
        select: {
          fullName: true,
        },
      },
    },
  });

  // Compute Priority Weight according to BR-04
  const getSeverityWeight = (level) => {
    switch (level) {
      case 'LEVEL_1_CRITICAL':
        return 1;
      case 'LEVEL_2_URGENT':
        return 2;
      case 'LEVEL_3_STANDARD':
        return 3;
      default:
        return 4;
    }
  };

  const sortedQueue = appointments.sort((a, b) => {
    // If one is IN_EXAMINATION and one is EMERGENCY_WAITING:
    // Ongoing IN_EXAMINATION stays active unless Level 1 interrupts
    if (a.status === 'IN_EXAMINATION' && b.status !== 'IN_EXAMINATION') return -1;
    if (b.status === 'IN_EXAMINATION' && a.status !== 'IN_EXAMINATION') return 1;

    const weightA = getSeverityWeight(a.triageRecord?.conditionLevel);
    const weightB = getSeverityWeight(b.triageRecord?.conditionLevel);

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // FIFO within the same severity level
    const timeA = new Date(a.triageRecord?.triageTime || a.createdAt).getTime();
    const timeB = new Date(b.triageRecord?.triageTime || b.createdAt).getTime();
    return timeA - timeB;
  });

  return sortedQueue.map((item, index) => ({
    ...item,
    priorityQueueNumber: index + 1,
  }));
};

/**
 * Veterinarian accepts emergency case and transitions status to IN_EXAMINATION
 */
const acceptEmergencyCase = async (vetUser, appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new AppError('Emergency appointment not found.', 404);
  }

  if (appointment.status !== 'EMERGENCY_WAITING') {
    throw new AppError(`Cannot accept case with current status: ${appointment.status}`, 400);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'IN_EXAMINATION',
      vetId: vetUser.id,
    },
    include: {
      triageRecord: true,
      pet: true,
      veterinarian: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return updated;
};

module.exports = {
  getOnDutyVets,
  searchOwnerOrPet,
  createEmergencyTriage,
  getEmergencyQueue,
  acceptEmergencyCase,
};
