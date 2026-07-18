import CONSTANTS from '../../config/constants.js';

/**
 * Base application error class.
 * All custom errors extend this. The global error handler uses
 * `isOperational` to distinguish expected errors (validation, auth)
 * from unexpected ones (null reference, OOM).
 *
 * - Operational errors → send structured response to client
 * - Programmer errors → log, report to Sentry, return generic 500
 */
export class AppError extends Error {
  /**
   * @param {string} code - Machine-readable error code (e.g., 'VALIDATION_FAILED')
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {object} [details] - Additional error details (field-level errors, etc.)
   * @param {boolean} [isOperational=true] - Whether this is an expected error
   */
  constructor(code, message, statusCode, details = null, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize to the standard API error response format.
   * @returns {object}
   */
  toJSON() {
    const json = {
      code: this.code,
      message: this.message,
    };
    if (this.details) {
      json.details = this.details;
    }
    return json;
  }
}

/**
 * 400 Bad Request — Input validation failed.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} [message='Invalid input provided.']
   * @param {Array<{field: string, message: string}>} [details=[]]
   */
  constructor(message = 'Invalid input provided.', details = []) {
    super('VALIDATION_FAILED', message, CONSTANTS.HTTP.BAD_REQUEST, details);
  }
}

/**
 * 401 Unauthorized — Authentication failed.
 */
export class AuthenticationError extends AppError {
  /**
   * @param {string} [message='Authentication failed.']
   * @param {string} [code='AUTHENTICATION_FAILED']
   */
  constructor(message = 'Authentication failed.', code = 'AUTHENTICATION_FAILED') {
    super(code, message, CONSTANTS.HTTP.UNAUTHORIZED);
  }
}

/**
 * 403 Forbidden — Insufficient permissions.
 */
export class ForbiddenError extends AppError {
  /**
   * @param {string} [message='You do not have permission to perform this action.']
   */
  constructor(message = 'You do not have permission to perform this action.') {
    super('FORBIDDEN', message, CONSTANTS.HTTP.FORBIDDEN);
  }
}

/**
 * 404 Not Found — Resource doesn't exist.
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} [resource='Resource']
   */
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found.`, CONSTANTS.HTTP.NOT_FOUND);
  }
}

/**
 * 409 Conflict — Duplicate resource.
 */
export class ConflictError extends AppError {
  /**
   * @param {string} [message='Resource already exists.']
   */
  constructor(message = 'Resource already exists.') {
    super('CONFLICT', message, CONSTANTS.HTTP.CONFLICT);
  }
}

/**
 * 429 Too Many Requests — Rate limit exceeded.
 */
export class RateLimitError extends AppError {
  /**
   * @param {number} retryAfter - Seconds until the client can retry
   * @param {object} [limits] - Rate limit details
   */
  constructor(retryAfter = 60, limits = {}) {
    super(
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      CONSTANTS.HTTP.RATE_LIMITED,
      { retryAfter, ...limits }
    );
  }
}

/**
 * 502 Bad Gateway — External service failed.
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {string} service - Name of the external service (e.g., 'OpenAI', 'GitHub')
   * @param {string} [message]
   */
  constructor(service, message = `${service} service is currently unavailable.`) {
    super('EXTERNAL_SERVICE_FAILED', message, CONSTANTS.HTTP.BAD_GATEWAY, { service });
  }
}
