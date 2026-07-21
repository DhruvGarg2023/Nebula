import { getIO } from '../../core/sockets/index.js';
import { socketAuth } from '../../core/middleware/socketAuth.js';
import { SocketError } from '../../core/errors/SocketError.js';
import logger from '../../core/logger/index.js';
import * as editorService from './services.js';
import * as roomRepo from '../room/repositories.js';

export function registerEditorNamespace() {
  const io = getIO();
  const editorNamespace = io.of('/editor');

  // Apply authentication middleware
  editorNamespace.use(socketAuth);

  editorNamespace.on('connection', (socket) => {
    // Keep track of which rooms/files this socket has joined
    const activeFiles = new Set();

    socket.on('editor:join', async (payload, callback) => {
      try {
        const { roomId, fileId } = payload;
        if (!roomId || !fileId) {
          throw new SocketError('Room ID and File ID are required', 'MISSING_PARAMS');
        }

        // Verify the user has access to the room
        const room = await roomRepo.findRoomById(roomId);
        if (!room) {
          throw new SocketError('Room not found', 'ROOM_NOT_FOUND');
        }

        const members = await roomRepo.listRoomMembers(roomId);
        const isMember = members.some(m => m.userId === socket.user.id);
        if (!isMember && !room.isPublic) {
          throw new SocketError('Not a member of this room', 'NOT_MEMBER');
        }

        // Join the socket.io room specific to this file to broadcast changes efficiently
        const fileRoomId = `${roomId}:${fileId}`;
        socket.join(fileRoomId);
        socket.join(roomId); // Also join the general room to receive file CRUD events
        activeFiles.add(fileRoomId);

        // Send the initial document state (CRDT) to the client
        const state = await editorService.getDocumentState(roomId, fileId);

        if (typeof callback === 'function') {
          callback({ success: true, state });
        }
      } catch (err) {
        logger.error({ err }, 'Error joining editor room');
        if (typeof callback === 'function') {
          callback(err instanceof SocketError ? err.toJSON() : new SocketError(err.message).toJSON());
        }
      }
    });

    socket.on('editor:change', async (payload, callback) => {
      try {
        const { roomId, fileId, update } = payload;
        
        // 1. Apply to backend Yjs instance
        await editorService.applyUpdate(roomId, fileId, update);

        // 2. Broadcast the update to all OTHER clients in this file room
        const fileRoomId = `${roomId}:${fileId}`;
        socket.to(fileRoomId).emit('editor:update', {
          fileId,
          userId: socket.user.id,
          update
        });

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } catch (err) {
        logger.error({ err }, 'Error processing editor change');
        if (typeof callback === 'function') {
          callback(new SocketError(err.message).toJSON());
        }
      }
    });

    socket.on('cursor:move', (payload) => {
      const { roomId, fileId, position } = payload;
      const fileRoomId = `${roomId}:${fileId}`;
      socket.to(fileRoomId).emit('cursor:update', {
        userId: socket.user.id,
        userName: socket.user.name,
        fileId,
        position
      });
    });

    socket.on('selection:change', (payload) => {
      const { roomId, fileId, range } = payload;
      const fileRoomId = `${roomId}:${fileId}`;
      socket.to(fileRoomId).emit('selection:update', {
        userId: socket.user.id,
        userName: socket.user.name,
        fileId,
        range
      });
    });

    socket.on('typing:start', (payload) => {
      const { roomId, fileId } = payload;
      socket.to(`${roomId}:${fileId}`).emit('typing:start', {
        userId: socket.user.id,
        userName: socket.user.name,
        fileId
      });
    });

    socket.on('typing:stop', (payload) => {
      const { roomId, fileId } = payload;
      socket.to(`${roomId}:${fileId}`).emit('typing:stop', {
        userId: socket.user.id,
        fileId
      });
    });

    socket.on('disconnect', () => {
      // Socket.io automatically handles leaving rooms, but we might want to
      // broadcast a 'user left file' event if needed in the future.
      activeFiles.clear();
    });
  });
}
