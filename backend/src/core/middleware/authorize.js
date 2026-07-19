import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import prisma from '../database/prisma.js';

/**
 * Role hierarchy definition.
 * Higher index = higher privileges.
 */
const ROLE_HIERARCHY = ['viewer', 'editor', 'admin'];

/**
 * Authorize middleware for Role-Based Access Control (RBAC).
 * Assumes `authenticate` middleware has already run (so `req.user` exists)
 * and that the route contains a `roomId` parameter (e.g., /api/v1/rooms/:roomId/...)
 *
 * @param {'viewer' | 'editor' | 'admin'} requiredRole - The minimum role required
 * @returns {import('express').RequestHandler}
 */
const authorize = (requiredRole) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user?.id;
    const roomId = req.params.roomId;

    if (!userId) {
      throw new ForbiddenError('Authentication required to access this resource.');
    }

    if (!roomId) {
      // If there's no roomId in params, the developer misconfigured the route.
      // This is a 500 server error, but we'll throw a 403 to be safe.
      throw new ForbiddenError('Room ID is missing in the request parameters.');
    }

    // Lookup the user's membership in the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      // User is not a member of the room. We could throw 403, but throwing 404
      // prevents leaking the existence of private rooms.
      // However, we need to check if the room exists and is public.
      const room = await prisma.room.findUnique({
        where: { id: roomId, deletedAt: null },
      });

      if (!room) {
        throw new NotFoundError('Room');
      }

      if (room.isPublic) {
        // For public rooms, non-members have implicit 'viewer' access
        if (requiredRole === 'viewer') {
          return next();
        } else {
          throw new ForbiddenError(`You must join this room to be an ${requiredRole}.`);
        }
      }

      // Private room and not a member -> Act like it doesn't exist to prevent enum attack
      throw new NotFoundError('Room');
    }

    const userRoleLevel = ROLE_HIERARCHY.indexOf(membership.role);
    const requiredRoleLevel = ROLE_HIERARCHY.indexOf(requiredRole);

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenError(`Insufficient permissions. Requires ${requiredRole} role.`);
    }

    // Attach membership to request for downstream use (so we don't query it again)
    req.membership = membership;

    next();
  });
};

export default authorize;
