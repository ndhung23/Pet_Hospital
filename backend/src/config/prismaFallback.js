const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Initial seeded entities in-memory
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

const USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    userName: 'vet1',
    email: 'vet@phms.local',
    fullName: 'Dr. John Watson (Senior Vet)',
    phone: '0901234569',
    passwordHash: defaultPasswordHash,
    role: 'VETERINARIAN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      userId: '11111111-1111-1111-1111-111111111111',
      empCode: 'EMP-VET-001',
      department: 'Clinical Medicine',
      salary: 28000000,
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    userName: 'nurse1',
    email: 'nurse@phms.local',
    fullName: 'David Miller (Vet Technician)',
    phone: '0901234570',
    passwordHash: defaultPasswordHash,
    role: 'NURSE',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      userId: '22222222-2222-2222-2222-222222222222',
      empCode: 'EMP-NUR-001',
      department: 'Inpatient & Lab Care',
      salary: 14000000,
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    userName: 'petowner1',
    email: 'petowner1@phms.local',
    fullName: 'Alice Johnson',
    phone: '0912345678',
    passwordHash: defaultPasswordHash,
    role: 'PET_OWNER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    petOwner: {
      userId: '33333333-3333-3333-3333-333333333333',
      address: '123 Nguyen Hue Blvd, District 1, HCMC',
    },
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    userName: 'manager',
    email: 'manager@phms.local',
    fullName: 'Dr. Sarah Connor (Clinic Manager)',
    phone: '0901234567',
    passwordHash: defaultPasswordHash,
    role: 'CLINIC_MANAGER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      userId: '44444444-4444-4444-4444-444444444444',
      empCode: 'EMP-MGR-001',
      department: 'Executive Administration',
      salary: 35000000,
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    userName: 'receptionist1',
    email: 'receptionist@phms.local',
    fullName: 'Emily Rose (Front Desk Receptionist)',
    phone: '0901234571',
    passwordHash: defaultPasswordHash,
    role: 'RECEPTIONIST',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: {
      userId: '55555555-5555-5555-5555-555555555555',
      empCode: 'EMP-REC-001',
      department: 'Customer Service & Front Desk',
      salary: 12000000,
    },
  },
];

const PETS = [
  {
    id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    ownerId: '33333333-3333-3333-3333-333333333333',
    name: 'Lucky',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    dob: new Date('2022-04-10'),
    weight: 28.5,
    history: 'Dị ứng kháng sinh nhóm Penicillin; tiêm phòng dại định kỳ T1/2026',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
    ownerId: '33333333-3333-3333-3333-333333333333',
    name: 'Miu',
    species: 'Cat',
    breed: 'British Shorthair (Mèo Anh lông ngắn)',
    gender: 'Female',
    dob: new Date('2023-08-15'),
    weight: 4.2,
    history: 'Đã triệt sản; tiền sử giảm tiểu cầu nhẹ T11/2025',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cccc3333-cccc-3333-cccc-333333333333',
    ownerId: '33333333-3333-3333-3333-333333333333',
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd (Becgie Đức)',
    gender: 'Male',
    dob: new Date('2021-01-20'),
    weight: 34.0,
    history: 'Viêm tai ngoài tái phát (Otitis Externa)',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const RECORD_ID_1 = 'eeee1111-eeee-1111-eeee-111111111111';
const MEDICAL_RECORDS = [
  {
    id: RECORD_ID_1,
    petId: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    vetId: '11111111-1111-1111-1111-111111111111',
    weight: 28.5,
    temperature: 38.6,
    heartRate: 115,
    symptoms: 'Bệnh nhân nôn ói 2 ngày gần đây, mệt mỏi, bỏ ăn sáng nay. Niêm mạc nhợt nhẹ, dấu hiệu mất nước nhẹ.',
    diagnosis: 'K9-GE-01: Acute Canine Gastroenteritis (Viêm dạ dày ruột cấp)',
    treatmentPlan: 'Truyền dịch dưới da Ringer Lactate 500ml, men vi sinh Probiotic 2 lần/ngày, ăn cháo loãng hoặc pate tiêu hóa 5 ngày.',
    status: 'EXAMINATION_COMPLETED',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18),
    updatedAt: new Date(),
  },
];

const PRESCRIPTIONS = [
  {
    id: 'pres-1',
    recordId: RECORD_ID_1,
    medicineName: 'Probiotic GI Support Paste',
    dosage: '3ml uống 2 lần/ngày',
    quantity: 1,
    unit: 'tuýp',
    duration: '5 ngày',
    instructions: 'Uống cùng thức ăn sáng và tối',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18),
    updatedAt: new Date(),
  },
  {
    id: 'pres-2',
    recordId: RECORD_ID_1,
    medicineName: 'Maropitant (Cerenia) 24mg',
    dosage: '1 viên uống 1 lần/ngày',
    quantity: 3,
    unit: 'viên',
    duration: '3 ngày',
    instructions: 'Uống trước khi ăn 1 giờ nếu vẫn còn buồn nôn',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18),
    updatedAt: new Date(),
  },
];

