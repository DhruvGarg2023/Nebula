import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../server.js';
import prisma from '../../../core/database/prisma.js';

describe('Auth API Integration', () => {
  let accessToken = '';
  let refreshTokenCookie = '';

  beforeAll(async () => {
    // Clear test data
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany({
      where: { email: 'dev-test@example.com' }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany({
      where: { email: 'dev-test@example.com' }
    });
  });

  describe('POST /api/v1/auth/dev/login', () => {
    it('should create a user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/dev/login')
        .send({
          email: 'dev-test@example.com',
          name: 'Integration Test User',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('dev-test@example.com');
      
      // Check for set-cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      
      accessToken = res.body.data.accessToken;
      refreshTokenCookie = cookies[0].split(';')[0]; // Store for next tests
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/dev/login')
        .send({
          email: 'not-an-email',
          name: 'Test',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return a new token pair using the refresh cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      
      // Should set a new refresh token cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      expect(cookies[0]).not.toBe(refreshTokenCookie);
      
      refreshTokenCookie = cookies[0].split(';')[0]; // Update for logout test
    });

    it('should fail if no cookie provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should revoke token and clear cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshTokenCookie);

      expect(res.status).toBe(200);
      
      // Cookie should be cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toContain('refreshToken=;');
    });

    it('should fail to refresh after logout', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });
  });
});
