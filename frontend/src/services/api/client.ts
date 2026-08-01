import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
// Axios API Client
// Singleton instance with interceptors for auth token injection
// and automatic token refresh on 401 TOKEN_EXPIRED errors.
// ═══════════════════════════════════════════════════════════════

/**
 * In-memory access token store.
 * Never persisted to localStorage (security best practice).
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Flag to prevent multiple concurrent refresh attempts.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

/**
 * Configured Axios instance.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — attach access token.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — auto-refresh on 401 TOKEN_EXPIRED.
 *
 * When a request fails with TOKEN_EXPIRED:
 * 1. Call POST /auth/refresh (uses refresh token from cookie)
 * 2. Store new access token in memory
 * 3. Retry the failed request with the new token
 * 4. If refresh fails → clear auth state, redirect to login
 *
 * Multiple concurrent 401s are queued and resolved together.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code?: string } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 TOKEN_EXPIRED errors
    const errorCode = error.response?.data?.error?.code;
    if (
      error.response?.status !== 401 ||
      errorCode !== "TOKEN_EXPIRED" ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = response.data.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);

      // Redirect to login — only in browser context
      if (typeof window !== "undefined") {
        window.location.href = "/login?error=session_expired";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
