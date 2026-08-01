import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Shared Zod Validation Schemas
// Mirrors backend DTOs for client-side validation.
// ═══════════════════════════════════════════════════════════════

/** Room creation schema */
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be under 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  language: z.string().min(1, "Language is required").optional(),
  isPublic: z.boolean().optional(),
});

/** Room update schema */
export const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be under 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .nullable()
    .optional(),
  language: z.string().optional(),
  isPublic: z.boolean().optional(),
});

/** File creation schema */
export const createFileSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be under 255 characters")
    .trim(),
  language: z.string().min(1, "Language is required"),
  content: z.string().optional(),
});

/** Profile update schema */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Must be a valid URL").nullable().optional(),
});

/** Dev login schema */
export const devLoginSchema = z.object({
  email: z.string().email("Must be a valid email"),
  name: z.string().min(1, "Name is required").max(100),
});

/** Version snapshot schema */
export const createVersionSchema = z.object({
  label: z
    .string()
    .max(100, "Label must be under 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
});

/** Invitation schema */
export const createInvitationSchema = z.object({
  role: z.enum(["viewer", "editor"]).optional(),
  expiresInHours: z.number().min(1).max(168).optional(), // 1h to 7 days
});

/** Compiler execution schema */
export const executeCodeSchema = z.object({
  language: z.string().min(1, "Language is required"),
  sourceCode: z.string().min(1, "Source code is required"),
  fileId: z.string().optional(),
});

/** Chat message schema */
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be under 2000 characters")
    .trim(),
});

/** AI explain/suggest schemas */
export const explainCodeSchema = z.object({
  sourceCode: z.string().min(1, "Source code is required"),
  language: z.string().optional(),
});

export const suggestImprovementsSchema = z.object({
  sourceCode: z.string().min(1, "Source code is required"),
  instruction: z.string().optional(),
  language: z.string().optional(),
});

/** Commit & push schema */
export const commitPushSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  branch: z.string().optional(),
  message: z
    .string()
    .min(1, "Commit message is required")
    .max(500, "Commit message must be under 500 characters"),
});

/** Pull request schema */
export const createPRSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  body: z.string().optional(),
  head: z.string().min(1, "Head branch is required"),
  base: z.string().optional(),
});
