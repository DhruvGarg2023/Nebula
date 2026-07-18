import { v4 as uuidv4 } from 'uuid';

/**
 * Injects a unique request ID into every incoming request.
 *
 * Why:
 * - Enables request correlation across logs, errors, and downstream services
 * - If client sends X-Request-ID header, we honor it (useful for end-to-end tracing)
 * - Otherwise, generate a new UUIDv4
 *
 * The ID is attached to req.id and sent back in X-Request-ID response header.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}

export default requestId;
