import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.string().optional().transform((val) => val === 'true'),
});

export const markReadParamsSchema = z.object({
  notificationId: z.string().uuid('Notification ID must be a valid UUID'),
});
