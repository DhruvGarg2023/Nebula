import { z } from 'zod';

export const createFileSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255),
  language: z.string().min(1, 'Language is required').max(50),
  content: z.string().optional()
});

export const updateFileSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255).optional(),
  language: z.string().min(1, 'Language is required').max(50).optional(),
  content: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
