import { Router } from 'express';
import passport from 'passport';
import { configureGoogleStrategy } from './strategies/google.js';
import validate from '../../core/middleware/validate.js';
import rateLimiter from '../../core/middleware/rateLimiter.js';
import CONSTANTS from '../../config/constants.js';
import * as authController from './controllers.js';
import { DevLoginSchema } from './dto.js';
import authenticate from '../../core/middleware/authenticate.js';

const router = Router();

// Initialize Passport strategy
configureGoogleStrategy(passport);

// Apply rate limiting to all auth routes (10 requests / minute)
router.use(rateLimiter(CONSTANTS.RATE_LIMITS.AUTH));

// ── Google OAuth Routes ────────────────────────────────────────

// Trigger Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { session: false })
);

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=auth_failed' }),
  authController.googleCallback
);

// ── Token Management ───────────────────────────────────────────

// Refresh token
router.post('/refresh', authController.refresh);

// Logout (requires auth)
router.post('/logout', authenticate, authController.logout);

// ── Development Tools ──────────────────────────────────────────

// Dev login (only available in development/staging)
router.post('/dev/login', validate(DevLoginSchema), authController.devLogin);

export default router;
