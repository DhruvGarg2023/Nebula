import { Router } from 'express';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import * as userController from './controllers.js';
import { UpdateProfileSchema, UserSearchSchema } from './dto.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ── Profile Management ─────────────────────────────────────────

// Get current user profile
router.get('/me', userController.getMe);

// Update current user profile
router.patch('/me', validate(UpdateProfileSchema), userController.updateMe);

// Delete current user account (soft delete)
router.delete('/me', userController.deleteMe);

// ── Search ─────────────────────────────────────────────────────

// Search users (e.g., for invitations)
router.get('/search', validate(UserSearchSchema, 'query'), userController.searchUsers);

export default router;
