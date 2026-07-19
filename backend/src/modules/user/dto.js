import { z } from 'zod';

/**
 * Zod schemas for user payloads.
 */

/**
 * Update profile request body.
 * All fields are optional.
 */
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').nullable().optional(),
  preferences: z.record(z.any()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (name, avatarUrl, preferences) must be provided to update.',
});

/**
 * User search query parameters.
 */
export const UserSearchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').max(100),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
