import config from '../../config/index.js';
import CONSTANTS from '../../config/constants.js';
import { AuthenticationError } from '../../core/errors/AppError.js';
import asyncHandler from '../../core/utils/asyncHandler.js';
import * as authService from './services.js';

/**
 * Cookie configuration for refresh tokens.
 * Per SADD Section 12.2:
 * - httpOnly: true  → prevents XSS token theft
 * - secure: true    → only sent over HTTPS (production)
 * - sameSite: strict → prevents CSRF
 * - path restricted → only sent to auth endpoints
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CONSTANTS.AUTH.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  };
}

/**
 * GET /auth/google
 * Redirects to Google OAuth consent screen.
 * Handled by Passport middleware in routes.js — this is a no-op placeholder.
 */
export const googleAuth = asyncHandler(async (_req, _res) => {
  // Passport handles the redirect via passport.authenticate('google')
  // This controller is never actually called — the middleware redirects first
});

/**
 * GET /auth/google/callback
 * Handles the Google OAuth callback after user grants consent.
 * Passport populates req.user with the normalized Google profile.
 */
export const googleCallback = asyncHandler(async (req, res) => {
  // req.user is the normalized profile from the Passport strategy
  const profile = req.user;

  if (!profile) {
    throw new AuthenticationError('Google authentication failed.', 'AUTHENTICATION_FAILED');
  }

  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const { accessToken, refreshToken, user } = await authService.loginWithGoogle(profile, meta);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      accessToken,
      user: authService.formatUserResponse(user),
    },
  });
});

/**
 * POST /auth/refresh
 * Exchange a refresh token (from cookie) for a new token pair.
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AuthenticationError(
      'Refresh token is required. It should be present as an HTTP-only cookie.',
      'TOKEN_MISSING'
    );
  }

  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const result = await authService.refreshAccessToken(refreshToken, meta);

  // Set new refresh token cookie (rotation)
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: authService.formatUserResponse(result.user),
    },
  });
});

/**
 * POST /auth/logout
 * Revoke the refresh token and clear the cookie.
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout(refreshToken);

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  });

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      message: 'Logged out successfully.',
    },
  });
});

/**
 * POST /auth/dev/login
 * Development-only endpoint for testing without Google OAuth.
 * Creates or finds a test user and returns a token pair.
 */
export const devLogin = asyncHandler(async (req, res) => {
  if (config.NODE_ENV === 'production') {
    throw new AuthenticationError(
      'Dev login is not available in production.',
      'FORBIDDEN'
    );
  }

  const { email, name } = req.body;

  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const { accessToken, refreshToken, user } = await authService.devLogin(
    { email, name },
    meta
  );

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      accessToken,
      user: authService.formatUserResponse(user),
    },
  });
});
