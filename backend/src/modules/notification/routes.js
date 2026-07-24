import { Router } from 'express';
import * as notificationController from './controllers.js';
import * as notificationDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(notificationDto.listNotificationsQuerySchema, 'query'),
  asyncHandler(notificationController.getNotifications)
);

router.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount)
);

router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllRead)
);

router.patch(
  '/:notificationId/read',
  validate(notificationDto.markReadParamsSchema, 'params'),
  asyncHandler(notificationController.markRead)
);

export default router;
