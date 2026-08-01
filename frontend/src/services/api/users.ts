import apiClient from "./client";
import type {
  ApiResponse,
  User,
  UpdateProfileData,
  UserSearchResult,
} from "@/types";

/**
 * Users API service.
 * Maps 1:1 to backend /api/v1/users endpoints.
 */
export const usersApi = {
  /** GET /users/me */
  getMe: () =>
    apiClient.get<ApiResponse<User>>("/users/me"),

  /** PATCH /users/me */
  updateMe: (data: UpdateProfileData) =>
    apiClient.patch<ApiResponse<User>>("/users/me", data),

  /** DELETE /users/me */
  deleteMe: () =>
    apiClient.delete<ApiResponse<{ message: string }>>("/users/me"),

  /** GET /users/search?q=&limit= */
  search: (query: string, limit = 10) =>
    apiClient.get<ApiResponse<UserSearchResult[]>>("/users/search", {
      params: { q: query, limit },
    }),
};
