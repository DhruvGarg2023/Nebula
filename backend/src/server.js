import http from 'node:http';
import config from './config/index.js';
import logger from './core/logger/index.js';
import { connectRedis, disconnectRedis } from './core/redis/client.js';
import { disconnectDatabase } from './core/database/prisma.js';
import createApp from './app.js';
import { initSockets } from './core/sockets/index.js';
import { registerCollaborationNamespace } from './modules/collaboration/sockets.js';
import { registerEditorNamespace } from './modules/editor/sockets.js';
import { registerChatNamespace } from './modules/chat/sockets.js';
import { registerCompilerNamespace } from './modules/compiler/sockets.js';
import { initCompilerWorker } from './modules/compiler/worker.js';

const app = createApp();
const server = http.createServer(app);


async function gracefulShutdown(signal) {
  logger.info({ signal }, `${signal} received. Starting graceful shutdown...`);

  // 1. Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // 2. Close database connection
      await disconnectDatabase();

      // 3. Close Redis connection
      await disconnectRedis();

      logger.info('All connections closed. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ err: reason, promise }, 'Unhandled Promise Rejection');
  // Don't exit — let the error handler deal with it
  // In production, Sentry captures this
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception — shutting down');
  // Uncaught exceptions are NOT recoverable — exit immediately
  process.exit(1);
});

/**
 * Start the server.
 */
async function start() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Initialize WebSockets
    initSockets(server);
    registerCollaborationNamespace();
    registerEditorNamespace();
    registerChatNamespace();
    registerCompilerNamespace();
    logger.info('WebSocket namespaces registered');

    // Initialize BullMQ compiler worker
    initCompilerWorker();

    // Start HTTP server
    server.listen(config.PORT, () => {
      logger.info({
        port: config.PORT,
        env: config.NODE_ENV,
        nodeVersion: process.version,
      }, `Server running on port ${config.PORT} (${config.NODE_ENV})`);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

export { server, app };
