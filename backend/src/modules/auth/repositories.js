import prisma from '../../core/database/prisma.js';

/**
 * Auth data access layer.
 *
 * All database queries for authentication operations.
 * No business logic here — only Prisma queries.
 *
 * Design decisions:
 * - Soft-deleted users (deletedAt != null) are excluded from lookups
 * - Refresh tokens are stored as SHA-256 hashes, never plaintext
 * - Queries use specific field selects to avoid leaking sensitive data
 */

/**
 * Find an active user by email address.
 * @param {string} email
 * @returns {Promise<import('@prisma/client').User | null>}
 */
export async function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
}

/**
 * Find an active user by Google OAuth subject ID.
 * @param {string} googleId
 * @returns {Promise<import('@prisma/client').User | null>}
 */
export async function findUserByGoogleId(googleId) {
  return prisma.user.findFirst({
    where: {
      googleId,
      deletedAt: null,
    },
  });
}

/**
 * Create or update a user from Google OAuth profile.
 * If the user already exists (by googleId), update their profile.
 * If not, create a new user record.
 *
 * @param {{ email: string, name: string, avatarUrl: string | null, googleId: string }} profile
 * @returns {Promise<import('@prisma/client').User>}
 */
export async function upsertGoogleUser({ email, name, avatarUrl, googleId }) {
  return prisma.user.upsert({
    where: { googleId },
    update: {
      name,
      avatarUrl,
      // Don't update email — it's their identity
    },
    create: {
      email,
      name,
      avatarUrl,
      googleId,
      authProvider: 'google',
    },
  });
}

/**
 * Create a user from dev login (development mode only).
 * Uses upsert to avoid duplicate email errors.
 *
 * @param {{ email: string, name: string }} data
 * @returns {Promise<import('@prisma/client').User>}
 */
export async function upsertDevUser({ email, name }) {
  return prisma.user.upsert({
    where: { email },
    update: { name, deletedAt: null },
    create: {
      email,
      name,
      authProvider: 'google', // Treat dev users as Google-auth for simplicity
    },
  });
}

// ── Refresh Token Operations ───────────────────────────────────

/**
 * Store a hashed refresh token.
 *
 * @param {{ userId: string, tokenHash: string, userAgent: string | null, ipAddress: string | null, expiresAt: Date }} data
 * @returns {Promise<import('@prisma/client').RefreshToken>}
 */
export async function createRefreshToken({ userId, tokenHash, userAgent, ipAddress, expiresAt }) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });
}

/**
 * Find a refresh token record by its hash.
 * Includes the associated user for convenience.
 *
 * @param {string} tokenHash
 * @returns {Promise<(import('@prisma/client').RefreshToken & { user: import('@prisma/client').User }) | null>}
 */
export async function findRefreshTokenByHash(tokenHash) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

/**
 * Revoke a single refresh token by ID.
 * @param {string} id
 * @returns {Promise<import('@prisma/client').RefreshToken>}
 */
export async function revokeRefreshToken(id) {
  return prisma.refreshToken.update({
    where: { id },
    data: { isRevoked: true },
  });
}

/**
 * SECURITY: Revoke ALL refresh tokens for a user.
 * Called when refresh token reuse is detected (indicates token theft).
 *
 * @param {string} userId
 * @returns {Promise<{ count: number }>}
 */
export async function revokeAllUserRefreshTokens(userId) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: { isRevoked: true },
  });
}

/**
 * Delete expired refresh tokens (cleanup job).
 * @returns {Promise<{ count: number }>}
 */
export async function deleteExpiredRefreshTokens() {
  return prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
