import prisma from '../../core/database/prisma.js';

/**
 * Repository operations for Room Version Snapshots & Files.
 */

export async function createSnapshot(roomId, createdBy, label, description, files) {
  return prisma.$transaction(async (tx) => {
    const version = await tx.version.create({
      data: {
        roomId,
        createdBy,
        label: label || `Snapshot ${new Date().toISOString()}`,
        description: description || null,
        versionFiles: {
          create: files.map((file) => ({
            fileName: file.name,
            filePath: file.path || '/',
            content: file.content || '',
            language: file.language || null,
          })),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        versionFiles: true,
      },
    });

    return version;
  });
}

export async function getVersionsByRoom(roomId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [total, versions] = await Promise.all([
    prisma.version.count({ where: { roomId } }),
    prisma.version.findMany({
      where: { roomId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { versionFiles: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    versions,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function getVersionById(versionId, roomId) {
  return prisma.version.findFirst({
    where: {
      id: versionId,
      roomId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      versionFiles: true,
    },
  });
}

export async function getRoomFiles(roomId) {
  return prisma.file.findMany({
    where: { roomId },
    orderBy: { name: 'asc' },
  });
}

export async function restoreRoomFiles(roomId, versionFiles) {
  return prisma.$transaction(async (tx) => {
    // 1. Delete all current active files in room
    await tx.file.deleteMany({ where: { roomId } });

    // 2. Create files from version snapshot
    if (versionFiles.length > 0) {
      await tx.file.createMany({
        data: versionFiles.map((vf) => ({
          roomId,
          name: vf.fileName,
          language: vf.language || 'plaintext',
          content: vf.content,
        })),
      });
    }

    // 3. Retrieve and return new active files
    return tx.file.findMany({
      where: { roomId },
      orderBy: { name: 'asc' },
    });
  });
}
