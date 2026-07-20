import { getIO } from '../../core/sockets/index.js';
import { socketAuth } from '../../core/middleware/socketAuth.js';
import { SocketError } from '../../core/errors/SocketError.js';
import logger from '../../core/logger/index.js';
import * as collabService from './services.js';
import * as roomRepo from '../room/repositories.js';

export function registerCollaborationNamespace() {
  const io = getIO();
  const nsp = io.of('/collaboration');

  // Apply authentication middleware
  nsp.use(socketAuth);

  nsp.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.user.id }, 'User connected to collaboration namespace');

    // Keep track of which rooms this socket has joined
    const socketRooms = new Set();

    /**
     * Join a collaboration room.
     */
    socket.on('join_room', async (payload, callback) => {
      try {
        const { roomId } = payload;
        if (!roomId) {
          throw new SocketError('Room ID is required', 'MISSING_ROOM_ID');
        }

        // Verify the user has access to the room
        const room = await roomRepo.findRoomById(roomId);
        if (!room) {
          throw new SocketError('Room not found', 'NOT_FOUND');
        }

        // Check membership or public status
        if (!room.isPublic) {
          const members = await roomRepo.listRoomMembers(roomId);
          const isMember = members.some(m => m.userId === socket.user.id);
          if (!isMember) {
            throw new SocketError('Unauthorized to join this room', 'FORBIDDEN');
          }
        }

        // Join the socket.io room
        socket.join(roomId);
        socketRooms.add(roomId);

        // Track presence in Redis
        await collabService.trackPresence(roomId, socket.user, socket.id);

        // Broadcast to other members in the room
        socket.to(roomId).emit('user_joined', {
          userId: socket.user.id,
          name: socket.user.name,
          timestamp: Date.now()
        });

        // Send back current presence list to the joining user
        const currentPresence = await collabService.getRoomPresence(roomId);

        logger.debug({ roomId, userId: socket.user.id }, 'User joined room presence');

        if (typeof callback === 'function') {
          callback({ success: true, presence: currentPresence });
        }
      } catch (err) {
        logger.error({ err }, 'Error joining room');
        if (typeof callback === 'function') {
          callback(err instanceof SocketError ? err.toJSON() : new SocketError(err.message).toJSON());
        }
      }
    });

    /**
     * Leave a collaboration room explicitly.
     */
    socket.on('leave_room', async (payload, callback) => {
      try {
        const { roomId } = payload;
        if (!roomId) return;

        socket.leave(roomId);
        socketRooms.delete(roomId);

        await collabService.removePresence(roomId, socket.id);

        socket.to(roomId).emit('user_left', {
          userId: socket.user.id,
          timestamp: Date.now()
        });

        logger.debug({ roomId, userId: socket.user.id }, 'User left room presence');

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (err) {
        logger.error({ err }, 'Error leaving room');
      }
    });

    /**
     * Heartbeat to keep presence alive.
     */
    socket.on('heartbeat', async (payload) => {
      const { roomId } = payload;
      if (roomId && socketRooms.has(roomId)) {
        await collabService.heartbeatPresence(roomId);
      }
    });

    /**
     * Handle socket disconnect.
     * Socket.IO automatically leaves rooms, but we need to clean up Redis presence.
     */
    socket.on('disconnect', async () => {
      logger.info({ socketId: socket.id, userId: socket.user.id }, 'User disconnected from collaboration namespace');
      
      for (const roomId of socketRooms) {
        await collabService.removePresence(roomId, socket.id);
        socket.to(roomId).emit('user_left', {
          userId: socket.user.id,
          timestamp: Date.now()
        });
      }
      socketRooms.clear();
    });
  });

  return nsp;
}
