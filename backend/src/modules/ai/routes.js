import { Router } from 'express';
import * as aiController from './controllers.js';
import * as aiDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

// ── Global User AI Routes (/api/v1/ai) ──────────────────────────────────
export const globalAiRouter = Router();

globalAiRouter.use(authenticate);

globalAiRouter.post(
  '/explain',
  validate(aiDto.explainRequestSchema),
  asyncHandler(aiController.explainCode)
);

globalAiRouter.post(
  '/suggest',
  validate(aiDto.suggestRequestSchema),
  asyncHandler(aiController.suggestImprovements)
);

globalAiRouter.get(
  '/reviews/:reviewId',
  asyncHandler(aiController.getReviewById)
);


// ── Room-Scoped AI Routes (/api/v1/rooms/:roomId/ai) ───────────────────
export const roomAiRouter = Router({ mergeParams: true });

roomAiRouter.use(authenticate);

roomAiRouter.post(
  '/review',
  authorize('editor'),
  validate(aiDto.reviewRequestSchema),
  asyncHandler(aiController.requestReview)
);
