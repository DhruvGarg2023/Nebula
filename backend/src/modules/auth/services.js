import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import CONSTANTS from '../../config/constants.js';
import { AuthenticationError } from '../../core/errors/AppError.js';
import { hashToken, generateSecureToken } from '../../core/utils/crypto.js';
import logger from '../../core/logger/index.js';
import * as authRepo from './repositories.js';

/**
 * Authentication service — business logic layer.
 *
 * Handles:
 * - Google OAuth login (upsert user, generate token pair)
 * - Refresh token rotation with reuse detection
 * - Logout (token revocation)
 * - JWT generation and verification
 *
 * Security design (per SADD Section 12.2):
 * - Access tokens: 15 min, signed with HMAC-SHA256
 * - Refresh tokens: 7 days, stored as SHA-256 hash in DB
 * - Rotation: every refresh issues a new pair and revokes the old
 * - Reuse detection: if a revoked token is used, ALL user tokens are revoked
 */

/**
 * Generate a JWT access token.
 *
 * Claims (per SADD): { sub, email, name, iat, exp }
 * Role is intentionally NOT in the JWT (ADR-005) — fetched per-request.
 *
 * @param {{ id: string, email: string, name: string }} user
 * @returns {string} Signed JWT
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT access token.
 *
 * @param {string} token
 * @returns {{ sub: string, email: string, name: string, iat: number, exp: number }}
 * @throws {AuthenticationError}
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired.', 'TOKEN_EXPIRED');
    }
    throw new AuthenticationError('Invalid token.', 'TOKEN_INVALID');
  }
}

/**
 * Generate a complete token pair (access + refresh).
 * Stores the refresh token hash in the database.
 *
 * @param {import('@prisma/client').User} user
 * @param {{ userAgent?: string, ipAddress?: string }} meta - Request metadata
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export async function generateTokenPair(user, meta = {}) {
  const accessToken = generateAccessToken(user);

  // Generate cryptographically secure refresh token
  const refreshToken = generateSecureToken();
  const tokenHash = hashToken(refreshToken);

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONSTANTS.AUTH.REFRESH_TOKEN_EXPIRY_DAYS);

  // Store hashed token in database
  await authRepo.createRefreshToken({
    userId: user.id,
    tokenHash,
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

/**
 * Handle Google OAuth login.
 * Upserts the user and generates a token pair.
 *
 * @param {{ email: string, name: string, avatarUrl: string | null, googleId: string }} profile
 * @param {{ userAgent?: string, ipAddress?: string }} meta
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: import('@prisma/client').User }>}
 */
export async function loginWithGoogle(profile, meta = {}) {
  const user = await authRepo.upsertGoogleUser(profile);

  logger.info({ userId: user.id, email: user.email }, 'User logged in via Google OAuth');

  const { accessToken, refreshToken } = await generateTokenPair(user, meta);

  return { accessToken, refreshToken, user };
}

/**
 * Handle dev-mode login (development only).
 * Creates/finds a test user and generates a token pair.
 *
 * @param {{ email: string, name: string }} data
 * @param {{ userAgent?: string, ipAddress?: string }} meta
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: import('@prisma/client').User }>}
 */
export async function devLogin(data, meta = {}) {
  const user = await authRepo.upsertDevUser(data);

  logger.info({ userId: user.id, email: user.email }, 'Dev-mode login');

  const { accessToken, refreshToken } = await generateTokenPair(user, meta);

  return { accessToken, refreshToken, user };
}

/**
 * Refresh an access token using a refresh token.
 *
 * Implements rotation with reuse detection (per SADD Section 12.2):
 * 1. Hash the incoming refresh token
 * 2. Look up in DB by hash
 * 3. If valid & not revoked → revoke it, issue new pair
 * 4. If already revoked → SECURITY ALERT — revoke ALL user's tokens
 * 5. If expired or not found → 401
 *
 * @param {string} refreshToken - The raw refresh token from the cookie
 * @param {{ userAgent?: string, ipAddress?: string }} meta
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: import('@prisma/client').User }>}
 * @throws {AuthenticationError}
 */
export async function refreshAccessToken(refreshToken, meta = {}) {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await authRepo.findRefreshTokenByHash(tokenHash);

  // Token not found
  if (!storedToken) {
    throw new AuthenticationError('Invalid refresh token.', 'TOKEN_INVALID');
  }

  // SECURITY: Reuse detection — token was already revoked
  if (storedToken.isRevoked) {
    logger.warn(
      { userId: storedToken.userId, tokenId: storedToken.id },
      'SECURITY ALERT: Refresh token reuse detected — revoking all user tokens'
    );

    // Revoke ALL user's refresh tokens (likely token theft)
    await authRepo.revokeAllUserRefreshTokens(storedToken.userId);

    throw new AuthenticationError(
      'Refresh token has been revoked. Please log in again.',
      'TOKEN_INVALID'
    );
  }

  // Token expired
  if (storedToken.expiresAt < new Date()) {
    // Revoke the expired token for cleanup
    await authRepo.revokeRefreshToken(storedToken.id);

    throw new AuthenticationError('Refresh token has expired.', 'TOKEN_EXPIRED');
  }

  // User was soft-deleted
  if (storedToken.user.deletedAt) {
    await authRepo.revokeAllUserRefreshTokens(storedToken.userId);
    throw new AuthenticationError('Account has been deactivated.', 'TOKEN_INVALID');
  }

  // Valid token — rotate: revoke old, issue new pair
  await authRepo.revokeRefreshToken(storedToken.id);

  const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
    storedToken.user,
    meta
  );

  logger.debug({ userId: storedToken.userId }, 'Refresh token rotated successfully');

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: storedToken.user,
  };
}

/**
 * Logout — revoke the refresh token.
 *
 * @param {string} refreshToken - The raw refresh token from the cookie
 * @throws {AuthenticationError} If token not found
 */
export async function logout(refreshToken) {
  if (!refreshToken) {
    // No token to revoke — still a "successful" logout
    return;
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await authRepo.findRefreshTokenByHash(tokenHash);

  if (storedToken && !storedToken.isRevoked) {
    await authRepo.revokeRefreshToken(storedToken.id);
    logger.info({ userId: storedToken.userId }, 'User logged out — refresh token revoked');
  }
}

/**
 * Format a user object for API responses.
 * Strips sensitive fields.
 *
 * @param {import('@prisma/client').User} user
 * @returns {{ id: string, email: string, name: string, avatarUrl: string | null, preferences: object, createdAt: Date }}
 */
export function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
}
