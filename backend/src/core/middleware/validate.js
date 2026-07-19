import { ValidationError } from '../errors/AppError.js';

/**
 * Zod schema validation middleware factory.
 *
 * Creates an Express middleware that validates request data against a Zod schema.
 * On failure, throws a ValidationError with field-level details.
 *
 * Supports validating:
 * - body (POST/PUT/PATCH payloads)
 * - query (GET query parameters)
 * - params (URL path parameters)
 *
 * Usage:
 *   router.post('/rooms', validate(CreateRoomSchema), controller.create)
 *   router.get('/rooms', validate(ListQuerySchema, 'query'), controller.list)
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError('Invalid input provided.', details);
    }

    // Express 5 defines req.query as a getter. We use Object.defineProperty to override it.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };
}

export default validate;
