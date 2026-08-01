import apiClient from "./client";
import type { ApiResponse, CodeFile, CreateFileData, UpdateFileData } from "@/types";

/**
 * Files API service.
 * Maps 1:1 to backend /api/v1/rooms/:roomId/files endpoints.
 */
export const filesApi = {
  /** GET /rooms/:roomId/files */
  list: (roomId: string) =>
    apiClient.get<ApiResponse<CodeFile[]>>(`/rooms/${roomId}/files`),

  /** POST /rooms/:roomId/files */
  create: (roomId: string, data: CreateFileData) =>
    apiClient.post<ApiResponse<CodeFile>>(`/rooms/${roomId}/files`, data),

  /** GET /rooms/:roomId/files/:fileId */
  get: (roomId: string, fileId: string) =>
    apiClient.get<ApiResponse<CodeFile>>(`/rooms/${roomId}/files/${fileId}`),

  /** PATCH /rooms/:roomId/files/:fileId */
  update: (roomId: string, fileId: string, data: UpdateFileData) =>
    apiClient.patch<ApiResponse<CodeFile>>(
      `/rooms/${roomId}/files/${fileId}`,
      data
    ),

  /** DELETE /rooms/:roomId/files/:fileId */
  delete: (roomId: string, fileId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/rooms/${roomId}/files/${fileId}`
    ),
};
