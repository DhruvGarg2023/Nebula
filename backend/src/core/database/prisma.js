import { PrismaClient } from '@prisma/client';
import logger from '../logger/index.js';

/**
 * Prisma client singleton.
 *
 * Design decisions:
 * - Single instance shared across the entire application
 * - Logging integration with Pino for query debugging in development
 * - Graceful disconnect on process exit to prevent connection leaks
 * - Never instantiate multiple PrismaClient instances
 */
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log slow queries in development
prisma.$on('query', (e) => {
  if (e.duration > 100) {
    logger.warn({
      query: e.query,
      duration: e.duration,
      params: e.params,
    }, `Slow query detected (${e.duration}ms)`);
  } else {
    logger.debug({
      duration: e.duration,
    }, 'Database query executed');
  }
});

prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma client error');
});

prisma.$on('warn', (e) => {
  logger.warn({ warning: e }, 'Prisma client warning');
});

/**
 * Check database connectivity.
 * Used by health check endpoints.
 * @returns {Promise<boolean>}
 */
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return false;
  }
}

/**
 * Gracefully disconnect Prisma on process shutdown.
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

export default prisma;
