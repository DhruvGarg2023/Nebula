import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  language: z.string().min(1).max(50).default('javascript'),
  isPublic: z.boolean().default(false),
  settings: z.record(z.any()).default({}),
});

export const UpdateRoomSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  language: z.string().min(1).max(50).optional(),
  isPublic: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided to update the room.',
});

export const CreateInvitationSchema = z.object({
  role: z.enum(['viewer', 'editor']).default('editor'),
  expiresInHours: z.coerce.number().int().min(1).max(168).default(24), // 1 hour to 1 week
});

export const JoinRoomSchema = z.object({
  token: z.string().min(30).max(100, 'Invalid token length'),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['viewer', 'editor', 'admin']),
});

export const ListRoomsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
