import { getIO } from '../../core/sockets/index.js';
import { socketAuth } from '../../core/middleware/socketAuth.js';
import { SocketError } from '../../core/errors/SocketError.js';
import logger from '../../core/logger/index.js';
import * as roomRepo from '../room/repositories.js';

export function registerCompilerNamespace() {
  const io = getIO();
  const compilerNamespace = io.of('/compiler');

  compilerNamespace.use(socketAuth);

  compilerNamespace.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.user.id }, 'User connected to compiler namespace');

    socket.on('compiler:join', async (payload, callback) => {
      try {
        const { roomId } = payload || {};
        if (!roomId) {
          throw new SocketError('Room ID is required', 'MISSING_ROOM_ID');
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
        logger.error({ err }, 'Error joining compiler room');
        if (typeof callback === 'function') {
          callback(err instanceof SocketError ? err.toJSON() : new SocketError(err.message).toJSON());
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id, userId: socket.user.id }, 'User disconnected from compiler namespace');
    });
  });
}

/**
 * Emits stdout chunk to room members in real-time.
 */
export function streamStdout(roomId, jobId, chunk) {
  try {
    const io = getIO();
    io.of('/compiler').to(roomId).emit('compiler:stdout', { jobId, roomId, chunk });
  } catch (err) {
    logger.error({ err, jobId, roomId }, 'Failed to stream stdout');
  }
}

/**
 * Emits stderr chunk to room members in real-time.
 */
export function streamStderr(roomId, jobId, chunk) {
  try {
    const io = getIO();
    io.of('/compiler').to(roomId).emit('compiler:stderr', { jobId, roomId, chunk });
  } catch (err) {
    logger.error({ err, jobId, roomId }, 'Failed to stream stderr');
  }
}

/**
 * Emits job completion to room members.
 */
export function streamDone(roomId, jobResult) {
  try {
    const io = getIO();
    io.of('/compiler').to(roomId).emit('compiler:done', jobResult);
  } catch (err) {
    logger.error({ err, roomId }, 'Failed to stream compiler completion');
  }
}
