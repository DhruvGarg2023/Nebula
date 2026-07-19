import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../server.js';
import prisma from '../../../core/database/prisma.js';

describe('User API Integration', () => {
  let accessToken = '';
  let userId = '';

  beforeAll(async () => {
    // Setup test user
    const res = await request(app)
      .post('/api/v1/auth/dev/login')
      .send({
        email: 'user-test@example.com',
        name: 'User API Test',
      });
      
    accessToken = res.body.data.accessToken;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany({
      where: { email: 'user-test@example.com' }
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return the current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.email).toBe('user-test@example.com');
      // Should not expose sensitive fields
      expect(res.body.data.passwordHash).toBeUndefined();
      expect(res.body.data.googleId).toBeUndefined();
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update the user profile', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name', preferences: { theme: 'dark' } });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.preferences).toEqual({ theme: 'dark' });
    });

    it('should fail validation on invalid input', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'A' }); // Too short

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/search', () => {
    it('should find users by name', async () => {
      const res = await request(app)
        .get('/api/v1/users/search?q=Updated')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/v1/users/me', () => {
    it('should soft delete the user account', async () => {
      const res = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);

      // Verify soft delete in DB
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      expect(dbUser.deletedAt).not.toBeNull();
      
      // Token should now be invalid for new requests
      const getRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      // The token itself is still cryptographically valid until expiration,
      // but the getMe controller will throw NotFoundError because findById excludes soft-deleted users.
      expect(getRes.status).toBe(404);
    });
  });
});
