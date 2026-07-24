import * as aiService from './services.js';
import CONSTANTS from '../../config/constants.js';

export async function requestReview(req, res) {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { fileId, sourceCode, language } = req.body;

  const result = await aiService.requestReview(roomId, userId, fileId, sourceCode, language);

  res.status(CONSTANTS.HTTP.ACCEPTED).json({
    status: 'success',
    data: result,
  });
}

export async function explainCode(req, res) {
  const userId = req.user.id;
  const { sourceCode, language } = req.body;

  const result = await aiService.explainCode(userId, sourceCode, language);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: result,
  });
}

export async function suggestImprovements(req, res) {
  const userId = req.user.id;
  const { sourceCode, instruction, language } = req.body;

  const result = await aiService.suggestImprovements(userId, sourceCode, instruction, language);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: result,
  });
}

export async function getReviewById(req, res) {
  const { reviewId } = req.params;
  const review = await aiService.getReviewById(reviewId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: { review },
  });
}
