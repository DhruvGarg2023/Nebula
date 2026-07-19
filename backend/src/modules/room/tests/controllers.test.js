import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../server.js';
import prisma from '../../../core/database/prisma.js';

describe('Room API Integration & RBAC', () => {
  let adminToken = '';
  let adminId = '';
  let editorToken = '';
  let editorId = '';
  let viewerToken = '';
  
  let roomId = '';
  let inviteToken = '';

  beforeAll(async () => {
    // Clean DB
    await prisma.invitation.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // Setup Test Users via dev login
    const adminRes = await request(app).post('/api/v1/auth/dev/login').send({ email: 'admin@example.com', name: 'Admin' });
    adminToken = adminRes.body.data.accessToken;
    adminId = adminRes.body.data.user.id;

    const editorRes = await request(app).post('/api/v1/auth/dev/login').send({ email: 'editor@example.com', name: 'Editor' });
    editorToken = editorRes.body.data.accessToken;
    editorId = editorRes.body.data.user.id;

    const viewerRes = await request(app).post('/api/v1/auth/dev/login').send({ email: 'viewer@example.com', name: 'Viewer' });
    viewerToken = viewerRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.invitation.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Room CRUD & Implicit Admin', () => {
    it('should create a room and set owner as admin', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integration Room',
          description: 'Testing RBAC',
          isPublic: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      roomId = res.body.data.id;
      expect(res.body.data.ownerId).toBe(adminId);

      // Verify membership
      const membersRes = await request(app)
        .get(`/api/v1/rooms/${roomId}/members`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(membersRes.status).toBe(200);
      expect(membersRes.body.data.length).toBe(1);
      expect(membersRes.body.data[0].role).toBe('admin');
    });

    it('should list user rooms', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(roomId);
    });

    it('should prevent non-members from accessing a private room', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${editorToken}`);
      
      // Returns 404 to avoid enum attacks
      expect(res.status).toBe(404);
    });
  });

  describe('Invitations & Joining', () => {
    it('should allow admin to create an invitation', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/invites`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'editor', expiresInHours: 1 });

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      inviteToken = res.body.data.token;
    });

    it('should allow viewing invitation details without auth', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/invites/${inviteToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.room.id).toBe(roomId);
      expect(res.body.data.role).toBe('editor');
    });

    it('should allow user to join via invitation', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/invites/accept`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ token: inviteToken });

      expect(res.status).toBe(200);
      expect(res.body.data.room.id).toBe(roomId);
    });

    it('should reject joining if already a member', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/invites/accept`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ token: inviteToken });

      expect(res.status).toBe(400); // Validation error
    });
  });

  describe('RBAC Authorization', () => {
    beforeAll(async () => {
      // Add viewer directly to DB for test speed
      await prisma.roomMember.create({
        data: { roomId, userId: (await prisma.user.findFirst({ where: { email: 'viewer@example.com'} })).id, role: 'viewer' }
      });
    });

    it('viewer can GET room details', async () => {
      const res = await request(app).get(`/api/v1/rooms/${roomId}`).set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
    });

    it('viewer CANNOT invite others (requires editor)', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/invites`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ role: 'viewer' });
      expect(res.status).toBe(403);
    });

    it('editor CAN invite others', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/invites`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ role: 'viewer' });
      expect(res.status).toBe(201);
    });

    it('editor CANNOT change room settings (requires admin)', async () => {
      const res = await request(app)
        .patch(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Hacked Room' });
      expect(res.status).toBe(403);
    });

    it('admin CAN change room settings', async () => {
      const res = await request(app)
        .patch(`/api/v1/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Admin Room' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Admin Room');
    });

    it('admin CANNOT leave room if they are owner', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it('editor CAN leave room', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${editorToken}`);
      expect(res.status).toBe(200);
    });
  });
});
