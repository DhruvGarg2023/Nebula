import logger from '../logger/index.js';

/**
 * HTTP request/response logging middleware.
 *
 * Logs:
 * - Method, URL, status code, response time
 * - Request ID for correlation
 * - User ID when available (after auth middleware)
 *
 * Uses Pino child logger for per-request context injection.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Create a child logger with request context
  req.log = logger.child({ requestId: req.id });

  // Log on response finish (not on request start — reduces noise)
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      contentLength: res.getHeader('content-length'),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    // Add userId if available (set by auth middleware)
    if (req.user?.id) {
      logData.userId = req.user.id;
    }

    // Use appropriate log level based on status code
    if (res.statusCode >= 500) {
      req.log.error(logData, `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    } else if (res.statusCode >= 400) {
      req.log.warn(logData, `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    } else {
      req.log.info(logData, `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
}

export default requestLogger;
