import { checkDatabaseHealth } from '../../core/database/prisma.js';
import { checkRedisHealth } from '../../core/redis/client.js';

/**
 * System health check controllers.
 *
 * GET /health — Liveness probe: Is the process alive?
 * GET /ready  — Readiness probe: Are all dependencies healthy?
 *
 * Liveness: Kubernetes/ECS restarts the container if this fails.
 * Readiness: Load balancer removes the node from rotation if this fails.
 */

/**
 * Liveness probe.
 * Returns 200 if the Node.js process is running and the event loop is responsive.
 * This endpoint should NEVER call external dependencies.
 */
function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
}

/**
 * Readiness probe.
 * Checks all critical dependencies (database, Redis).
 * Returns 503 if any dependency is unhealthy.
 */
async function readinessCheck(req, res) {
  const [dbHealthy, redisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const allHealthy = dbHealthy && redisHealthy;
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    data: {
      status: allHealthy ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    },
  });
}

export { healthCheck, readinessCheck };
