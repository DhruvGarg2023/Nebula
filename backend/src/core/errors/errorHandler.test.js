import { describe, it, expect, vi, beforeEach } from 'vitest';
import globalErrorHandler from './errorHandler.js';
import { AppError, ValidationError, NotFoundError } from './AppError.js';

/**
 * Unit tests for the global error handler middleware.
 * Tests that errors are transformed into the correct JSON response format.
 */

// Mock logger to prevent console output during tests
vi.mock('../logger/index.js', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
  },
}));

function createMockReq(overrides = {}) {
  return {
    id: 'test-request-id',
    method: 'GET',
    originalUrl: '/test',
    ...overrides,
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    _body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res._body = body;
      return res;
    },
  };
  return res;
}

const nextFn = vi.fn();

describe('globalErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Operational AppError ─────────────────────────────────────
  describe('Operational AppErrors', () => {
    it('should return 400 for ValidationError', () => {
      const err = new ValidationError('Bad input', [{ field: 'email', message: 'Invalid' }]);
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(400);
      expect(res._body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Bad input',
          details: [{ field: 'email', message: 'Invalid' }],
        },
      });
    });

    it('should return 404 for NotFoundError', () => {
      const err = new NotFoundError('Room');
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(404);
      expect(res._body.error.code).toBe('NOT_FOUND');
      expect(res._body.error.message).toBe('Room not found.');
    });

    it('should handle AppError without details', () => {
      const err = new AppError('CUSTOM', 'Custom error', 422);
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(422);
      expect(res._body.error.details).toBeUndefined();
    });
  });

  // ── Zod Errors ───────────────────────────────────────────────
  describe('Zod errors', () => {
    it('should transform ZodError into validation error response', () => {
      const zodError = {
        name: 'ZodError',
        issues: [
          { path: ['email'], message: 'Required' },
          { path: ['name'], message: 'Too short' },
        ],
      };
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(zodError, req, res, nextFn);

      expect(res.statusCode).toBe(400);
      expect(res._body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input provided.',
          details: [
            { field: 'email', message: 'Required' },
            { field: 'name', message: 'Too short' },
          ],
        },
      });
    });
  });

  // ── Prisma Errors ────────────────────────────────────────────
  describe('Prisma errors', () => {
    it('should return 409 for unique constraint violations (P2002)', () => {
      const err = { code: 'P2002', meta: { target: ['email'] } };
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(409);
      expect(res._body.error.code).toBe('CONFLICT');
      expect(res._body.error.message).toContain('email');
    });

    it('should return 404 for record not found (P2025)', () => {
      const err = { code: 'P2025' };
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(404);
      expect(res._body.error.code).toBe('NOT_FOUND');
    });
  });

  // ── Unexpected Errors ────────────────────────────────────────
  describe('Unexpected/programmer errors', () => {
    it('should return generic 500 for unknown errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const err = new Error('Something broke');
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(500);
      expect(res._body.error.code).toBe('INTERNAL_ERROR');
      expect(res._body.error.message).toBe(
        'An unexpected error occurred. Please try again later.'
      );
      // Stack trace should NOT be in production response
      expect(res._body.error.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const err = new Error('Dev error');
      const req = createMockReq();
      const res = createMockRes();

      globalErrorHandler(err, req, res, nextFn);

      expect(res.statusCode).toBe(500);
      expect(res._body.error.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
