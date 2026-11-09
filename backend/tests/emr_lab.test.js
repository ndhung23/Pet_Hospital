// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
const request = require('supertest');
const app = require('../src/app');
const { createEmrSchema } = require('../src/validators/emr.validator');
const { createLabOrderSchema, processLabOrderSchema } = require('../src/validators/lab.validator');

describe('EMR & LAB Modules Unit & Integration Tests', () => {
  describe('EMR-01 Validator & Business Rule 3.0.E1', () => {
    test('BR 3.0.E1: fails if diagnosis is missing', () => {
      const result = createEmrSchema.safeParse({
        petId: '550e8400-e29b-41d4-a716-446655440000',
        weight: 12.5,
        treatmentPlan: 'Standard hydration and rest',
      });
      expect(result.success).toBe(false);
      const errors = result.error.issues.map((i) => i.path[0]);
      expect(errors).toContain('diagnosis');
    });

    test('BR 3.0.E1: fails if weight is missing or non-positive', () => {
      const result = createEmrSchema.safeParse({
        petId: '550e8400-e29b-41d4-a716-446655440000',
        diagnosis: 'K9-GE-01: Acute Canine Gastroenteritis',
        treatmentPlan: 'Standard hydration and rest',
      });
      expect(result.success).toBe(false);
      const errors = result.error.issues.map((i) => i.path[0]);
      expect(errors).toContain('weight');
    });

    test('accepts valid clinical examination with mandatory weight and diagnosis', () => {
      const result = createEmrSchema.safeParse({
        petId: '550e8400-e29b-41d4-a716-446655440000',
        weight: 14.2,
        temperature: 38.6,
        heartRate: 110,
        symptoms: 'Mild lethargy and vomiting',
        diagnosis: 'K9-GE-01: Acute Canine Gastroenteritis',
        treatmentPlan: 'Subcutaneous fluid 500ml',
        status: 'EXAMINATION_COMPLETED',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('LAB-01 & LAB-02 Validators', () => {
    test('LAB-01: requires recordId and testType', () => {
      const result = createLabOrderSchema.safeParse({
        recordId: '550e8400-e29b-41d4-a716-446655440000',
        testType: 'Complete Blood Count (CBC)',
        urgency: 'URGENT',
      });
      expect(result.success).toBe(true);
      expect(result.data.urgency).toBe('URGENT');
    });

    test('LAB-02: accepts completed results with measured parameters', () => {
      const result = processLabOrderSchema.safeParse({
        status: 'COMPLETED',
        resultValues: {
          WBC: { value: 12.5, unit: '10^9/L', flag: 'NORMAL' },
        },
        resultSummary: 'Normal blood count.',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('API Authentication Gatekeeper for EMR and LAB', () => {
    test('GET /api/emr rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/emr');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authentication required');
    });

    test('GET /api/lab/orders rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/lab/orders');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authentication required');
    });
  });
});

