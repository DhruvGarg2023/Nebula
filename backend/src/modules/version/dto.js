import { z } from 'zod';

export const createVersionSchema = z.object({
  label: z.string().trim().max(100, 'Label cannot exceed 100 characters').optional(),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
});

export const listVersionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const diffVersionSchema = z.object({
  targetVersionId: z.string().uuid('Invalid target version ID').optional(),
});
