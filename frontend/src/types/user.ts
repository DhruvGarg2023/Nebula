// ═══════════════════════════════════════════════════════════════
// User Types
// ═══════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string | null;
  preferences?: Record<string, unknown>;
}

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}
