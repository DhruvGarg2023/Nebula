import * as notificationService from './services.js';
import CONSTANTS from '../../config/constants.js';

export async function getNotifications(req, res) {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';

  const result = await notificationService.getNotifications(userId, page, limit, unreadOnly);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: result,
  });
}

export async function getUnreadCount(req, res) {
  const userId = req.user.id;
  const result = await notificationService.getUnreadCount(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: result,
  });
}

export async function markRead(req, res) {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const result = await notificationService.markRead(notificationId, userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    message: 'Notification marked as read.',
    data: result,
  });
}

export async function markAllRead(req, res) {
  const userId = req.user.id;
  const result = await notificationService.markAllRead(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    message: 'All notifications marked as read.',
    data: result,
  });
}
