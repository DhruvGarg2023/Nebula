import * as fileRepo from './repositories.js';
import { getIO } from '../../core/sockets/index.js';
import { AppError } from '../../core/errors/AppError.js';

export async function createFile(roomId, data) {
  try {
    const file = await fileRepo.createFile({ ...data, roomId });
    
    // Broadcast file creation to room
    const io = getIO();
    io.of('/editor').to(roomId).emit('file:create', { roomId, file });
    
    return file;
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('File with this name already exists in the room', 409);
    }
    throw err;
  }
}

export async function getRoomFiles(roomId) {
  return fileRepo.getFilesByRoomId(roomId);
}

export async function getFile(roomId, fileId) {
  const file = await fileRepo.getFileById(fileId, roomId);
  if (!file) {
    throw new AppError('File not found', 404);
  }
  return file;
}

export async function updateFile(roomId, fileId, data) {
  // Check if file exists
  await getFile(roomId, fileId);

  try {
    const updatedFile = await fileRepo.updateFile(fileId, roomId, data);

    if (data.name) {
      // If renamed, broadcast the change
      const io = getIO();
      io.of('/editor').to(roomId).emit('file:rename', { roomId, fileId, newName: data.name });
    }

    return updatedFile;
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('File with this name already exists in the room', 409);
    }
    throw err;
  }
}

export async function deleteFile(roomId, fileId) {
  // Check if file exists
  await getFile(roomId, fileId);
  
  await fileRepo.deleteFile(fileId, roomId);

  // Broadcast file deletion to room
  const io = getIO();
  io.of('/editor').to(roomId).emit('file:delete', { roomId, fileId });
}
