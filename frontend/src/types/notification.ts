// ═══════════════════════════════════════════════════════════════
// Notification Types
// ═══════════════════════════════════════════════════════════════

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface RealtimeNotificationEvent {
  type: "notification:new";
  notification: Notification;
  unreadCount?: number;
}
