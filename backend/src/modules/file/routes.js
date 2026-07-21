import { Router } from 'express';
import * as fileController from './controllers.js';
import * as fileDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

// All file routes require authentication and room membership
router.use(authenticate);
router.use(authorize('viewer')); // Check that they have at least viewer role for all routes

// File CRUD operations
router.route('/')
  .get(asyncHandler(fileController.getAll))
  .post(
    authorize('editor'),
    validate(fileDto.createFileSchema),
    asyncHandler(fileController.create)
  );

router.route('/:fileId')
  .get(asyncHandler(fileController.getOne))
  .patch(
    authorize('editor'),
    validate(fileDto.updateFileSchema),
    asyncHandler(fileController.update)
  )
  .delete(
    authorize('editor'),
    asyncHandler(fileController.remove)
  );

export default router;
