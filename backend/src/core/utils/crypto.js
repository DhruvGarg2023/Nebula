import { createHash, randomBytes } from 'node:crypto';

/**
 * Cryptographic utility functions for authentication.
 *
 * Design decisions:
 * - Uses Node.js built-in crypto module (zero external dependencies)
 * - SHA-256 for refresh token hashing (one-way, fast, sufficient for token storage)
 * - 256-bit random tokens (32 bytes hex-encoded = 64 chars) for refresh tokens
 *
 * Security rationale:
 * - Refresh tokens are never stored in plaintext — only SHA-256 hashes
 * - If the database is compromised, hashes cannot be reversed to usable tokens
 * - 256-bit randomness provides 2^256 possible tokens (brute-force infeasible)
 */

/**
 * Hash a token using SHA-256.
 * Used to hash refresh tokens before database storage.
 *
 * @param {string} token - The plaintext token to hash
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure random token.
 * Used for refresh tokens and invitation tokens.
 *
 * @param {number} [bytes=32] - Number of random bytes (default: 32 = 256-bit)
 * @returns {string} Hex-encoded random token
 */
export function generateSecureToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}
