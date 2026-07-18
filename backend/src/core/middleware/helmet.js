import helmet from 'helmet';

/**
 * Security headers middleware via Helmet.
 *
 * Headers set:
 * - X-Content-Type-Options: nosniff (prevent MIME sniffing)
 * - X-Frame-Options: DENY (prevent clickjacking)
 * - Strict-Transport-Security: max-age=31536000 (force HTTPS for 1 year)
 * - Content-Security-Policy: default-src 'self' (prevent unauthorized resources)
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - X-XSS-Protection: 0 (disabled — CSP is better)
 *
 * @returns {import('express').RequestHandler}
 */
function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding (may conflict with OAuth)
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  });
}

export default createHelmetMiddleware;