const LAB_ORDERS = [
  {
    id: 'lab-ord-1',
    orderCode: 'LAB-2026-0001',
    recordId: RECORD_ID_1,
    petId: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    vetId: '11111111-1111-1111-1111-111111111111',
    nurseId: '22222222-2222-2222-2222-222222222222',
    testType: 'Complete Blood Count (CBC)',
    urgency: 'ROUTINE',
    requestNote: 'Kiểm tra bạch cầu và cô đặc máu do nôn ói mất nước.',
    status: 'COMPLETED',
    resultValues: {
      WBC: { value: 12.8, unit: '10^9/L', refRange: '6.0 - 17.0', flag: 'NORMAL' },
      RBC: { value: 6.8, unit: '10^12/L', refRange: '5.5 - 8.5', flag: 'NORMAL' },
      HGB: { value: 16.2, unit: 'g/dL', refRange: '12.0 - 18.0', flag: 'NORMAL' },
      PLT: { value: 245, unit: '10^9/L', refRange: '200 - 500', flag: 'NORMAL' },
    },
    resultSummary: 'Công thức máu trong giới hạn bình thường. Tăng nhẹ hematocrit do mất nước, không có dấu hiệu nhiễm độc bạch cầu.',
    sampleTakenAt: new Date(Date.now() - 3600 * 1000 * 17),
    completedAt: new Date(Date.now() - 3600 * 1000 * 15),
    createdAt: new Date(Date.now() - 3600 * 1000 * 18),
    updatedAt: new Date(),
  },
  {
    id: 'lab-ord-2',
    orderCode: 'LAB-2026-0002',
    recordId: RECORD_ID_1,
    petId: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    vetId: '11111111-1111-1111-1111-111111111111',
    nurseId: null,
    testType: 'Digital X-Ray Radiography',
    urgency: 'URGENT',
    requestNote: 'Chụp X-quang ổ bụng 2 tư thế (Lateral / VD) loại trừ tắc ruột do nuốt dị vật. Ca khẩn cấp SLA 2h.',
    status: 'PENDING',
    resultValues: null,
    resultSummary: null,
    resultImageUrl: null,
    sampleTakenAt: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2),
    updatedAt: new Date(),
  },
  {
    id: 'lab-ord-3',
    orderCode: 'LAB-2026-0003',
    recordId: RECORD_ID_1,
    petId: 'bbbb2222-bbbb-2222-bbbb-222222222222',
    vetId: '11111111-1111-1111-1111-111111111111',
    nurseId: '22222222-2222-2222-2222-222222222222',
    testType: 'Biochemical Profile (Liver & Kidney)',
    urgency: 'URGENT',
    requestNote: 'Đánh giá men gan ALT, AST và chức năng thận BUN, Creatinine.',
    status: 'IN_PROGRESS',
    resultValues: {
      ALT: { value: 45, unit: 'U/L', refRange: '10 - 100', flag: 'NORMAL' },
      AST: { value: 32, unit: 'U/L', refRange: '10 - 50', flag: 'NORMAL' },
      BUN: { value: 18.5, unit: 'mg/dL', refRange: '7.0 - 27.0', flag: 'NORMAL' },
      CREA: { value: 1.1, unit: 'mg/dL', refRange: '0.5 - 1.8', flag: 'NORMAL' },
    },
    resultSummary: 'Đã hoàn thành bước phân tích huyết thanh, chờ kiểm tra lại điện giải.',
    sampleTakenAt: new Date(Date.now() - 3600 * 1000 * 1),
    completedAt: null,
    createdAt: new Date(Date.now() - 3600 * 1000 * 1),
    updatedAt: new Date(),
  },
];

const REFRESH_TOKENS = [];
const OTP_TOKENS = [];
let APPOINTMENTS = [];
let TRIAGE_RECORDS = [];

