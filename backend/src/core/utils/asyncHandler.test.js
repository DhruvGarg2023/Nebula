import { describe, it, expect, vi } from 'vitest';
import asyncHandler from './asyncHandler.js';

describe('asyncHandler', () => {
  it('should call the wrapped function', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const req = {};
    const res = {};
    const next = vi.fn();

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it('should forward rejected promises to next()', async () => {
    const error = new Error('Test error');
    const handler = vi.fn().mockRejectedValue(error);
    const req = {};
    const res = {};
    const next = vi.fn();

    await asyncHandler(handler)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should forward synchronous thrown errors to next()', async () => {
    const error = new Error('Thrown error');
    // Synchronous throw inside handler — Promise.resolve() converts it to a rejection
    const handler = vi.fn(() => {
      throw error;
    });
    const req = {};
    const res = {};
    const next = vi.fn();

    // The throw happens synchronously inside Promise.resolve(fn()),
    // so the error propagates as an unhandled throw. We need to verify
    // the asyncHandler's .catch() captures it.
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next() on success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const req = {};
    const res = {};
    const next = vi.fn();

    await asyncHandler(handler)(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
