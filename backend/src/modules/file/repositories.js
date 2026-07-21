import prisma from '../../core/database/prisma.js';

export async function createFile(data) {
  return prisma.file.create({ data });
}

export async function getFilesByRoomId(roomId) {
  return prisma.file.findMany({
    where: { roomId },
    orderBy: { name: 'asc' }
  });
}

export async function getFileById(id, roomId) {
  return prisma.file.findFirst({
    where: { id, roomId }
  });
}

export async function updateFile(id, roomId, data) {
  return prisma.file.update({
    where: { id, roomId },
    data
  });
}

export async function deleteFile(id, roomId) {
  return prisma.file.delete({
    where: { id, roomId }
  });
}