// Helper functions
const matchUserWhere = (u, where = {}) => {
  if (where.id && u.id !== where.id) return false;
  if (where.userName && u.userName !== where.userName) return false;
  if (where.email && u.email !== where.email) return false;
  if (where.phone && u.phone !== where.phone) return false;
  if (where.OR) {
    return where.OR.some((cond) => matchUserWhere(u, cond));
  }
  return true;
};

const buildUserObject = (u) => {
  return {
    ...u,
    petOwner: u.role === 'PET_OWNER' ? { userId: u.id, address: '123 Nguyen Hue Blvd, District 1, HCMC' } : null,
    employee: u.employee || null,
  };
};

const buildPetObject = (p) => {
  const ownerUser = USERS.find((u) => u.id === p.ownerId);
  const petRecords = MEDICAL_RECORDS.filter((r) => r.petId === p.id);
  const petOrders = LAB_ORDERS.filter((o) => o.petId === p.id);

  return {
    ...p,
    owner: {
      userId: p.ownerId,
      user: ownerUser ? { id: ownerUser.id, fullName: ownerUser.fullName, phone: ownerUser.phone, email: ownerUser.email } : null,
    },
    _count: {
      medicalRecords: petRecords.length,
      labOrders: petOrders.length,
    },
  };
};

const buildRecordObject = (r) => {
  const pet = PETS.find((p) => p.id === r.petId);
  const vet = USERS.find((u) => u.id === r.vetId);
  const rPrescriptions = PRESCRIPTIONS.filter((p) => p.recordId === r.id);
  const rOrders = LAB_ORDERS.filter((o) => o.recordId === r.id).map((o) => {
    const nurse = USERS.find((u) => u.id === o.nurseId);
    const oVet = USERS.find((u) => u.id === o.vetId);
    return {
      ...o,
      nurse: nurse ? { id: nurse.id, fullName: nurse.fullName, role: nurse.role } : null,
      vet: oVet ? { id: oVet.id, fullName: oVet.fullName } : null,
    };
  });

  return {
    ...r,
    pet: pet ? buildPetObject(pet) : null,
    vet: vet ? { id: vet.id, fullName: vet.fullName, role: vet.role, employee: vet.employee } : null,
    prescriptions: rPrescriptions,
    labOrders: rOrders,
    _count: {
      labOrders: rOrders.length,
      prescriptions: rPrescriptions.length,
    },
  };
};

const buildLabOrderObject = (o) => {
  const pet = PETS.find((p) => p.id === o.petId);
  const vet = USERS.find((u) => u.id === o.vetId);
  const nurse = USERS.find((u) => u.id === o.nurseId);
  const record = MEDICAL_RECORDS.find((r) => r.id === o.recordId);

  return {
    ...o,
    pet: pet ? buildPetObject(pet) : null,
    vet: vet ? { id: vet.id, fullName: vet.fullName, employee: vet.employee } : null,
    nurse: nurse ? { id: nurse.id, fullName: nurse.fullName, employee: nurse.employee } : null,
    medicalRecord: record ? { id: record.id, diagnosis: record.diagnosis, status: record.status } : null,
  };
};

const buildAppointmentObject = (app) => {
  const pet = PETS.find((p) => p.id === app.petId);
  const vet = USERS.find((u) => u.id === app.vetId);
  const receptionist = USERS.find((u) => u.id === app.recepId);
  const triage = TRIAGE_RECORDS.find((t) => t.appId === app.id);

  return {
    ...app,
    pet: pet ? buildPetObject(pet) : null,
    veterinarian: vet ? { id: vet.id, fullName: vet.fullName, role: vet.role } : null,
    receptionist: receptionist ? { id: receptionist.id, fullName: receptionist.fullName } : null,
    triageRecord: triage || null,
  };
};

