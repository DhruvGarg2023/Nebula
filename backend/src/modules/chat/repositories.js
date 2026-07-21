import prisma from '../../core/database/prisma.js';

/**
 * Creates a new chat message in the database.
 */
export async function createMessage(data) {
  return prisma.message.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

/**
 * Retrieves chat history for a room using cursor-based pagination.
 */
export async function getRoomMessages(roomId, limit = 50, cursor = null) {
  const take = limit + 1;
  const query = {
    where: { roomId },
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const messages = await prisma.message.findMany(query);

  let nextCursor = null;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    nextCursor = nextItem.id;
  }

  return {
    messages,
    nextCursor,
  };
}
