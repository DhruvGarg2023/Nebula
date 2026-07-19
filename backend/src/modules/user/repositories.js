import prisma from '../../core/database/prisma.js';

/**
 * User data access layer.
 */

/**
 * Find a user by their ID.
 * Excludes soft-deleted users.
 *
 * @param {string} id
 * @returns {Promise<import('@prisma/client').User | null>}
 */
export async function findById(id) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

/**
 * Update user profile fields.
 *
 * @param {string} id
 * @param {{ name?: string, avatarUrl?: string | null, preferences?: object }} data
 * @returns {Promise<import('@prisma/client').User>}
 */
export async function update(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete a user account.
 * Sets deletedAt timestamp.
 *
 * @param {string} id
 * @returns {Promise<import('@prisma/client').User>}
 */
export async function softDelete(id) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Search for active users by name or email.
 * Used for user invitation autocomplete.
 *
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<import('@prisma/client').User>>}
 */
export async function searchByNameOrEmail(query, limit) {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { name: 'asc' },
  });
}
