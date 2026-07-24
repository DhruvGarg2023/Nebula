import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { AuthenticationError } from '../errors/AppError.js';
import logger from '../logger/index.js';

/**
 * JWT authentication middleware.
 *
 * Design decisions (per SADD Section 12.2):
 * - Extracts token from `Authorization: Bearer <token>` header
 * - Verifies signature and expiry using jsonwebtoken
 * - Attaches decoded claims to `req.user` ({ id, email, name })
 * - Returns 401 with specific error codes (TOKEN_EXPIRED, TOKEN_INVALID)
 * - Role is NOT in JWT — fetched per-request for immediate RBAC changes (ADR-005)
 *
 * Usage:
 *   router.get('/users/me', authenticate, controller.getMe)
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, _res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    throw new AuthenticationError(
      'Access token is required. Provide it in the Authorization header as: Bearer <token> or ?token=<token>',
      'TOKEN_MISSING'
    );
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach minimal user info from JWT claims to req.user
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.debug({ err }, 'JWT expired');
      throw new AuthenticationError(
        'Your session has expired. Please refresh your token.',
        'TOKEN_EXPIRED'
      );
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      logger.debug({ err }, 'JWT verification failed');
      throw new AuthenticationError(
        'Invalid access token.',
        'TOKEN_INVALID'
      );
    }

    // Unexpected error
    throw err;
  }
}

export default authenticate;
