// ═══════════════════════════════════════════════════════════════
// Authentication Types
// ═══════════════════════════════════════════════════════════════

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface DevLoginCredentials {
  email: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
