import apiClient from "./client";
import type {
  ApiResponse,
  AiReview,
  RequestReviewData,
  ExplainCodeData,
  SuggestImprovementsData,
  AiExplainResponse,
  AiSuggestResponse,
} from "@/types";

/**
 * AI API service.
 * Maps 1:1 to backend /api/v1/ai and /api/v1/rooms/:roomId/ai endpoints.
 */
export const aiApi = {
  // ── Global AI routes (/api/v1/ai) ──────────────────────────

  /** POST /ai/explain */
  explainCode: (data: ExplainCodeData) =>
    apiClient.post<ApiResponse<AiExplainResponse>>("/ai/explain", data),

  /** POST /ai/suggest */
  suggestImprovements: (data: SuggestImprovementsData) =>
    apiClient.post<ApiResponse<AiSuggestResponse>>("/ai/suggest", data),

  /** GET /ai/reviews/:reviewId */
  getReview: (reviewId: string) =>
    apiClient.get<ApiResponse<{ review: AiReview }>>(
      `/ai/reviews/${reviewId}`
    ),

  // ── Room-scoped AI routes (/api/v1/rooms/:roomId/ai) ───────

  /** POST /rooms/:roomId/ai/review */
  requestReview: (roomId: string, data: RequestReviewData) =>
    apiClient.post<ApiResponse<AiReview>>(
      `/rooms/${roomId}/ai/review`,
      data
    ),
};
