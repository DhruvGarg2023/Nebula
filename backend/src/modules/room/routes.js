import { Router } from 'express';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import * as roomController from './controllers.js';
import {
  CreateRoomSchema,
  UpdateRoomSchema,
  CreateInvitationSchema,
  JoinRoomSchema,
  UpdateMemberRoleSchema,
  ListRoomsSchema,
} from './dto.js';

const router = Router();
import fileRoutes from '../file/routes.js';

// ── File Routes ──────────────────────────────────────────────────
router.use('/:roomId/files', fileRoutes);

// ── Public / Unauthenticated Routes ──────────────────────────────
// Check invitation details (used for rendering the accept invite page)
router.get('/invites/:token', roomController.getInvitationDetails);

// ── Authenticated Routes (Require Login) ─────────────────────────
router.use(authenticate);

// Accept invitation
router.post('/invites/accept', validate(JoinRoomSchema), roomController.acceptInvitation);

// List user's rooms
router.get('/', validate(ListRoomsSchema, 'query'), roomController.listMyRooms);

// Create a new room
router.post('/', validate(CreateRoomSchema), roomController.createRoom);

// ── RBAC Protected Routes (Require specific roles in the room) ───

// Read room (viewer+)
router.get('/:roomId', authorize('viewer'), roomController.getRoom);

// Update room settings (admin only)
router.patch('/:roomId', validate(UpdateRoomSchema), authorize('admin'), roomController.updateRoom);

// Delete room (admin only)
router.delete('/:roomId', authorize('admin'), roomController.deleteRoom);

// List room members (viewer+)
router.get('/:roomId/members', authorize('viewer'), roomController.listMembers);

// Remove a member (admin only)
router.delete('/:roomId/members/:userId', authorize('admin'), roomController.removeMember);

// Change member role (admin only)
router.patch(
  '/:roomId/members/:userId/role',
  validate(UpdateMemberRoleSchema),
  authorize('admin'),
  roomController.updateMemberRole
);

// Leave room (viewer+ can leave, except owner)
router.post('/:roomId/leave', authorize('viewer'), roomController.leaveRoom);

// List pending invitations (editor+)
router.get('/:roomId/invites', authorize('editor'), roomController.listInvitations);

// Create an invitation (editor+)
router.post(
  '/:roomId/invites',
  validate(CreateInvitationSchema),
  authorize('editor'),
  roomController.createInvitation
);

// Revoke an invitation (admin only)
router.delete('/:roomId/invites/:invitationId', authorize('admin'), roomController.revokeInvitation);

export default router;
