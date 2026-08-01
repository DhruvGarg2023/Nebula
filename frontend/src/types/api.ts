// ═══════════════════════════════════════════════════════════════
// Generic API Response Types
// Matches the backend's response envelope pattern.
// ═══════════════════════════════════════════════════════════════

/**
 * Standard success response from the backend.
 * Most endpoints return `{ success: true, data: T }`.
 */
export interface ApiResponse<T> {
  success: boolean;
  status?: string;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

/**
 * Pagination metadata returned by list endpoints.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * Paginated response with data + meta.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Error response from the backend.
 */
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
  };
}

/**
 * Generic pagination query params.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Cursor-based pagination params (used by chat, compiler jobs).
 */
export interface CursorPaginationParams {
  limit?: number;
  cursor?: string;
}
