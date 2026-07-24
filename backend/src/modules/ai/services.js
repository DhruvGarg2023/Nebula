import * as aiRepository from './repositories.js';
import { getAiProvider } from './gateway.js';
import { getAiQueue } from './worker.js';
import { parseExplainResponse, parseSuggestResponse } from './responseParser.js';
import { AppError, NotFoundError } from '../../core/errors/AppError.js';
import config from '../../config/index.js';
import prisma from '../../core/database/prisma.js';
import logger from '../../core/logger/index.js';

export async function checkQuotaLimits(userId) {
  // 1. Daily User Limit Check
  const dailyCount = await aiRepository.getUserDailyRequestCount(userId);
  const maxDaily = config.AI_DAILY_LIMIT_PER_USER || 50;

  if (dailyCount >= maxDaily) {
    throw new AppError(
      'AI_RATE_LIMIT_EXCEEDED',
      `You have reached your daily limit of ${maxDaily} AI requests. Please try again tomorrow.`,
      429
    );
  }

  // 2. Monthly Budget Cap Check
  const monthlyCost = await aiRepository.getMonthlySystemCost();
  const maxMonthlyCost = config.AI_MONTHLY_BUDGET_USD || 500;

  if (monthlyCost >= maxMonthlyCost) {
    throw new AppError(
      'AI_BUDGET_EXCEEDED',
      'System-wide monthly AI budget has been reached. AI services are temporarily paused.',
      503
    );
  }
}

export async function requestReview(roomId, userId, fileId = null, sourceCode = '', language = 'javascript') {
  await checkQuotaLimits(userId);

  let codeToReview = sourceCode;
  if (fileId && (!codeToReview || codeToReview.trim() === '')) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundError('Specified file not found');
    }
    codeToReview = file.content;
    language = file.language || language;
  }

  if (!codeToReview || codeToReview.trim() === '') {
    throw new AppError('VALIDATION_ERROR', 'No code provided for AI review.', 400);
  }

  const reviewRecord = await aiRepository.createAiReview(roomId, userId, fileId);

  const queue = getAiQueue();
  const job = await queue.add('code-review', {
    reviewId: reviewRecord.id,
    roomId,
    userId,
    fileId,
    sourceCode: codeToReview,
    language,
  });

  logger.info({ reviewId: reviewRecord.id, jobId: job.id, roomId, userId }, 'Enqueued AI code review job');

  return {
    reviewId: reviewRecord.id,
    jobId: job.id,
    status: 'queued',
    message: 'AI code review job enqueued successfully.',
  };
}

export async function explainCode(userId, sourceCode, language = 'javascript') {
  await checkQuotaLimits(userId);

  const provider = getAiProvider();
  const rawResponse = await provider.generateExplanation(sourceCode, language);

  return parseExplainResponse(rawResponse);
}

export async function suggestImprovements(userId, sourceCode, instruction = '', language = 'javascript') {
  await checkQuotaLimits(userId);

  const provider = getAiProvider();
  const rawResponse = await provider.generateSuggestion(sourceCode, instruction, language);

  return parseSuggestResponse(rawResponse);
}

export async function getReviewById(reviewId) {
  const review = await aiRepository.getAiReviewById(reviewId);
  if (!review) {
    throw new NotFoundError(`AI Review with ID '${reviewId}' not found`);
  }
  return review;
}
