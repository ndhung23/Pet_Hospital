// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Common ICD-Vet standard diagnoses for clinical reference
 */
const ICD_VET_CATALOG = [
  { code: 'K9-GE-01', name: 'Acute Canine Gastroenteritis', category: 'Digestive' },
  { code: 'FE-URI-02', name: 'Feline Upper Respiratory Infection (URI)', category: 'Respiratory' },
  { code: 'K9-DERM-04', name: 'Canine Atopic Dermatitis & Pyoderma', category: 'Dermatology' },
  { code: 'GEN-PAR-01', name: 'Internal Parasite Infestation (Endoparasitism)', category: 'Parasitology' },
  { code: 'K9-OTIS-03', name: 'Otitis Externa (Bacterial / Malassezia)', category: 'Ears & Eyes' },
  { code: 'GEN-TRM-05', name: 'Soft Tissue Trauma / Laceration', category: 'Surgery' },
  { code: 'FE-FLUTD-01', name: 'Feline Lower Urinary Tract Disease', category: 'Urology' },
  { code: 'GEN-DENT-02', name: 'Periodontal Disease Grade 1-2', category: 'Dental' },
];

/**
 * Get catalog of ICD-Vet diagnoses
 */
const getDiagnosisCatalog = () => {
  return ICD_VET_CATALOG;
};

/**
 * Get list of patients (pets) for examination selection
 */
const getPatients = async (search = '') => {
  const where = {};
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { species: { contains: s, mode: 'insensitive' } },
      { breed: { contains: s, mode: 'insensitive' } },
      { owner: { user: { fullName: { contains: s, mode: 'insensitive' } } } },
      { owner: { user: { phone: { contains: s, mode: 'insensitive' } } } },
    ];
  }

  const pets = await prisma.pet.findMany({
    where,
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
      _count: {
        select: {
          medicalRecords: true,
          labOrders: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return pets;
};

/**
 * EMR-02: View Medical Record List
 * Chronologically ordered medical records.
 * Pet owners only see their own pets' records.
 */
const getMedicalRecords = async (user, filters = {}) => {
  const { petId, search, status } = filters;
  const where = {};

  // RBAC isolation: Pet owner can only view their own pets
  if (user.role === 'PET_OWNER') {
    where.pet = {
      ownerId: user.id,
    };
  }

  if (petId) {
    where.petId = petId;
  }

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { diagnosis: { contains: s, mode: 'insensitive' } },
      { treatmentPlan: { contains: s, mode: 'insensitive' } },
      { symptoms: { contains: s, mode: 'insensitive' } },
      { pet: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }

  const records = await prisma.medicalRecord.findMany({
    where,
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          gender: true,
          weight: true,
          dob: true,
          owner: {
            select: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      vet: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
      _count: {
        select: {
          labOrders: true,
          prescriptions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return records;
};

/**
 * EMR-03: View Medical Record Detail
 * Opens full medical encounter including diagnoses, vital signs, lab results, prescriptions.
 */
const getMedicalRecordById = async (id, user) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
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
      vet: {
        select: {
          id: true,
          fullName: true,
          role: true,
          employee: {
            select: {
              empCode: true,
              department: true,
            },
          },
        },
      },
      prescriptions: {
        orderBy: { createdAt: 'asc' },
      },
      labOrders: {
        include: {
          nurse: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
          vet: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  // Security check: Pet Owner can only view their own pet's records
  if (user.role === 'PET_OWNER' && record.pet.ownerId !== user.id) {
    throw new AppError('Forbidden: You are not authorized to access this medical record.', 403);
  }

  return record;
};

/**
 * EMR-01: Conduct Examination & EMR
 * Records clinical findings, vital signs, diagnoses, treatment plan, and optional lab/prescriptions.
 */
const conductExamination = async (vetId, data) => {
  const {
    petId,
    weight,
    temperature,
    heartRate,
    symptoms,
    diagnosis,
    treatmentPlan,
    status = 'EXAMINATION_COMPLETED',
    labOrders = [],
    prescriptions = [],
  } = data;

  // Verify pet exists
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!pet) {
    throw new AppError('Patient pet not found.', 404);
  }

  // Determine initial status: if lab orders are placed, status transitions to WAITING_LAB_RESULT (Alternative Flow 3.1)
  const initialStatus = labOrders.length > 0 ? 'WAITING_LAB_RESULT' : status;

  // Execute in database transaction
  const record = await prisma.$transaction(async (tx) => {
    // 1. Create medical record
    const newRecord = await tx.medicalRecord.create({
      data: {
        petId,
        vetId,
        weight,
        temperature,
        heartRate,
        symptoms,
        diagnosis,
        treatmentPlan,
        status: initialStatus,
      },
    });

    // 2. Update pet current weight with latest measurement
    if (weight) {
      await tx.pet.update({
        where: { id: petId },
        data: { weight },
      });
    }

    // 3. Create inline lab test orders if requested (UC-LAB-01)
    if (labOrders.length > 0) {
      for (let i = 0; i < labOrders.length; i++) {
        const order = labOrders[i];
        const orderCode = `LAB-${Date.now().toString().slice(-6)}-${i + 1}`;
        await tx.labOrder.create({
          data: {
            orderCode,
            recordId: newRecord.id,
            petId,
            vetId,
            testType: order.testType,
            urgency: order.urgency || 'ROUTINE',
            requestNote: order.requestNote || null,
            status: 'PENDING',
          },
        });
      }
    }

    // 4. Create prescriptions if prescribed (UC-PRES-01)
    if (prescriptions.length > 0) {
      for (const item of prescriptions) {
        await tx.prescription.create({
          data: {
            recordId: newRecord.id,
            medicineName: item.medicineName,
            dosage: item.dosage,
            quantity: item.quantity || 1,
            unit: item.unit || 'viên',
            duration: item.duration || null,
            instructions: item.instructions || null,
          },
        });
      }
    }

    return newRecord;
  });

  // Return complete fresh record with relations
  return getMedicalRecordById(record.id, { role: 'VETERINARIAN', id: vetId });
};

/**
 * Update Medical Record (with 24h immutability check)
 */
const updateMedicalRecord = async (recordId, vetId, updateData) => {
  const existing = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
  });

  if (!existing) {
    throw new AppError('Medical record not found.', 404);
  }

  // Business Rule: EMR Immutability (records are locked for editing 24h after creation)
  const ageInHours = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageInHours > 24) {
    throw new AppError('EMR Immutability rule: Medical records are locked and cannot be edited 24h after completion.', 403);
  }

  const updated = await prisma.medicalRecord.update({
    where: { id: recordId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return getMedicalRecordById(updated.id, { role: 'VETERINARIAN', id: vetId });
};

module.exports = {
  getDiagnosisCatalog,
  getPatients,
  getMedicalRecords,
  getMedicalRecordById,
  conductExamination,
  updateMedicalRecord,
};

