import { Worker, Queue } from 'bullmq';
import { redisConnectionOptions } from '../../core/queue/index.js';
import * as aiRepository from './repositories.js';
import { getAiProvider } from './gateway.js';
import { parseReviewResponse } from './responseParser.js';
import logger from '../../core/logger/index.js';

export const AI_QUEUE_NAME = 'ai-queue';

/** @type {Queue | null} */
let aiQueue = null;
/** @type {Worker | null} */
let aiWorker = null;

export function getAiQueue() {
  if (!aiQueue) {
    aiQueue = new Queue(AI_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    });
  }
  return aiQueue;
}

export function initAiWorker() {
  if (aiWorker) return aiWorker;

  aiWorker = new Worker(
    AI_QUEUE_NAME,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, `Processing AI job: ${job.name}`);
      if (job.name === 'code-review') {
        return processReviewJob(job);
      }
      throw new Error(`Unknown AI job type: ${job.name}`);
    },
    { connection: redisConnectionOptions, concurrency: 3 }
  );

  aiWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'AI review job completed successfully');
  });

  aiWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'AI review job failed');
  });

  logger.info('AI BullMQ worker process initialized');
  return aiWorker;
}

async function processReviewJob(job) {
  const { reviewId, sourceCode, language } = job.data;

  // 1. Update review status to running
  await aiRepository.updateAiReviewStatus(reviewId, 'running');

  try {
    // 2. Invoke AI Gateway provider
    const provider = getAiProvider();
    const rawResult = await provider.generateReview(sourceCode, language);

    // 3. Parse and normalize structured output
    const parsed = parseReviewResponse(rawResult);

    // 4. Save completed audit record to database
    return aiRepository.updateAiReviewStatus(
      reviewId,
      'completed',
      parsed.summary,
      parsed.issues,
      parsed.suggestions,
      0.002
    );
  } catch (err) {
    logger.error({ reviewId, err }, 'Failed to process AI code review');
    await aiRepository.updateAiReviewStatus(reviewId, 'failed', `Error: ${err.message}`);
    throw err;
  }
}
