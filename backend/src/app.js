import express from 'express';
import config from './config/index.js';
import createCorsMiddleware from './core/middleware/cors.js';
import createHelmetMiddleware from './core/middleware/helmet.js';
import requestId from './core/middleware/requestId.js';
import requestLogger from './core/middleware/requestLogger.js';
import notFoundHandler from './core/middleware/notFound.js';
import { globalErrorHandler } from './core/errors/index.js';
import systemRoutes from './modules/system/routes.js';

/**
 * Express application factory.
 *
 * This is the composition root — where all middleware and routes
 * are assembled. The app is created as a factory function (not a
 * singleton) so tests can create isolated instances.
 *
 * Middleware order matters:
 * 1. Security headers (Helmet)
 * 2. CORS
 * 3. Body parsing
 * 4. Request ID injection
 * 5. Request logging
 * 6. Routes
 * 7. 404 handler
 * 8. Global error handler (MUST be last)
 */
function createApp() {
  const app = express();

  // ── Security Headers ─────────────────────────────────────────
  app.use(createHelmetMiddleware());

  // ── CORS ─────────────────────────────────────────────────────
  app.use(createCorsMiddleware(config.CORS_ORIGIN));

  // ── Body Parsing ─────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Request ID ───────────────────────────────────────────────
  app.use(requestId);

  // ── Request Logging ──────────────────────────────────────────
  app.use(requestLogger);

  // ── Trust Proxy ──────────────────────────────────────────────
  // Required behind Nginx/ALB for correct req.ip
  app.set('trust proxy', 1);

  // ════════════════════════════════════════════════════════════
  //  ROUTES
  // ════════════════════════════════════════════════════════════

  // System routes (health checks) — no /api/v1 prefix
  app.use('/api/v1', systemRoutes);

  // ── Future module routes will be registered here ─────────
  // app.use('/api/v1/auth', authRoutes);
  // app.use('/api/v1/users', userRoutes);
  // app.use('/api/v1/rooms', roomRoutes);
  // ...

  // ── 404 Handler ──────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global Error Handler (must be last) ──────────────────────
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
