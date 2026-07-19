import CONSTANTS from '../../config/constants.js';
import asyncHandler from '../../core/utils/asyncHandler.js';
import * as userService from './services.js';
import { formatUserResponse } from '../auth/services.js';

/**
 * User module controllers.
 */

/**
 * GET /users/me
 * Get current user profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getProfile(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: formatUserResponse(user),
  });
});

/**
 * PATCH /users/me
 * Update current user profile.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedUser = await userService.updateProfile(userId, req.body);

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: formatUserResponse(updatedUser),
  });
});

/**
 * GET /users/search
 * Search for users by name or email.
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  const users = await userService.searchUsers(q, limit);

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: users, // Already stripped of sensitive fields in service
  });
});

/**
 * DELETE /users/me
 * Soft delete current user account.
 */
export const deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await userService.deleteAccount(userId);

  // Clear refresh token cookie just in case, though tokens are revoked in DB
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  res.status(CONSTANTS.HTTP.OK).json({
    success: true,
    data: {
      message: 'Account successfully deactivated.',
    },
  });
});
