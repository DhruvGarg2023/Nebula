import apiClient from "./client";
import type {
  ApiResponse,
  Notification,
  NotificationListFilters,
  UnreadCountResponse,
} from "@/types";

/**
 * Notifications API service.
 * Maps 1:1 to backend /api/v1/notifications endpoints.
 */
export const notificationsApi = {
  /** GET /notifications?page=&limit=&unreadOnly= */
  list: (params?: NotificationListFilters) =>
    apiClient.get<ApiResponse<Notification[]>>("/notifications", { params }),

  /** GET /notifications/unread-count */
  getUnreadCount: () =>
    apiClient.get<ApiResponse<UnreadCountResponse>>(
      "/notifications/unread-count"
    ),

  /** PATCH /notifications/read-all */
  markAllRead: () =>
    apiClient.patch<ApiResponse<{ count: number }>>("/notifications/read-all"),

  /** PATCH /notifications/:notificationId/read */
  markRead: (notificationId: string) =>
    apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    ),
};
