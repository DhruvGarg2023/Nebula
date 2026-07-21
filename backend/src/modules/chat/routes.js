import { Router } from 'express';
import * as chatController from './controllers.js';
import * as chatDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(authorize('viewer'));

router.get(
  '/',
  validate(chatDto.listMessagesSchema, 'query'),
  asyncHandler(chatController.getHistory)
);

export default router;
