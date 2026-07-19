import { NotFoundError } from '../../core/errors/AppError.js';
import logger from '../../core/logger/index.js';
import * as userRepo from './repositories.js';
import { revokeAllUserRefreshTokens } from '../auth/repositories.js';

/**
 * User service — business logic layer.
 */

/**
 * Get user profile by ID.
 *
 * @param {string} userId
 * @returns {Promise<import('@prisma/client').User>}
 * @throws {NotFoundError}
 */
export async function getProfile(userId) {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

/**
 * Update user profile.
 *
 * @param {string} userId
 * @param {{ name?: string, avatarUrl?: string | null, preferences?: object }} data
 * @returns {Promise<import('@prisma/client').User>}
 */
export async function updateProfile(userId, data) {
  // Ensure user exists first
  await getProfile(userId);

  const updatedUser = await userRepo.update(userId, data);
  logger.info({ userId }, 'User profile updated');

  return updatedUser;
}

/**
 * Search active users by name or email.
 * Strips sensitive data from results before returning.
 *
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<{ id: string, name: string, email: string, avatarUrl: string | null }>>}
 */
export async function searchUsers(query, limit) {
  const users = await userRepo.searchByNameOrEmail(query, limit);

  // Strip sensitive fields
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
  }));
}

/**
 * Soft delete a user account and revoke all their tokens.
 *
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function deleteAccount(userId) {
  // Ensure user exists first
  await getProfile(userId);

  await userRepo.softDelete(userId);

  // Revoke all tokens so they are immediately logged out everywhere
  await revokeAllUserRefreshTokens(userId);

  logger.info({ userId }, 'User account soft deleted');
}
