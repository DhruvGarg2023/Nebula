import prisma from '../../core/database/prisma.js';

/**
 * ── ROOMS ────────────────────────────────────────────────────────
 */

export async function createRoom(data) {
  return prisma.room.create({
    data,
  });
}

export async function findRoomById(id) {
  return prisma.room.findFirst({
    where: { id, deletedAt: null },
    include: { owner: true },
  });
}

export async function updateRoom(id, data) {
  return prisma.room.update({
    where: { id },
    data,
  });
}

export async function deleteRoom(id) {
  return prisma.room.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * List rooms where the user is a member (including owned rooms).
 */
export async function listUserRooms(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.room.findMany({
      where: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.room.count({
      where: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
    }),
  ]);
  return { data, total, page, limit };
}

/**
 * ── ROOM MEMBERS ─────────────────────────────────────────────────
 */

export async function addRoomMember(roomId, userId, role = 'editor') {
  return prisma.roomMember.create({
    data: { roomId, userId, role },
  });
}

export async function listRoomMembers(roomId) {
  return prisma.roomMember.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });
}

export async function updateRoomMemberRole(roomId, userId, role) {
  return prisma.roomMember.update({
    where: {
      roomId_userId: { roomId, userId },
    },
    data: { role },
  });
}

export async function removeRoomMember(roomId, userId) {
  return prisma.roomMember.delete({
    where: {
      roomId_userId: { roomId, userId },
    },
  });
}

/**
 * ── INVITATIONS ──────────────────────────────────────────────────
 */

export async function createInvitation(data) {
  return prisma.invitation.create({
    data,
  });
}

export async function findInvitationByToken(token) {
  return prisma.invitation.findUnique({
    where: { token },
    include: { room: true },
  });
}

export async function updateInvitationStatus(id, status) {
  return prisma.invitation.update({
    where: { id },
    data: { status },
  });
}

export async function listRoomInvitations(roomId) {
  return prisma.invitation.findMany({
    where: { roomId, status: 'pending' },
    include: {
      inviter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvitation(id) {
  return prisma.invitation.update({
    where: { id },
    data: { status: 'revoked' },
  });
}
