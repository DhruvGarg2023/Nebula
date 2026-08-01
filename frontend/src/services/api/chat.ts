import apiClient from "./client";
import type { ApiResponse, Message, CursorPaginationParams } from "@/types";

/**
 * Chat API service.
 * Maps 1:1 to backend /api/v1/rooms/:roomId/messages endpoints.
 */
export const chatApi = {
  /** GET /rooms/:roomId/messages?limit=&cursor= */
  getHistory: (roomId: string, params?: CursorPaginationParams) =>
    apiClient.get<ApiResponse<Message[]>>(`/rooms/${roomId}/messages`, {
      params,
    }),
};
