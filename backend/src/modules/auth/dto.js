import { z } from 'zod';

/**
 * Zod schemas for authentication payloads.
 *
 * These schemas validate all input at the API boundary,
 * ensuring no invalid data reaches the service layer.
 */

/**
 * Dev-mode login request body.
 * Only available when NODE_ENV !== 'production'.
 */
export const DevLoginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
});

/**
 * Response shape for login/refresh endpoints.
 * Used for documentation — not typically validated on output.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});
