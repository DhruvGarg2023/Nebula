import { z } from 'zod';

const ALLOWED_LANGUAGES = ['javascript', 'js', 'node', 'python', 'py', 'python3', 'c', 'cpp', 'c++', 'java'];

export const executeCodeSchema = z.object({
  language: z.string().trim().toLowerCase().refine((lang) => ALLOWED_LANGUAGES.includes(lang), {
    message: `Unsupported language. Allowed languages: ${ALLOWED_LANGUAGES.join(', ')}`,
  }),
  sourceCode: z.string().min(1, 'Source code cannot be empty').max(50000, 'Source code exceeds maximum length of 50KB'),
  fileId: z.string().uuid().optional(),
});

export const listJobsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  cursor: z.string().uuid().optional(),
});
