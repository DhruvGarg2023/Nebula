import cors from 'cors';

/**
 * CORS configuration factory.
 *
 * Security decisions:
 * - Origin is strictly locked to the configured frontend domain
 * - Credentials enabled for HTTP-only refresh token cookies
 * - Explicit methods and headers whitelist
 * - Preflight results cached for 1 hour to reduce OPTIONS requests
 *
 * @param {string} origin - Allowed origin (from config)
 * @returns {import('express').RequestHandler}
 */
function createCorsMiddleware(origin) {
  return cors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 3600, // Cache preflight for 1 hour
  });
}

export default createCorsMiddleware;
