import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import getRedisClient, { createRedisClient } from '../redis/client.js';
import logger from '../logger/index.js';
import config from '../../config/index.js';

let io;

/**
 * Initializes the Socket.IO server with the Redis adapter.
 *
 * @param {import('http').Server} httpServer - The HTTP server instance
 * @returns {import('socket.io').Server} The initialized Socket.IO server
 */
export function initSockets(httpServer) {
  if (io) {
    logger.warn('Socket.IO server is already initialized');
    return io;
  }

  // Configure Socket.IO Server
  io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    // Allows reconnection state recovery if connection drops
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  // Attach Redis Adapter for horizontal scaling across instances
  const pubClient = getRedisClient();
  const subClient = createRedisClient(config.REDIS_URL || process.env.REDIS_URL, 'subscriber');

  io.adapter(createAdapter(pubClient, subClient));

  // Global socket error handler
  io.engine.on('connection_error', (err) => {
    logger.error({ err }, 'Socket.IO Connection Error');
  });

  logger.info('Socket.IO server initialized with Redis adapter');

  return io;
}

/**
 * Gets the initialized Socket.IO instance.
 * Throws an error if called before initialization.
 *
 * @returns {import('socket.io').Server}
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return io;
}
