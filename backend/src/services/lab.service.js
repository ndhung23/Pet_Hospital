// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Standard Laboratory Diagnostic Test Catalog
 */
const LAB_CATALOG = [
  {
    type: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    slaRoutine: '24 hours',
    slaUrgent: '2 hours',
    parameters: [
      { name: 'WBC (White Blood Cells)', unit: '10^9/L', refRange: '6.0 - 17.0' },
      { name: 'RBC (Red Blood Cells)', unit: '10^12/L', refRange: '5.5 - 8.5' },
      { name: 'HGB (Hemoglobin)', unit: 'g/dL', refRange: '12.0 - 18.0' },
      { name: 'HCT (Hematocrit)', unit: '%', refRange: '37.0 - 55.0' },
      { name: 'PLT (Platelets)', unit: '10^9/L', refRange: '200 - 500' },
    ],
  },
  {
    type: 'Biochemical Profile (Liver & Kidney)',
    category: 'Clinical Chemistry',
    slaRoutine: '24 hours',
    slaUrgent: '2 hours',
    parameters: [
      { name: 'ALT (Alanine Aminotransferase)', unit: 'U/L', refRange: '10 - 100' },
      { name: 'AST (Aspartate Aminotransferase)', unit: 'U/L', refRange: '10 - 50' },
      { name: 'BUN (Blood Urea Nitrogen)', unit: 'mg/dL', refRange: '7.0 - 27.0' },
      { name: 'CREA (Creatinine)', unit: 'mg/dL', refRange: '0.5 - 1.8' },
      { name: 'GLU (Glucose)', unit: 'mg/dL', refRange: '74 - 143' },
    ],
  },
  {
    type: 'Digital X-Ray Radiography',
    category: 'Diagnostic Imaging',
    slaRoutine: '24 hours',
    slaUrgent: '1 hour',
    parameters: [
      { name: 'Region / Views', unit: 'Text', refRange: 'Thorax / Abdomen / Orthopedic' },
      { name: 'Radiological Findings', unit: 'Text', refRange: 'No bone fracture / No foreign body' },
    ],
  },
  {
    type: 'Abdominal Ultrasound',
    category: 'Diagnostic Imaging',
    slaRoutine: '24 hours',
    slaUrgent: '1 hour',
    parameters: [
      { name: 'Organ Survey', unit: 'Text', refRange: 'Normal parenchyma, no free abdominal fluid' },
    ],
  },
  {
    type: 'Urinalysis & Sedimentation',
    category: 'Clinical Pathology',
    slaRoutine: '24 hours',
    slaUrgent: '2 hours',
    parameters: [
      { name: 'Specific Gravity', unit: 'Ratio', refRange: '1.015 - 1.045' },
      { name: 'pH', unit: 'pH', refRange: '5.5 - 7.5' },
      { name: 'Protein', unit: 'mg/dL', refRange: 'Negative / Trace' },
      { name: 'Microscopic Sediment', unit: 'HPF', refRange: 'Occasional RBC/WBC, no struvite crystals' },
    ],
  },
  {
    type: 'Canine Parvovirus (CPV) Antigen Rapid Test',
    category: 'Immunology',
    slaRoutine: '2 hours',
    slaUrgent: '30 mins',
    parameters: [
      { name: 'CPV Antigen Result', unit: 'Qualitative', refRange: 'Negative (-)' },
    ],
  },
  {
    type: 'Skin Scraping & Fungal Microscopy',
    category: 'Microbiology',
    slaRoutine: '24 hours',
    slaUrgent: '2 hours',
    parameters: [
      { name: 'Microscopic Observation', unit: 'Qualitative', refRange: 'No Demodex / Sarcoptes mites seen' },
    ],
  },
];

/**
 * Get Lab Catalog
 */
const getCatalog = () => {
  return LAB_CATALOG;
};

/**
 * LAB-02: View Lab Orders Queue
 * Sorted by urgency (URGENT first) and submission time.
 */
