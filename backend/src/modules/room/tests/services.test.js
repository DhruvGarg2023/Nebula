import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as roomService from '../services.js';
import * as roomRepo from '../repositories.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../core/errors/AppError.js';
import crypto from 'crypto';

// Mock the repository layer
vi.mock('../repositories.js');

describe('Room Services', () => {
  const mockUser = {
    id: 'user-123',
  };

  const mockRoom = {
    id: 'room-123',
    name: 'Test Room',
    ownerId: mockUser.id,
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create room and add owner as admin', async () => {
      roomRepo.createRoom.mockResolvedValue(mockRoom);
      roomRepo.addRoomMember.mockResolvedValue({});

      const data = { name: 'Test Room' };
      const room = await roomService.createRoom(mockUser.id, data);

      expect(roomRepo.createRoom).toHaveBeenCalledWith({
        ...data,
        ownerId: mockUser.id,
      });
      expect(roomRepo.addRoomMember).toHaveBeenCalledWith(mockRoom.id, mockUser.id, 'admin');
      expect(room).toEqual(mockRoom);
    });
  });

  describe('updateMemberRole', () => {
    it('should throw AuthorizationError if trying to change owner role', async () => {
      roomRepo.findRoomById.mockResolvedValue(mockRoom);

      await expect(
        roomService.updateMemberRole(mockRoom.id, mockUser.id, 'viewer', 'some-other-user')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw AuthorizationError if trying to change own role', async () => {
      roomRepo.findRoomById.mockResolvedValue(mockRoom);

      await expect(
        roomService.updateMemberRole(mockRoom.id, 'other-user', 'viewer', 'other-user')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should update role if valid', async () => {
      roomRepo.findRoomById.mockResolvedValue(mockRoom);
      roomRepo.updateRoomMemberRole.mockResolvedValue({});

      await roomService.updateMemberRole(mockRoom.id, 'target-user', 'editor', mockUser.id);
      expect(roomRepo.updateRoomMemberRole).toHaveBeenCalledWith(mockRoom.id, 'target-user', 'editor');
    });
  });

  describe('Invitations', () => {
    it('should create an invitation with a secure token', async () => {
      roomRepo.createInvitation.mockResolvedValue({ id: 'inv-1', token: 'mock-token' });
      
      const inviteData = { role: 'editor', expiresInHours: 24 };
      const invitation = await roomService.createInvitation(mockRoom.id, mockUser.id, inviteData);

      expect(roomRepo.createInvitation).toHaveBeenCalled();
      const callArgs = roomRepo.createInvitation.mock.calls[0][0];
      expect(callArgs.roomId).toBe(mockRoom.id);
      expect(callArgs.invitedBy).toBe(mockUser.id);
      expect(callArgs.role).toBe('editor');
      expect(typeof callArgs.token).toBe('string');
      // Token should be generated (base64url)
      expect(callArgs.token.length).toBeGreaterThan(20);
    });

    it('should reject accepting an expired invitation', async () => {
      const expiredInvite = {
        id: 'inv-1',
        roomId: mockRoom.id,
        status: 'pending',
        expiresAt: new Date(Date.now() - 10000), // In the past
        room: mockRoom,
      };

      roomRepo.findInvitationByToken.mockResolvedValue(expiredInvite);
      roomRepo.updateInvitationStatus.mockResolvedValue();

      await expect(roomService.acceptInvitation('token123', 'new-user')).rejects.toThrow(ValidationError);
      expect(roomRepo.updateInvitationStatus).toHaveBeenCalledWith('inv-1', 'expired');
    });

    it('should reject accepting a revoked invitation', async () => {
      const revokedInvite = {
        id: 'inv-1',
        roomId: mockRoom.id,
        status: 'revoked', // Not pending
        expiresAt: new Date(Date.now() + 10000),
        room: mockRoom,
      };

      roomRepo.findInvitationByToken.mockResolvedValue(revokedInvite);

      await expect(roomService.acceptInvitation('token123', 'new-user')).rejects.toThrow(ValidationError);
    });

    it('should accept valid invitation and add member', async () => {
      const validInvite = {
        id: 'inv-1',
        roomId: mockRoom.id,
        status: 'pending',
        role: 'editor',
        expiresAt: new Date(Date.now() + 10000), // Future
        room: mockRoom,
      };

      roomRepo.findInvitationByToken.mockResolvedValue(validInvite);
      roomRepo.listRoomMembers.mockResolvedValue([]); // No members yet
      roomRepo.addRoomMember.mockResolvedValue();
      roomRepo.updateInvitationStatus.mockResolvedValue();

      const result = await roomService.acceptInvitation('valid-token', 'new-user');

      expect(roomRepo.addRoomMember).toHaveBeenCalledWith(mockRoom.id, 'new-user', 'editor');
      expect(roomRepo.updateInvitationStatus).toHaveBeenCalledWith('inv-1', 'accepted');
      expect(result).toEqual(mockRoom); // Returns the room
    });

    it('should prevent user from accepting invite if already a member', async () => {
      const validInvite = {
        id: 'inv-1',
        roomId: mockRoom.id,
        status: 'pending',
        role: 'editor',
        expiresAt: new Date(Date.now() + 10000),
        room: mockRoom,
      };

      roomRepo.findInvitationByToken.mockResolvedValue(validInvite);
      roomRepo.listRoomMembers.mockResolvedValue([{ userId: 'existing-user' }]);

      await expect(roomService.acceptInvitation('valid-token', 'existing-user')).rejects.toThrow(ValidationError);
      expect(roomRepo.addRoomMember).not.toHaveBeenCalled();
    });
  });
});
