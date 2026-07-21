import { Router } from 'express';
import * as compilerController from './controllers.js';
import * as compilerDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/execute',
  authorize('editor'),
  validate(compilerDto.executeCodeSchema),
  asyncHandler(compilerController.execute)
);

router.get(
  '/jobs',
  authorize('viewer'),
  validate(compilerDto.listJobsSchema, 'query'),
  asyncHandler(compilerController.getHistory)
);

router.get(
  '/jobs/:jobId',
  authorize('viewer'),
  asyncHandler(compilerController.getJob)
);

export default router;