const getLabOrders = async (user, filters = {}) => {
  const { status, urgency, search, petId, recordId } = filters;
  const where = {};

  if (user.role === 'PET_OWNER') {
    where.pet = {
      ownerId: user.id,
    };
  }

  if (status) {
    where.status = status;
  }

  if (urgency) {
    where.urgency = urgency;
  }

  if (petId) {
    where.petId = petId;
  }

  if (recordId) {
    where.recordId = recordId;
  }

  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { orderCode: { contains: s, mode: 'insensitive' } },
      { testType: { contains: s, mode: 'insensitive' } },
      { pet: { name: { contains: s, mode: 'insensitive' } } },
      { pet: { breed: { contains: s, mode: 'insensitive' } } },
    ];
  }

  // Query database: order by urgency (URGENT placed at top per BR-04 / normal flow step 2), then createdAt desc
  const orders = await prisma.labOrder.findMany({
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
        },
      },
      nurse: {
        select: {
          id: true,
          fullName: true,
        },
      },
      medicalRecord: {
        select: {
          id: true,
          diagnosis: true,
          status: true,
        },
      },
    },
    orderBy: [
      { urgency: 'desc' }, // 'URGENT' alphabetically comes before 'ROUTINE', so 'desc' puts 'URGENT' first!
      { createdAt: 'desc' },
    ],
  });

  return orders;
};

/**
 * Get Lab Order Details
 */
const getLabOrderById = async (id, user) => {
  const order = await prisma.labOrder.findUnique({
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
          employee: {
            select: {
              empCode: true,
              department: true,
            },
          },
        },
      },
      nurse: {
        select: {
          id: true,
          fullName: true,
          employee: {
            select: {
              empCode: true,
              department: true,
            },
          },
        },
      },
      medicalRecord: {
        select: {
          id: true,
          diagnosis: true,
          treatmentPlan: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Lab order not found.', 404);
  }

  if (user.role === 'PET_OWNER' && order.pet.ownerId !== user.id) {
    throw new AppError('Forbidden: You are not authorized to view this lab order.', 403);
  }

  return order;
};

/**
 * LAB-01: Issue Paraclinical Lab Order
 * Veterinarian creates a lab order linked to active medical record.
 */
const issueLabOrder = async (vetId, data) => {
  const { recordId, petId, testType, urgency = 'ROUTINE', requestNote } = data;

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    throw new AppError('Associated medical record not found.', 404);
  }

  const targetPetId = petId || record.petId;
  const orderCode = `LAB-${Date.now().toString().slice(-6)}`;

  const createdOrder = await prisma.$transaction(async (tx) => {
    // 1. Create the lab order
    const order = await tx.labOrder.create({
      data: {
        orderCode,
        recordId,
        petId: targetPetId,
        vetId,
        testType,
        urgency,
        requestNote: requestNote || null,
        status: 'PENDING',
      },
    });

    // 2. Set medical record status to WAITING_LAB_RESULT (Alternative flow 3.1)
    await tx.medicalRecord.update({
      where: { id: recordId },
      data: { status: 'WAITING_LAB_RESULT' },
    });

    return order;
  });

  return getLabOrderById(createdOrder.id, { role: 'VETERINARIAN', id: vetId });
};

/**
 * LAB-02: Process Lab Order & Results
 * Nurse/Technician starts test, saves draft, or submits results with validation.
 */
const processLabOrder = async (nurseId, orderId, data) => {
  const { status, resultValues, resultSummary, resultImageUrl, sampleTakenAt } = data;

  const existingOrder = await prisma.labOrder.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError('Lab order not found.', 404);
  }

  const updatePayload = {
    nurseId,
    ...(status && { status }),
    ...(resultValues !== undefined && { resultValues }),
    ...(resultSummary !== undefined && { resultSummary }),
    ...(resultImageUrl !== undefined && { resultImageUrl }),
    ...(sampleTakenAt && { sampleTakenAt: new Date(sampleTakenAt) }),
  };

  // If status is transitioning to IN_PROGRESS and sampleTakenAt not set, timestamp it
  if (status === 'IN_PROGRESS' && !existingOrder.sampleTakenAt) {
    updatePayload.sampleTakenAt = new Date();
  }

  // If status is transitioning to COMPLETED, timestamp completedAt
  if (status === 'COMPLETED') {
    updatePayload.completedAt = new Date();
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.labOrder.update({
      where: { id: orderId },
      data: updatePayload,
    });

    // When this order is COMPLETED, check if all other lab tests for this medical record are also completed
    if (status === 'COMPLETED') {
      const remainingPending = await tx.labOrder.count({
        where: {
          recordId: order.recordId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          id: { not: orderId },
        },
      });

      // If no pending lab orders remain, update EMR status to EXAMINATION_COMPLETED
      if (remainingPending === 0) {
        await tx.medicalRecord.update({
          where: { id: order.recordId },
          data: { status: 'EXAMINATION_COMPLETED' },
        });
      }
    }

    return order;
  });

  return getLabOrderById(updatedOrder.id, { role: 'NURSE', id: nurseId });
};

module.exports = {
  getCatalog,
  getLabOrders,
  getLabOrderById,
  issueLabOrder,
  processLabOrder,
};

