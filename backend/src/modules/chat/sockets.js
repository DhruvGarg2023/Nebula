import { getIO } from '../../core/sockets/index.js';
import { socketAuth } from '../../core/middleware/socketAuth.js';
import { SocketError } from '../../core/errors/SocketError.js';
import logger from '../../core/logger/index.js';
import * as chatService from './services.js';
import * as roomRepo from '../room/repositories.js';

export function registerChatNamespace() {
  const io = getIO();
  const chatNamespace = io.of('/chat');

  chatNamespace.use(socketAuth);

  chatNamespace.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.user.id }, 'User connected to chat namespace');

    socket.on('chat:join', async (payload, callback) => {
      try {
        const { roomId } = payload || {};
        if (!roomId) {
          throw new SocketError('Room ID is required', 'MISSING_PARAMS');
        }

        const room = await roomRepo.findRoomById(roomId);
        if (!room) {
          throw new SocketError('Room not found', 'ROOM_NOT_FOUND');
        }

        const members = await roomRepo.listRoomMembers(roomId);
        const isMember = members.some((m) => m.userId === socket.user.id);
        if (!isMember && !room.isPublic) {
          throw new SocketError('Not a member of this room', 'NOT_MEMBER');
        }

        socket.join(roomId);

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (err) {
        logger.error({ err }, 'Error joining chat room');
        if (typeof callback === 'function') {
          callback(err instanceof SocketError ? err.toJSON() : new SocketError(err.message).toJSON());
        }
      }
    });

    socket.on('chat:send', async (payload, callback) => {
      try {
        const { roomId, content } = payload || {};
        if (!roomId || !content) {
          throw new SocketError('Room ID and message content are required', 'MISSING_PARAMS');
        }

        const message = await chatService.createMessage({
          roomId,
          userId: socket.user.id,
          content,
          type: 'USER',
        });

        // Broadcast to all clients in the room (including sender)
        chatNamespace.to(roomId).emit('chat:receive', message);

        if (typeof callback === 'function') {
          callback({ success: true, message });
        }
      } catch (err) {
        logger.error({ err }, 'Error sending chat message');
        if (typeof callback === 'function') {
          callback(err instanceof SocketError ? err.toJSON() : new SocketError(err.message).toJSON());
        }
      }
    });

    socket.on('chat:typing:start', (payload) => {
      const { roomId } = payload || {};
      if (roomId) {
        socket.to(roomId).emit('chat:typing:start', {
          userId: socket.user.id,
          userName: socket.user.name,
          roomId,
        });
      }
    });

    socket.on('chat:typing:stop', (payload) => {
      const { roomId } = payload || {};
      if (roomId) {
        socket.to(roomId).emit('chat:typing:stop', {
          userId: socket.user.id,
          roomId,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id, userId: socket.user.id }, 'User disconnected from chat namespace');
    });
  });
}

/**
 * Sends a system message into a room's chat channel.
 */
export async function sendSystemMessage(roomId, text) {
  try {
    const message = await chatService.createMessage({
      roomId,
      userId: null,
      content: text,
      type: 'SYSTEM',
    });

    const io = getIO();
    io.of('/chat').to(roomId).emit('chat:receive', message);
    return message;
  } catch (err) {
    logger.error({ err, roomId }, 'Failed to send system chat message');
  }
}
