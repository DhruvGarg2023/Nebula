import apiClient from "./client";
import type {
  ApiResponse,
  GitHubStatus,
  GitHubRepo,
  ConnectGitHubData,
  ImportRepoData,
  CommitPushData,
  CreatePRData,
  PullRequest,
} from "@/types";

/**
 * GitHub API service.
 * Maps 1:1 to backend /api/v1/github and /api/v1/rooms/:roomId/github endpoints.
 */
export const githubApi = {
  // ── User-level GitHub routes (/api/v1/github) ──────────────

  /** GET /github/auth — returns redirect URL (browser redirect) */
  getOAuthUrl: () =>
    `${apiClient.defaults.baseURL}/github/auth`,

  /** POST /github/connect */
  connect: (data: ConnectGitHubData) =>
    apiClient.post<ApiResponse<{ username: string }>>("/github/connect", data),

  /** DELETE /github/disconnect */
  disconnect: () =>
    apiClient.delete<ApiResponse<void>>("/github/disconnect"),

  /** GET /github/status */
  getStatus: () =>
    apiClient.get<ApiResponse<GitHubStatus>>("/github/status"),

  /** GET /github/repos */
  getRepos: () =>
    apiClient.get<ApiResponse<{ repos: GitHubRepo[] }>>("/github/repos"),

  // ── Room-scoped GitHub routes (/api/v1/rooms/:roomId/github) ─

  /** POST /rooms/:roomId/github/import */
  importRepo: (roomId: string, data: ImportRepoData) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      `/rooms/${roomId}/github/import`,
      data
    ),

  /** POST /rooms/:roomId/github/commit-push */
  commitAndPush: (roomId: string, data: CommitPushData) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      `/rooms/${roomId}/github/commit-push`,
      data
    ),

  /** POST /rooms/:roomId/github/pr */
  createPR: (roomId: string, data: CreatePRData) =>
    apiClient.post<ApiResponse<{ pullRequest: PullRequest }>>(
      `/rooms/${roomId}/github/pr`,
      data
    ),
};
