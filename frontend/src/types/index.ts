export type AuthProvider = 'google' | 'github' | 'local';
export type Role = 'viewer' | 'editor' | 'admin';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type MessageType = 'USER' | 'SYSTEM';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timeout';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  preferences?: Record<string, any>;
  authProvider: AuthProvider;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Room {
  id: string;
  name: string;
  description?: string | null;
  language: string;
  ownerId: string;
  isPublic: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: RoomMember[];
  _count?: {
    members?: number;
    files?: number;
  };
}

export interface CodeFile {
  id: string;
  roomId: string;
  name: string;
  language: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId?: string | null;
  content: string;
  type: MessageType;
  createdAt: string;
  user?: User | null;
}

export interface CompilerJob {
  id: string;
  roomId: string;
  userId: string;
  fileId?: string | null;
  language: string;
  sourceCode: string;
  stdout?: string | null;
  stderr?: string | null;
  exitCode?: number | null;
  status: JobStatus;
  executionTimeMs?: number | null;
  createdAt: string;
  completedAt?: string | null;
  user?: User;
  file?: CodeFile | null;
}

export interface VersionFile {
  id: string;
  versionId: string;
  fileName: string;
  filePath: string;
  content: string;
  language?: string | null;
}

export interface RoomVersion {
  id: string;
  roomId: string;
  createdBy: string;
  label?: string | null;
  description?: string | null;
  createdAt: string;
  creator?: User;
  versionFiles?: VersionFile[];
}

export interface AiReviewIssue {
  id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface AiReviewSuggestion {
  id?: string;
  title: string;
  description: string;
  codeSnippet?: string;
}

export interface AiReview {
  id: string;
  roomId: string;
  userId: string;
  fileId?: string | null;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  summary?: string | null;
  issues: AiReviewIssue[];
  suggestions: AiReviewSuggestion[];
  costUsd: number;
  createdAt: string;
  completedAt?: string | null;
  user?: User;
  file?: CodeFile | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string;
  default_branch: string;
  updated_at: string;
}

export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  color: string;
  cursor?: {
    fileId: string;
    line: number;
    column: number;
  } | null;
}