// Fallback Prisma Interface
const prismaFallback = {
  $connect: async () => true,
  $disconnect: async () => true,
  $transaction: async (fn) => {
    if (typeof fn === 'function') {
      return fn(prismaFallback);
    }
    return Promise.all(fn);
  },

  user: {
    findMany: async ({ where = {} } = {}) => {
      let list = USERS;
      if (where.role) {
        list = list.filter((u) => u.role === where.role);
      }
      if (where.isActive !== undefined) {
        list = list.filter((u) => u.isActive === where.isActive);
      }
      if (where.OR) {
        list = list.filter((u) => {
          return where.OR.some((cond) => {
            const key = Object.keys(cond)[0];
            const term = cond[key]?.contains?.toLowerCase();
            if (!term) return false;
            return (u[key] || '').toLowerCase().includes(term);
          });
        });
      }
      return list.map(buildUserObject);
    },
    findUnique: async ({ where }) => {
      const u = USERS.find((user) => matchUserWhere(user, where));
      return u ? buildUserObject(u) : null;
    },
    findFirst: async ({ where }) => {
      const u = USERS.find((user) => matchUserWhere(user, where));
      return u ? buildUserObject(u) : null;
    },
    create: async ({ data }) => {
      const newUser = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      USERS.push(newUser);
      return buildUserObject(newUser);
    },
    update: async ({ where, data }) => {
      const idx = USERS.findIndex((u) => matchUserWhere(u, where));
      if (idx !== -1) {
        USERS[idx] = { ...USERS[idx], ...data, updatedAt: new Date() };
        return buildUserObject(USERS[idx]);
      }
      return null;
    },
    upsert: async ({ where, create, update }) => {
      const existing = USERS.find((u) => matchUserWhere(u, where));
      if (existing) {
        return buildUserObject(existing);
      }
      const newUser = {
        id: crypto.randomUUID(),
        ...create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      USERS.push(newUser);
      return buildUserObject(newUser);
    },
  },

  pet: {
    findMany: async ({ where = {} } = {}) => {
      return PETS.map(buildPetObject);
    },
    findUnique: async ({ where }) => {
      const p = PETS.find((pet) => pet.id === where.id);
      return p ? buildPetObject(p) : null;
    },
    create: async ({ data }) => {
      const newPet = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      PETS.push(newPet);
      return buildPetObject(newPet);
    },
    update: async ({ where, data }) => {
      const idx = PETS.findIndex((p) => p.id === where.id);
      if (idx !== -1) {
        PETS[idx] = { ...PETS[idx], ...data, updatedAt: new Date() };
        return buildPetObject(PETS[idx]);
      }
      return null;
    },
  },

  medicalRecord: {
    findMany: async ({ where = {} } = {}) => {
      let list = MEDICAL_RECORDS.map(buildRecordObject);

      if (where.petId) {
        list = list.filter((r) => r.petId === where.petId);
      }
      if (where.pet?.ownerId) {
        list = list.filter((r) => r.pet?.owner?.userId === where.pet.ownerId);
      }
      if (where.status) {
        list = list.filter((r) => r.status === where.status);
      }
      if (where.OR) {
        // Search filter
        const s = where.OR[0]?.diagnosis?.contains?.toLowerCase() || '';
        if (s) {
          list = list.filter(
            (r) =>
              r.diagnosis?.toLowerCase().includes(s) ||
              r.pet?.name?.toLowerCase().includes(s) ||
              r.symptoms?.toLowerCase().includes(s)
          );
        }
      }

      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    },
    findUnique: async ({ where }) => {
      const r = MEDICAL_RECORDS.find((rec) => rec.id === where.id);
      return r ? buildRecordObject(r) : null;
    },
    create: async ({ data }) => {
      const newRec = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MEDICAL_RECORDS.unshift(newRec);
      return buildRecordObject(newRec);
    },
    update: async ({ where, data }) => {
      const idx = MEDICAL_RECORDS.findIndex((r) => r.id === where.id);
      if (idx !== -1) {
        MEDICAL_RECORDS[idx] = { ...MEDICAL_RECORDS[idx], ...data, updatedAt: new Date() };
        return buildRecordObject(MEDICAL_RECORDS[idx]);
      }
      return null;
    },
  },

  labOrder: {
    findMany: async ({ where = {} } = {}) => {
      let list = LAB_ORDERS.map(buildLabOrderObject);

      if (where.status) {
        list = list.filter((o) => o.status === where.status);
      }
      if (where.urgency) {
        list = list.filter((o) => o.urgency === where.urgency);
      }
      if (where.petId) {
        list = list.filter((o) => o.petId === where.petId);
      }
      if (where.recordId) {
        list = list.filter((o) => o.recordId === where.recordId);
      }
      if (where.pet?.ownerId) {
        list = list.filter((o) => o.pet?.owner?.userId === where.pet.ownerId);
      }

      list.sort((a, b) => {
        if (a.urgency === 'URGENT' && b.urgency !== 'URGENT') return -1;
        if (a.urgency !== 'URGENT' && b.urgency === 'URGENT') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return list;
    },
    findUnique: async ({ where }) => {
      const o = LAB_ORDERS.find((order) => order.id === where.id || order.orderCode === where.orderCode);
      return o ? buildLabOrderObject(o) : null;
    },
    create: async ({ data }) => {
      const newOrder = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      LAB_ORDERS.unshift(newOrder);
      return buildLabOrderObject(newOrder);
    },
    update: async ({ where, data }) => {
      const idx = LAB_ORDERS.findIndex((o) => o.id === where.id);
      if (idx !== -1) {
        LAB_ORDERS[idx] = { ...LAB_ORDERS[idx], ...data, updatedAt: new Date() };
        return buildLabOrderObject(LAB_ORDERS[idx]);
      }
      return null;
    },
    count: async ({ where = {} }) => {
      let list = LAB_ORDERS;
      if (where.recordId) list = list.filter((o) => o.recordId === where.recordId);
      if (where.status?.in) list = list.filter((o) => where.status.in.includes(o.status));
      if (where.id?.not) list = list.filter((o) => o.id !== where.id.not);
      return list.length;
    },
  },

  prescription: {
    create: async ({ data }) => {
      const newPres = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      PRESCRIPTIONS.push(newPres);
      return newPres;
    },
  },

  petOwner: {
    upsert: async () => ({}),
    create: async () => ({}),
  },

  employee: {
    upsert: async () => ({}),
    create: async () => ({}),
  },

  refreshToken: {
    findUnique: async ({ where }) => {
      return REFRESH_TOKENS.find((t) => t.tokenHash === where.tokenHash) || null;
    },
    create: async ({ data }) => {
      const token = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      REFRESH_TOKENS.push(token);
      return token;
    },
    update: async ({ where, data }) => {
      const idx = REFRESH_TOKENS.findIndex((t) => t.tokenHash === where.tokenHash);
      if (idx !== -1) {
        REFRESH_TOKENS[idx] = { ...REFRESH_TOKENS[idx], ...data };
        return REFRESH_TOKENS[idx];
      }
      return null;
    },
  },

  otpToken: {
    findFirst: async () => null,
    create: async ({ data }) => {
      const otp = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      OTP_TOKENS.push(otp);
      return otp;
    },
  },

  appointment: {
    deleteMany: async () => {
      APPOINTMENTS = [];
      return { count: 0 };
    },
    create: async ({ data }) => {
      const newApp = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      APPOINTMENTS.push(newApp);
      return buildAppointmentObject(newApp);
    },
    findUnique: async ({ where }) => {
      const app = APPOINTMENTS.find((a) => a.id === where.id);
      return app ? buildAppointmentObject(app) : null;
    },
    findMany: async ({ where = {} } = {}) => {
      let list = APPOINTMENTS;
      if (where.type) {
        list = list.filter((a) => a.type === where.type);
      }
      if (where.status?.in) {
        list = list.filter((a) => where.status.in.includes(a.status));
      } else if (where.status) {
        list = list.filter((a) => a.status === where.status);
      }
      if (where.vetId) {
        list = list.filter((a) => a.vetId === where.vetId);
      }
      return list.map(buildAppointmentObject);
    },
    update: async ({ where, data }) => {
      const idx = APPOINTMENTS.findIndex((a) => a.id === where.id);
      if (idx !== -1) {
        APPOINTMENTS[idx] = { ...APPOINTMENTS[idx], ...data, updatedAt: new Date() };
        return buildAppointmentObject(APPOINTMENTS[idx]);
      }
      return null;
    },
  },

  triageRecord: {
    deleteMany: async () => {
      TRIAGE_RECORDS = [];
      return { count: 0 };
    },
    create: async ({ data }) => {
      const newTriage = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      TRIAGE_RECORDS.push(newTriage);
      return newTriage;
    },
    findUnique: async ({ where }) => {
      const t = TRIAGE_RECORDS.find((tr) => tr.id === where.id || tr.appId === where.appId);
      return t || null;
    },
    findMany: async () => {
      return TRIAGE_RECORDS;
    },
    update: async ({ where, data }) => {
      const idx = TRIAGE_RECORDS.findIndex((tr) => tr.id === where.id);
      if (idx !== -1) {
        TRIAGE_RECORDS[idx] = { ...TRIAGE_RECORDS[idx], ...data, updatedAt: new Date() };
        return TRIAGE_RECORDS[idx];
      }
      return null;
    },
  },
};

module.exports = prismaFallback;

