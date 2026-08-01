"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setAccessToken, getAccessToken } from "@/services/api/client";
import { usersApi } from "@/services/api/users";
import { authApi } from "@/services/api/auth";
import { ROUTES } from "@/lib/constants";
import type { AuthUser } from "@/types/auth";

// ═══════════════════════════════════════════════════════════════
// Auth Context
// ═══════════════════════════════════════════════════════════════

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider.
 *
 * Manages:
 * - Access token in memory (via client.ts setAccessToken)
 * - User profile state
 * - Login/logout flows
 * - Initial session restoration via /auth/refresh
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = user !== null;

  /**
   * Fetch the current user profile from /users/me.
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await usersApi.getMe();
      setUser(response.data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  /**
   * Login: store access token and fetch user profile.
   */
  const login = useCallback(
    async (token: string) => {
      setAccessToken(token);
      await fetchUser();
    },
    [fetchUser]
  );

  /**
   * Logout: call backend, clear token, redirect to login.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout endpoint may fail if token is already expired — that's OK
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  /**
   * Refresh user data from the server.
   */
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  /**
   * On mount: attempt to restore session by calling /auth/refresh.
   * If the refresh token cookie exists and is valid, we'll get a new access token.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authApi.refresh();
        const { accessToken, user: userData } = response.data.data;
        setAccessToken(accessToken);
        setUser(userData);
      } catch {
        // No valid session — user needs to login
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only restore if we don't already have a token
    if (!getAccessToken()) {
      restoreSession();
    } else {
      // We have a token in memory — fetch user data
      fetchUser().finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isAuthenticated, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context. Must be used within AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
