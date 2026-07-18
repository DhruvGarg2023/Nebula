import pino from 'pino';

/**
 * Creates the application logger.
 * 
 * Design decisions:
 * - Pino is ~5x faster than Winston (benchmarked)
 * - JSON output integrates directly with log aggregation (Datadog, Loki, ELK)
 * - pino-pretty is used in development for human-readable output
 * - Child loggers carry context (requestId, userId, roomId) without repetition
 * 
 * @param {object} [options] - Override options
 * @returns {import('pino').Logger}
 */
function createLogger(options = {}) {
  const isDev = process.env.NODE_ENV !== 'production';
  const level = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

  /** @type {import('pino').LoggerOptions} */
  const loggerOptions = {
    level,
    // Redact sensitive fields from logs
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'passwordHash',
        'token',
        'refreshToken',
        'accessToken',
        'secret',
        'apiKey',
      ],
      censor: '[REDACTED]',
    },
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    // Add timestamp as ISO string for readability
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options,
  };

  // Use pino-pretty for development, raw JSON for production
  const transport = isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined;

  return pino(loggerOptions, transport ? pino.transport(transport) : undefined);
}

/** Singleton application logger */
const logger = createLogger();

export default logger;
export { createLogger };
