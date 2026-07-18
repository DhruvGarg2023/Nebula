/**
 * Machine-readable error codes.
 * Single source of truth — prevents typos and enables IDE autocomplete.
 */
const ERROR_CODES = Object.freeze({
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Authentication
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_FAILED: 'EXTERNAL_SERVICE_FAILED',
  AI_SERVICE_FAILED: 'AI_SERVICE_FAILED',
  GITHUB_SERVICE_FAILED: 'GITHUB_SERVICE_FAILED',
  COMPILER_TIMEOUT: 'COMPILER_TIMEOUT',

  // Internal
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

export default ERROR_CODES;
