import CONSTANTS from '../../config/constants.js';
import asyncHandler from '../../core/utils/asyncHandler.js';
import * as roomService from './services.js';

/**
 * ── ROOMS ────────────────────────────────────────────────────────
 */

export const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const room = await roomService.createRoom(userId, req.body);

  res.status(CONSTANTS.HTTP.CREATED).json({
    success: true,
    data: room,
  });
});

export const getRoom = asyncHandler(async (req, res) => {
  // Use the membership attached by authorize middleware, or null if public viewer
  const { roomId } = req.params;
  const room = await roomService.getRoom(roomId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      ...room,
      membership: req.membership || null,
    },
  });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.updateRoom(roomId, req.body);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: room,
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  await roomService.deleteRoom(roomId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: { message: 'Room deleted successfully.' },
  });
});

export const listMyRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page, limit } = req.query;
  
  const result = await roomService.listUserRooms(userId, page, limit);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  });
});

/**
 * ── ROOM MEMBERS ─────────────────────────────────────────────────
 */

export const listMembers = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const members = await roomService.listMembers(roomId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: members,
  });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { roomId, userId } = req.params;
  const { role } = req.body;
  const requesterId = req.user.id;
  
  const member = await roomService.updateMemberRole(roomId, userId, role, requesterId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: member,
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { roomId, userId } = req.params;
  await roomService.removeMember(roomId, userId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: { message: 'Member removed successfully.' },
  });
});

export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  
  await roomService.leaveRoom(roomId, userId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: { message: 'Left room successfully.' },
  });
});

/**
 * ── INVITATIONS ──────────────────────────────────────────────────
 */

export const createInvitation = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const inviterId = req.user.id;
  
  const invitation = await roomService.createInvitation(roomId, inviterId, req.body);
  
  res.status(CONSTANTS.HTTP.CREATED).json({
    success: true,
    data: invitation,
  });
});

export const listInvitations = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const invitations = await roomService.listInvitations(roomId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: invitations,
  });
});

export const revokeInvitation = asyncHandler(async (req, res) => {
  // We don't use roomId here in the DB query directly, but it's part of the route for RBAC
  const { invitationId } = req.params;
  await roomService.revokeInvitation(invitationId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: { message: 'Invitation revoked successfully.' },
  });
});

export const getInvitationDetails = asyncHandler(async (req, res) => {
  // This route doesn't require RBAC or auth, it just checks a token
  const { token } = req.params;
  const invitation = await roomService.getInvitationDetails(token);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      room: {
        id: invitation.room.id,
        name: invitation.room.name,
      },
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    },
  });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  // Requires basic auth, but not RBAC (since they aren't a member yet)
  const { token } = req.body;
  const userId = req.user.id;
  
  const room = await roomService.acceptInvitation(token, userId);
  
  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      message: 'Joined room successfully.',
      room,
    },
  });
});
