import apiClient from "./client";
import type {
  ApiResponse,
  CompilerJob,
  ExecuteCodeData,
  CursorPaginationParams,
} from "@/types";

/**
 * Compiler API service.
 * Maps 1:1 to backend /api/v1/rooms/:roomId/compiler endpoints.
 */
export const compilerApi = {
  /** POST /rooms/:roomId/compiler/execute */
  execute: (roomId: string, data: ExecuteCodeData) =>
    apiClient.post<ApiResponse<CompilerJob>>(
      `/rooms/${roomId}/compiler/execute`,
      data
    ),

  /** GET /rooms/:roomId/compiler/jobs?limit=&cursor= */
  listJobs: (roomId: string, params?: CursorPaginationParams) =>
    apiClient.get<ApiResponse<CompilerJob[]>>(
      `/rooms/${roomId}/compiler/jobs`,
      { params }
    ),

  /** GET /rooms/:roomId/compiler/jobs/:jobId */
  getJob: (roomId: string, jobId: string) =>
    apiClient.get<ApiResponse<CompilerJob>>(
      `/rooms/${roomId}/compiler/jobs/${jobId}`
    ),
};
