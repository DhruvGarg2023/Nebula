import { z } from 'zod';

export const reviewRequestSchema = z.object({
  fileId: z.string().uuid('File ID must be a valid UUID').optional(),
  sourceCode: z.string().trim().max(50000, 'Source code cannot exceed 50,000 characters').optional(),
  language: z.string().trim().default('javascript').optional(),
});

export const explainRequestSchema = z.object({
  sourceCode: z.string().trim().min(1, 'Source code is required').max(50000, 'Source code cannot exceed 50,000 characters'),
  language: z.string().trim().default('javascript').optional(),
});

export const suggestRequestSchema = z.object({
  sourceCode: z.string().trim().min(1, 'Source code is required').max(50000, 'Source code cannot exceed 50,000 characters'),
  instruction: z.string().trim().max(1000, 'Instruction cannot exceed 1,000 characters').optional(),
  language: z.string().trim().default('javascript').optional(),
});
