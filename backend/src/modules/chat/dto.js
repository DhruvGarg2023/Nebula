import { z } from 'zod';

export const listMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  cursor: z.string().uuid().optional(),
});

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
});
