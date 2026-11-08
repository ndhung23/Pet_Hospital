const request = require('supertest');
const app = require('../src/app');
const { validatePasswordComplexity } = require('../src/utils/password');

describe('PHMS Backend Core & BR-10 Rules', () => {
  describe('BR-10 Password Complexity Validation', () => {
    test('rejects passwords shorter than 8 characters', () => {
      const res = validatePasswordComplexity('Short1!', 'testuser');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('8 and 32 characters');
    });

    test('rejects passwords longer than 32 characters', () => {
      const longPass = 'A'.repeat(33);
      const res = validatePasswordComplexity(longPass, 'testuser');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('8 and 32 characters');
    });

    test('rejects passwords containing spaces', () => {
      const res = validatePasswordComplexity('Pass word 123', 'testuser');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('must not contain any spaces');
    });

    test('rejects passwords identical to username', () => {
      const res = validatePasswordComplexity('testuser', 'testuser');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('must not be identical to the username');
    });

    test('accepts compliant passwords', () => {
      const res = validatePasswordComplexity('ValidPass123!', 'testuser');
      expect(res.isValid).toBe(true);
    });
  });

  describe('Health Check API', () => {
    test('GET /api/health returns 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('UC-AUTH-02: Authentication RBAC verification', () => {
    test('Login with seeded account succeeds', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'petowner1',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('PET_OWNER');
      expect(res.body.data.accessToken).toBeDefined();
    });

    test('Login with wrong password returns 401 with standard message', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'petowner1',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid username or password');
    });
  });
});
