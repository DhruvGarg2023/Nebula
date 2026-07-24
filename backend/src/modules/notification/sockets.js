import { getIO } from '../../core/sockets/index.js';
import logger from '../../core/logger/index.js';

/**
 * Emit a real-time notification to a specific user over Socket.IO WebSockets.
 *
 * @param {string} userId - Target user ID
 * @param {object} notification - Created Notification record
 * @param {number} [unreadCount] - Updated unread badge count
 */
export function emitRealtimeNotification(userId, notification, unreadCount = undefined) {
  try {
    const io = getIO();
    // Emit to default namespace or user room
    io.emit(`user:${userId}:notification`, {
      type: 'notification:new',
      notification,
      unreadCount,
    });
    logger.debug({ userId, notificationId: notification.id }, 'Emitted real-time WebSocket notification');
  } catch (err) {
    logger.warn({ userId, err: err.message }, 'Unable to emit real-time WebSocket notification (socket server not started or user offline)');
  }
}
