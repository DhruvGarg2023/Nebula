import prisma from '../../core/database/prisma.js';

export async function createNotification(userId, type, title, message, link = null, metadata = {}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata,
    },
  });
}

export async function getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
  const where = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
