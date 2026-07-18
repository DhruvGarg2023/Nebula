import { describe, it, expect, vi, beforeEach } from 'vitest';
import validate from './validate.js';
import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
  });

  let next;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should call next() on valid body', () => {
    const req = { body: { name: 'John', email: 'john@example.com' } };
    const res = {};

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(); // called with no args (success)
  });

  it('should replace body with parsed data (enables Zod defaults/transforms)', () => {
    const schemaWithDefault = z.object({
      name: z.string(),
      role: z.string().default('editor'),
    });

    const req = { body: { name: 'John' } };
    const res = {};

    validate(schemaWithDefault)(req, res, next);

    expect(req.body.role).toBe('editor');
  });

  it('should throw ValidationError on invalid body', () => {
    const req = { body: { name: 'J', email: 'not-email' } };
    const res = {};

    expect(() => validate(schema)(req, res, next)).toThrow(ValidationError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should include field-level details in validation error', () => {
    const req = { body: { name: 'J', email: 'not-email' } };
    const res = {};

    try {
      validate(schema)(req, res, next);
    } catch (err) {
      expect(err.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
        ])
      );
    }
  });

  it('should validate query params when source is "query"', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive(),
    });

    const req = { query: { page: '5' } };
    const res = {};

    validate(querySchema, 'query')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.query.page).toBe(5); // Coerced to number
  });

  it('should validate params when source is "params"', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const req = { params: { id: '550e8400-e29b-41d4-a716-446655440000' } };
    const res = {};

    validate(paramsSchema, 'params')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
