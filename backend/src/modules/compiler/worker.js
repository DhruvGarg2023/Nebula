import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../../core/queue/index.js';
import * as compilerRepo from './repositories.js';
import * as runner from './runner.js';
import { streamStdout, streamStderr, streamDone } from './sockets.js';
import logger from '../../core/logger/index.js';

let workerInstance = null;

export function initCompilerWorker() {
  if (workerInstance) return workerInstance;

  workerInstance = new Worker(
    'compiler-queue',
    async (job) => {
      const { jobId, roomId, userId, fileId, language, sourceCode } = job.data;
      logger.info({ jobId, roomId, language }, 'Worker processing compiler job');

      // Update status to running in DB
      await compilerRepo.updateJobStatus(jobId, { status: 'running' });

      // Run code with real-time stream handlers
      const result = await runner.runCode({
        language,
        sourceCode,
        onStdout: (chunk) => streamStdout(roomId, jobId, chunk),
        onStderr: (chunk) => streamStderr(roomId, jobId, chunk),
      });

      // Save complete output & status in PostgreSQL
      const completedJob = await compilerRepo.updateJobStatus(jobId, {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTimeMs: result.executionTimeMs,
        completedAt: new Date(),
      });

      // Broadcast completion event to room
      streamDone(roomId, {
        jobId,
        roomId,
        status: result.status,
        exitCode: result.exitCode,
        executionTimeMs: result.executionTimeMs,
        stdout: result.stdout,
        stderr: result.stderr,
      });

      return completedJob;
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    }
  );

  workerInstance.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Compiler job completed successfully');
  });

  workerInstance.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Compiler job worker execution failed');
  });

  logger.info('Compiler BullMQ worker process initialized');
  return workerInstance;
}
