import apiClient from "./client";
import type { ApiResponse, AuthResponse, DevLoginCredentials } from "@/types";

/**
 * Authentication API service.
 * Maps 1:1 to backend /api/v1/auth endpoints.
 */
export const authApi = {
  /**
   * GET /auth/google — Initiates Google OAuth flow.
   * This is a browser redirect, not an API call.
   */
  getGoogleAuthUrl: () =>
    `${apiClient.defaults.baseURL}/auth/google`,

  /**
   * POST /auth/refresh — Exchange refresh token (cookie) for new token pair.
   * Note: This is also handled by the Axios interceptor automatically.
   */
  refresh: () =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/refresh"),

  /**
   * POST /auth/logout — Revoke refresh token and clear cookie.
   */
  logout: () =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/logout"),

  /**
   * POST /auth/dev/login — Dev-mode login (non-production only).
   */
  devLogin: (data: DevLoginCredentials) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/dev/login", data),
};
