const request = require('supertest');
const app = require('../src/app');

describe('UC-EMG-01: Emergency Triage Intake & BR-04 Priority Queue', () => {
  let receptionistToken;
  let vetToken;
  let vetUser;

  beforeAll(async () => {
    // 1. Log in as Receptionist
    const recRes = await request(app).post('/api/auth/login').send({
      identifier: 'receptionist1',
      password: 'Password123!',
    });
    expect(recRes.status).toBe(200);
    receptionistToken = recRes.body.data.accessToken;

    // 2. Log in as Veterinarian
    const vetRes = await request(app).post('/api/auth/login').send({
      identifier: 'vet1',
      password: 'Password123!',
    });
    expect(vetRes.status).toBe(200);
    vetToken = vetRes.body.data.accessToken;
    vetUser = vetRes.body.data.user;
  });

  test('GET /api/triage/vets returns on-duty veterinarians', async () => {
    const res = await request(app)
      .get('/api/triage/vets')
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vets.length).toBeGreaterThan(0);
  });

  test('POST /api/triage/intake registers anonymous emergency Level 1 case', async () => {
    const res = await request(app)
      .post('/api/triage/intake')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        ownerMode: 'ANONYMOUS',
        petName: 'Emergency Husky',
        species: 'Canine',
        breed: 'Siberian Husky',
        conditionLevel: 'LEVEL_1_CRITICAL',
        initialSymptoms: 'Severe arterial hemorrhage and trauma following road accident',
        vetId: vetUser.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('EMERGENCY_WAITING');
    expect(res.body.data.triageRecord.conditionLevel).toBe('LEVEL_1_CRITICAL');
  });

  test('POST /api/triage/intake registers Level 2 Urgent case', async () => {
    const res = await request(app)
      .post('/api/triage/intake')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        ownerMode: 'ANONYMOUS',
        petName: 'Urgent Cat',
        species: 'Feline',
        conditionLevel: 'LEVEL_2_URGENT',
        initialSymptoms: 'Acute respiratory distress and toxic ingestion suspicion',
        vetId: vetUser.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.triageRecord.conditionLevel).toBe('LEVEL_2_URGENT');
  });

  test('GET /api/triage/queue sorts queue by BR-04 priority (Level 1 at #1)', async () => {
    const res = await request(app)
      .get('/api/triage/queue')
      .set('Authorization', `Bearer ${vetToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const queue = res.body.data;
    expect(queue.length).toBeGreaterThanOrEqual(2);

    // Position #1 must be LEVEL_1_CRITICAL (BR-04)
    expect(queue[0].triageRecord.conditionLevel).toBe('LEVEL_1_CRITICAL');
    expect(queue[0].priorityQueueNumber).toBe(1);

    // Position #2 must be LEVEL_2_URGENT
    expect(queue[1].triageRecord.conditionLevel).toBe('LEVEL_2_URGENT');
    expect(queue[1].priorityQueueNumber).toBe(2);
  });

  test('PATCH /api/triage/:id/accept transitions appointment to IN_EXAMINATION', async () => {
    const queueRes = await request(app)
      .get('/api/triage/queue')
      .set('Authorization', `Bearer ${vetToken}`);

    const targetAppId = queueRes.body.data[0].id;

    const acceptRes = await request(app)
      .patch(`/api/triage/${targetAppId}/accept`)
      .set('Authorization', `Bearer ${vetToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('IN_EXAMINATION');
  });
});
