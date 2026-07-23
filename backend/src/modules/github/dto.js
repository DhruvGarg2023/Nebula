import { z } from 'zod';

export const connectTokenSchema = z.object({
  accessToken: z.string().trim().min(1, 'Access token is required'),
  username: z.string().trim().min(1, 'Username is required'),
});

export const importRepoSchema = z.object({
  owner: z.string().trim().min(1, 'Repository owner is required'),
  repo: z.string().trim().min(1, 'Repository name is required'),
  branch: z.string().trim().default('main').optional(),
});

export const commitPushSchema = z.object({
  owner: z.string().trim().min(1, 'Repository owner is required'),
  repo: z.string().trim().min(1, 'Repository name is required'),
  branch: z.string().trim().default('main').optional(),
  message: z.string().trim().min(1, 'Commit message is required').max(500, 'Commit message cannot exceed 500 characters'),
});

export const createPRSchema = z.object({
  owner: z.string().trim().min(1, 'Repository owner is required'),
  repo: z.string().trim().min(1, 'Repository name is required'),
  title: z.string().trim().min(1, 'PR title is required').max(200, 'PR title cannot exceed 200 characters'),
  body: z.string().trim().optional(),
  head: z.string().trim().min(1, 'Head branch is required'),
  base: z.string().trim().default('main').optional(),
});
