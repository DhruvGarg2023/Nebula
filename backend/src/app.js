import express from 'express';
import config from './config/index.js';
import createCorsMiddleware from './core/middleware/cors.js';
import createHelmetMiddleware from './core/middleware/helmet.js';
import requestId from './core/middleware/requestId.js';
import requestLogger from './core/middleware/requestLogger.js';
import notFoundHandler from './core/middleware/notFound.js';
import { globalErrorHandler } from './core/errors/index.js';
import systemRoutes from './modules/system/routes.js';
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/user/routes.js';
import roomRoutes from './modules/room/routes.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';

function createApp() {
  const app = express();

  // ── Security Headers ─────────────────────────────────────────
  app.use(createHelmetMiddleware());

  // ── CORS ─────────────────────────────────────────────────────
  app.use(createCorsMiddleware(config.CORS_ORIGIN));

  // ── Body Parsing ─────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  
  // ── Passport Initialization ────────────────────────────────────
  app.use(passport.initialize());

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
  
  // Feature modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/rooms', roomRoutes);


  // ── 404 Handler ──────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global Error Handler (must be last) ──────────────────────
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
