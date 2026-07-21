import prisma from '../../core/database/prisma.js';

export async function createCompilerJob(data) {
  return prisma.compilerJob.create({
    data,
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

export async function updateJobStatus(id, data) {
  return prisma.compilerJob.update({
    where: { id },
    data,
  });
}

export async function getCompilerJobById(id, roomId) {
  return prisma.compilerJob.findFirst({
    where: { id, roomId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      file: { select: { id: true, name: true } },
    },
  });
}

export async function getRoomCompilerJobs(roomId, limit = 20, cursor = null) {
  const query = {
    where: { roomId },
    take: limit + 1,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      file: { select: { id: true, name: true } },
    },
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const jobs = await prisma.compilerJob.findMany(query);

  let nextCursor = null;
  if (jobs.length > limit) {
    const nextItem = jobs.pop();
    nextCursor = nextItem.id;
  }

  return {
    jobs,
    nextCursor,
  };
}
