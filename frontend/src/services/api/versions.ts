import apiClient from "./client";
import type {
  ApiResponse,
  Version,
  VersionDiff,
  CreateVersionData,
  RestoreResult,
  PaginationParams,
} from "@/types";

/**
 * Versions API service.
 * Maps 1:1 to backend /api/v1/rooms/:roomId/versions endpoints.
 */
export const versionsApi = {
  /** POST /rooms/:roomId/versions */
  createSnapshot: (roomId: string, data: CreateVersionData) =>
    apiClient.post<ApiResponse<{ version: Version }>>(
      `/rooms/${roomId}/versions`,
      data
    ),

  /** GET /rooms/:roomId/versions?page=&limit= */
  list: (roomId: string, params?: PaginationParams) =>
    apiClient.get<ApiResponse<Version[]>>(`/rooms/${roomId}/versions`, {
      params,
    }),

  /** GET /rooms/:roomId/versions/:versionId */
  get: (roomId: string, versionId: string) =>
    apiClient.get<ApiResponse<{ version: Version }>>(
      `/rooms/${roomId}/versions/${versionId}`
    ),

  /** GET /rooms/:roomId/versions/:versionId/diff?targetVersionId= */
  getDiff: (roomId: string, versionId: string, targetVersionId?: string) =>
    apiClient.get<ApiResponse<{ diff: VersionDiff }>>(
      `/rooms/${roomId}/versions/${versionId}/diff`,
      { params: targetVersionId ? { targetVersionId } : undefined }
    ),

  /** POST /rooms/:roomId/versions/:versionId/restore */
  restore: (roomId: string, versionId: string) =>
    apiClient.post<ApiResponse<RestoreResult>>(
      `/rooms/${roomId}/versions/${versionId}/restore`
    ),
};
