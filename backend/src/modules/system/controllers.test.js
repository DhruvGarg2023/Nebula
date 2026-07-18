import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

/**
 * Integration tests for the system module (health checks).
 *
 * These tests create an isolated Express app to test the health
 * endpoints without requiring actual database or Redis connections.
 * The database and Redis health check functions are mocked.
 */

// Mock database and Redis health checks
vi.mock('../../core/database/prisma.js', () => ({
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
  default: {},
}));

vi.mock('../../core/redis/client.js', () => ({
  checkRedisHealth: vi.fn().mockResolvedValue(true),
  getRedisClient: vi.fn(),
  connectRedis: vi.fn(),
  disconnectRedis: vi.fn(),
  default: vi.fn(),
}));

// Import AFTER mocks are set up
const { healthCheck, readinessCheck } = await import('./controllers.js');

function createTestApp() {
  const app = express();
  app.get('/health', healthCheck);
  app.get('/ready', async (req, res, next) => {
    try {
      await readinessCheck(req, res);
    } catch (err) {
      next(err);
    }
  });
  return app;
}

describe('System Module - Health Checks', () => {
  describe('GET /health (liveness probe)', () => {
    it('should return 200 with status ok', async () => {
      const app = createTestApp();

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.uptime).toBeTypeOf('number');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('GET /ready (readiness probe)', () => {
    it('should return 200 when all dependencies are healthy', async () => {
      const { checkDatabaseHealth } = await import('../../core/database/prisma.js');
      const { checkRedisHealth } = await import('../../core/redis/client.js');

      checkDatabaseHealth.mockResolvedValue(true);
      checkRedisHealth.mockResolvedValue(true);

      const app = createTestApp();
      const response = await request(app).get('/ready');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.dependencies.database).toBe('connected');
      expect(response.body.data.dependencies.redis).toBe('connected');
    });

    it('should return 503 when database is unhealthy', async () => {
      const { checkDatabaseHealth } = await import('../../core/database/prisma.js');
      const { checkRedisHealth } = await import('../../core/redis/client.js');

      checkDatabaseHealth.mockResolvedValue(false);
      checkRedisHealth.mockResolvedValue(true);

      const app = createTestApp();
      const response = await request(app).get('/ready');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.data.status).toBe('degraded');
      expect(response.body.data.dependencies.database).toBe('disconnected');
      expect(response.body.data.dependencies.redis).toBe('connected');
    });

    it('should return 503 when Redis is unhealthy', async () => {
      const { checkDatabaseHealth } = await import('../../core/database/prisma.js');
      const { checkRedisHealth } = await import('../../core/redis/client.js');

      checkDatabaseHealth.mockResolvedValue(true);
      checkRedisHealth.mockResolvedValue(false);

      const app = createTestApp();
      const response = await request(app).get('/ready');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.data.dependencies.redis).toBe('disconnected');
    });
  });
});
