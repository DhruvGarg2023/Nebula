import crypto from 'crypto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../core/errors/AppError.js';
import logger from '../../core/logger/index.js';
import * as roomRepo from './repositories.js';

/**
 * ── ROOMS ────────────────────────────────────────────────────────
 */

export async function createRoom(userId, data) {
  // 1. Create the room with the user as the owner
  const room = await roomRepo.createRoom({
    ...data,
    ownerId: userId,
  });

  // 2. Automatically add the owner as an 'admin' member
  await roomRepo.addRoomMember(room.id, userId, 'admin');

  logger.info({ roomId: room.id, ownerId: userId }, 'Room created');
  return room;
}

export async function getRoom(roomId) {
  const room = await roomRepo.findRoomById(roomId);
  if (!room) {
    throw new NotFoundError('Room');
  }
  return room;
}

export async function updateRoom(roomId, data) {
  await getRoom(roomId); // Ensure it exists
  const updated = await roomRepo.updateRoom(roomId, data);
  logger.info({ roomId }, 'Room updated');
  return updated;
}

export async function deleteRoom(roomId) {
  await getRoom(roomId);
  await roomRepo.deleteRoom(roomId);
  logger.info({ roomId }, 'Room deleted');
}

export async function listUserRooms(userId, page, limit) {
  return roomRepo.listUserRooms(userId, page, limit);
}

/**
 * ── ROOM MEMBERS ─────────────────────────────────────────────────
 */

export async function listMembers(roomId) {
  await getRoom(roomId);
  return roomRepo.listRoomMembers(roomId);
}

export async function updateMemberRole(roomId, targetUserId, newRole, requesterUserId) {
  // Prevent changing owner's role
  const room = await getRoom(roomId);
  if (room.ownerId === targetUserId) {
    throw new ForbiddenError('Cannot change the role of the room owner.');
  }

  // Prevent users from changing their own role (optional, but good practice)
  if (targetUserId === requesterUserId) {
    throw new ForbiddenError('Cannot change your own role.');
  }

  const updated = await roomRepo.updateRoomMemberRole(roomId, targetUserId, newRole);
  logger.info({ roomId, targetUserId, newRole }, 'Room member role updated');
  return updated;
}

export async function removeMember(roomId, targetUserId) {
  const room = await getRoom(roomId);
  if (room.ownerId === targetUserId) {
    throw new ForbiddenError('Cannot remove the room owner.');
  }

  await roomRepo.removeRoomMember(roomId, targetUserId);
  logger.info({ roomId, targetUserId }, 'Room member removed');
}

export async function leaveRoom(roomId, userId) {
  const room = await getRoom(roomId);
  if (room.ownerId === userId) {
    throw new ForbiddenError('Room owner cannot leave the room. Delete the room or transfer ownership.');
  }

  await roomRepo.removeRoomMember(roomId, userId);
  logger.info({ roomId, userId }, 'User left room');
}

/**
 * ── INVITATIONS ──────────────────────────────────────────────────
 */

export async function createInvitation(roomId, inviterId, { role, expiresInHours }) {
  // Generate a URL-safe secure random token
  const token = crypto.randomBytes(32).toString('base64url');
  
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const invitation = await roomRepo.createInvitation({
    roomId,
    invitedBy: inviterId,
    token,
    role,
    expiresAt,
  });

  logger.info({ roomId, inviterId, invitationId: invitation.id }, 'Invitation created');
  return invitation;
}

export async function getInvitationDetails(token) {
  const invitation = await roomRepo.findInvitationByToken(token);
  
  if (!invitation) {
    throw new NotFoundError('Invitation');
  }

  if (invitation.status !== 'pending') {
    throw new ValidationError(`Invitation is already ${invitation.status}.`);
  }

  if (invitation.expiresAt < new Date()) {
    await roomRepo.updateInvitationStatus(invitation.id, 'expired');
    throw new ValidationError('Invitation has expired.');
  }

  if (invitation.room.deletedAt) {
    throw new ValidationError('The room for this invitation no longer exists.');
  }

  return invitation;
}

export async function acceptInvitation(token, userId) {
  const invitation = await getInvitationDetails(token);

  // Check if user is already a member
  const existingMembers = await roomRepo.listRoomMembers(invitation.roomId);
  const isMember = existingMembers.some(m => m.userId === userId);

  if (isMember) {
    throw new ValidationError('You are already a member of this room.');
  }

  // Add the user to the room
  await roomRepo.addRoomMember(invitation.roomId, userId, invitation.role);
  
  // Mark invitation as accepted
  await roomRepo.updateInvitationStatus(invitation.id, 'accepted');

  logger.info({ roomId: invitation.roomId, userId, invitationId: invitation.id }, 'Invitation accepted');
  return invitation.room;
}

export async function listInvitations(roomId) {
  return roomRepo.listRoomInvitations(roomId);
}

export async function revokeInvitation(invitationId) {
  await roomRepo.revokeInvitation(invitationId);
  logger.info({ invitationId }, 'Invitation revoked');
}
