/**
 * Barrel export for error module.
 * Provides a single import point for all error classes and utilities.
 */
export { AppError, ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError, RateLimitError, ExternalServiceError } from './AppError.js';
export { default as ERROR_CODES } from './errorCodes.js';
export { default as globalErrorHandler } from './errorHandler.js';
