import * as compilerRepo from './repositories.js';
import { compilerQueue } from '../../core/queue/index.js';
import { AppError } from '../../core/errors/AppError.js';

export async function submitExecutionJob({ roomId, userId, fileId, language, sourceCode }) {
  // 1. Create DB record for audit tracking
  const jobRecord = await compilerRepo.createCompilerJob({
    roomId,
    userId,
    fileId: fileId || null,
    language,
    sourceCode,
    status: 'queued',
  });

  // 2. Add job to BullMQ queue
  await compilerQueue.add(
    'execute-code',
    {
      jobId: jobRecord.id,
      roomId,
      userId,
      fileId,
      language,
      sourceCode,
    },
    {
      jobId: jobRecord.id,
    }
  );

  return jobRecord;
}

export async function getRoomJobs(roomId, limit, cursor) {
  return compilerRepo.getRoomCompilerJobs(roomId, limit, cursor);
}

export async function getJobById(roomId, jobId) {
  const job = await compilerRepo.getCompilerJobById(jobId, roomId);
  if (!job) {
    throw new AppError('Compiler job not found', 404);
  }
  return job;
}
