import { Router } from 'express';
import * as versionController from './controllers.js';
import * as versionDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

// All version routes require authentication
router.use(authenticate);

// Create manual version snapshot (Editors, Admins)
router.post(
  '/',
  authorize('editor'),
  validate(versionDto.createVersionSchema),
  asyncHandler(versionController.createSnapshot)
);

// List version history (Viewers, Editors, Admins)
router.get(
  '/',
  authorize('viewer'),
  validate(versionDto.listVersionsSchema, 'query'),
  asyncHandler(versionController.listVersions)
);

// Get version snapshot details (Viewers, Editors, Admins)
router.get(
  '/:versionId',
  authorize('viewer'),
  asyncHandler(versionController.getVersionDetails)
);

// Compute version diff (Viewers, Editors, Admins)
router.get(
  '/:versionId/diff',
  authorize('viewer'),
  validate(versionDto.diffVersionSchema, 'query'),
  asyncHandler(versionController.computeVersionDiff)
);

// Restore room to version snapshot (Admins only)
router.post(
  '/:versionId/restore',
  authorize('admin'),
  asyncHandler(versionController.restoreVersion)
);

export default router;
