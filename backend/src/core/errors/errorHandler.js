import logger from '../logger/index.js';
import { AppError } from './AppError.js';
import ERROR_CODES from './errorCodes.js';
import CONSTANTS from '../../config/constants.js';

/**
 * Global Express error handling middleware.
 *
 * Design decisions:
 * - Centralized: ALL errors flow through this single handler
 * - Operational vs Programmer: AppError subclasses get clean responses;
 *   unexpected errors get generic 500 (never expose internals)
 * - Zod errors are transformed into our ValidationError format
 * - Prisma errors are mapped to appropriate HTTP codes
 * - Stack traces are logged server-side but never sent to client in production
 *
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function globalErrorHandler(err, req, res, _next) {
  // Zod validation errors → transform to our format
  if (err.name === 'ZodError') {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(CONSTANTS.HTTP.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid input provided.',
        details,
      },
    });
  }

  // Operational AppError — expected and safe to send to client
  if (err instanceof AppError && err.isOperational) {
    // Log at warn level for 4xx, error level for 5xx
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]({
      err,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    }, err.message);

    return res.status(err.statusCode).json({
      success: false,
      error: err.toJSON(),
    });
  }

  // Prisma known request errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    logger.warn({ err, requestId: req.id }, `Unique constraint violation on ${field}`);

    return res.status(CONSTANTS.HTTP.CONFLICT).json({
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: `A record with this ${field} already exists.`,
      },
    });
  }

  if (err.code === 'P2025') {
    // Record not found
    logger.warn({ err, requestId: req.id }, 'Record not found');

    return res.status(CONSTANTS.HTTP.NOT_FOUND).json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'The requested resource was not found.',
      },
    });
  }

  // Programmer/unexpected error — log full details, send generic response
  logger.error({
    err,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  }, `Unhandled error: ${err.message}`);

  const isDev = process.env.NODE_ENV === 'development';

  return res.status(CONSTANTS.HTTP.INTERNAL_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      // Include stack trace only in development
      ...(isDev && { stack: err.stack }),
    },
  });
}

export default globalErrorHandler;
