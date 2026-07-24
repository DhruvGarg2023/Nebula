import * as notificationRepo from './repositories.js';
import { emitRealtimeNotification } from './sockets.js';
import logger from '../../core/logger/index.js';

export async function sendNotification(userId, type, title, message, link = null, metadata = {}) {
  const notification = await notificationRepo.createNotification(
    userId,
    type,
    title,
    message,
    link,
    metadata
  );

  const unreadCount = await notificationRepo.getUnreadCount(userId);

  // Emit real-time WebSocket event for online users
  emitRealtimeNotification(userId, notification, unreadCount);

  logger.info({ userId, type, title }, 'Notification sent successfully');
  return notification;
}

export async function getNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
  const offset = (page - 1) * limit;
  const { notifications, total } = await notificationRepo.getUserNotifications(
    userId,
    limit,
    offset,
    unreadOnly
  );

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUnreadCount(userId) {
  const unreadCount = await notificationRepo.getUnreadCount(userId);
  return { unreadCount };
}

export async function markRead(notificationId, userId) {
  await notificationRepo.markAsRead(notificationId, userId);
  const unreadCount = await notificationRepo.getUnreadCount(userId);
  return { notificationId, isRead: true, unreadCount };
}

export async function markAllRead(userId) {
  await notificationRepo.markAllAsRead(userId);
  return { isRead: true, unreadCount: 0 };
}
