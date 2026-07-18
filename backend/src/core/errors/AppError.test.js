import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
} from './AppError.js';

describe('AppError', () => {
  it('should create an error with all properties', () => {
    const err = new AppError('TEST_CODE', 'Test message', 400, { field: 'name' });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('Test message');
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'name' });
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe('AppError');
    expect(err.stack).toBeDefined();
  });

  it('should support non-operational errors', () => {
    const err = new AppError('INTERNAL', 'Crash', 500, null, false);

    expect(err.isOperational).toBe(false);
  });

  it('should serialize to JSON correctly', () => {
    const err = new AppError('TEST', 'msg', 400, [{ field: 'email', message: 'required' }]);
    const json = err.toJSON();

    expect(json).toEqual({
      code: 'TEST',
      message: 'msg',
      details: [{ field: 'email', message: 'required' }],
    });
  });

  it('should omit details from JSON when null', () => {
    const err = new AppError('TEST', 'msg', 400);
    const json = err.toJSON();

    expect(json).toEqual({ code: 'TEST', message: 'msg' });
    expect(json.details).toBeUndefined();
  });
});

describe('ValidationError', () => {
  it('should default to 400 status code and VALIDATION_FAILED code', () => {
    const err = new ValidationError();

    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_FAILED');
    expect(err.message).toBe('Invalid input provided.');
    expect(err.isOperational).toBe(true);
  });

  it('should accept custom message and details', () => {
    const details = [{ field: 'name', message: 'Required' }];
    const err = new ValidationError('Custom message', details);

    expect(err.message).toBe('Custom message');
    expect(err.details).toEqual(details);
  });
});

describe('AuthenticationError', () => {
  it('should default to 401 status code', () => {
    const err = new AuthenticationError();

    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_FAILED');
    expect(err.message).toBe('Authentication failed.');
  });

  it('should accept custom code for token errors', () => {
    const err = new AuthenticationError('Token expired', 'TOKEN_EXPIRED');

    expect(err.code).toBe('TOKEN_EXPIRED');
    expect(err.message).toBe('Token expired');
  });
});

describe('ForbiddenError', () => {
  it('should default to 403 status code', () => {
    const err = new ForbiddenError();

    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});

describe('NotFoundError', () => {
  it('should default to 404 with resource name', () => {
    const err = new NotFoundError('Room');

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Room not found.');
  });

  it('should use default resource name', () => {
    const err = new NotFoundError();

    expect(err.message).toBe('Resource not found.');
  });
});

describe('ConflictError', () => {
  it('should default to 409 status code', () => {
    const err = new ConflictError();

    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('should include retry-after details', () => {
    const err = new RateLimitError(45, { limit: 10, window: '60s' });

    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(err.details.retryAfter).toBe(45);
    expect(err.details.limit).toBe(10);
  });
});

describe('ExternalServiceError', () => {
  it('should include service name', () => {
    const err = new ExternalServiceError('OpenAI');

    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('EXTERNAL_SERVICE_FAILED');
    expect(err.details.service).toBe('OpenAI');
    expect(err.message).toBe('OpenAI service is currently unavailable.');
  });
});
