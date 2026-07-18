import Redis from 'ioredis';
import logger from '../logger/index.js';

/**
 * Create a Redis client with standard configuration.
 *
 * Design decisions:
 * - ioredis is the most battle-tested Node.js Redis client (Cluster + Sentinel support)
 * - Lazy connect: connection is established on first command, not on instantiation
 * - Retry strategy: exponential backoff with max 30s delay
 * - Separate connections are needed for Pub/Sub subscriber (Redis requirement)
 *
 * @param {string} url - Redis connection URL
 * @param {string} [name='default'] - Connection name for logging
 * @returns {import('ioredis').Redis}
 */
function createRedisClient(url, name = 'default') {
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 500, 30_000);
      logger.warn({ attempt: times, delay, connection: name }, `Redis reconnecting...`);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    logger.info({ connection: name }, 'Redis connected');
  });

  client.on('ready', () => {
    logger.debug({ connection: name }, 'Redis ready');
  });

  client.on('error', (err) => {
    logger.error({ err, connection: name }, 'Redis error');
  });

  client.on('close', () => {
    logger.warn({ connection: name }, 'Redis connection closed');
  });

  return client;
}

/** @type {import('ioredis').Redis | null} */
let redisClient = null;

/**
 * Get or create the main Redis client singleton.
 * Uses lazy initialization so tests can import without requiring a live Redis.
 * @param {string} [url] - Redis URL override
 * @returns {import('ioredis').Redis}
 */
export function getRedisClient(url) {
  if (!redisClient) {
    const redisUrl = url || process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is required but not set');
    }
    redisClient = createRedisClient(redisUrl, 'main');
  }
  return redisClient;
}

/**
 * Connect the Redis client.
 * @returns {Promise<void>}
 */
export async function connectRedis() {
  const client = getRedisClient();
  if (client.status === 'ready') return;
  await client.connect();
}

/**
 * Check Redis connectivity.
 * Used by health check endpoints.
 * @returns {Promise<boolean>}
 */
export async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (err) {
    logger.error({ err }, 'Redis health check failed');
    return false;
  }
}

/**
 * Gracefully disconnect Redis on process shutdown.
 */
export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export { createRedisClient };
export default getRedisClient;
