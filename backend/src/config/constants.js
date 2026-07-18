/**
 * Application-wide constants.
 * Centralizes magic numbers and strings to prevent duplication.
 */
const CONSTANTS = Object.freeze({
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Rate Limiting (requests per window)
  RATE_LIMITS: {
    AUTH: { windowMs: 60_000, max: 10 },
    AI: { windowMs: 60_000, max: 5 },
    COMPILER: { windowMs: 60_000, max: 10 },
    GENERAL: { windowMs: 60_000, max: 100 },
  },

  // Roles
  ROLES: {
    VIEWER: 'viewer',
    EDITOR: 'editor',
    ADMIN: 'admin',
  },

  // Role hierarchy (higher index = more permissions)
  ROLE_HIERARCHY: ['viewer', 'editor', 'admin'],

  // Auth
  AUTH: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY_DAYS: 7,
    BCRYPT_ROUNDS: 12,
  },

  // Redis Key Prefixes
  REDIS_KEYS: {
    PRESENCE: 'presence:room:',
    HEARTBEAT: 'presence:heartbeat:',
    SOCKET_USER: 'socket:user:',
    SOCKET_META: 'socket:meta:',
    DOC_CACHE: 'doc:room:',
    CURSOR: 'cursor:room:',
    RATE_LIMIT: 'ratelimit:',
    AI_USAGE: 'ai:usage:',
    AI_BUDGET: 'ai:budget:',
    LOCK: 'lock:',
    AUTH_ROOM: 'auth:room:',
    USER_PROFILE: 'user:profile:',
  },

  // Queue Names
  QUEUES: {
    COMPILER: 'compiler-queue',
    AI: 'ai-queue',
    GITHUB: 'github-queue',
    NOTIFICATION: 'notification-queue',
    CLEANUP: 'cleanup-queue',
  },

  // HTTP Status Codes (for clarity)
  HTTP: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    BAD_GATEWAY: 502,
    UNAVAILABLE: 503,
  },
});

export default CONSTANTS;
