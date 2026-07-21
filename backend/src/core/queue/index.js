import { Queue } from 'bullmq';
import config from '../../config/index.js';
import logger from '../logger/index.js';

function parseRedisUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    return {
      host: url.hostname || '127.0.0.1',
      port: url.port ? parseInt(url.port, 10) : 6379,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      username: url.username ? decodeURIComponent(url.username) : undefined,
      db: url.pathname ? parseInt(url.pathname.replace('/', ''), 10) || 0 : 0,
      maxRetriesPerRequest: null,
    };
  } catch (err) {
    logger.warn({ err, urlStr }, 'Failed to parse REDIS_URL, falling back to default host/port');
    return { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null };
  }
}

export const redisConnectionOptions = parseRedisUrl(config.REDIS_URL);

export const compilerQueue = new Queue('compiler-queue', {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: 100,
  },
});

logger.info('BullMQ compiler-queue initialized');
