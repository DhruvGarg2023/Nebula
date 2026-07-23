import { Worker, Queue } from 'bullmq';
import { redisConnectionOptions } from '../../core/queue/index.js';
import * as githubClient from './githubClient.js';
import prisma from '../../core/database/prisma.js';
import * as versionRepository from '../version/repositories.js';
import logger from '../../core/logger/index.js';

export const GITHUB_QUEUE_NAME = 'github-queue';

/** @type {Queue | null} */
let githubQueue = null;
/** @type {Worker | null} */
let githubWorker = null;

export function getGitHubQueue() {
  if (!githubQueue) {
    githubQueue = new Queue(GITHUB_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    });
  }
  return githubQueue;
}

export function initGitHubWorker() {
  if (githubWorker) return githubWorker;

  githubWorker = new Worker(
    GITHUB_QUEUE_NAME,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, `Processing GitHub job: ${job.name}`);

      if (job.name === 'import-repo') {
        return processImportJob(job);
      } else if (job.name === 'commit-push') {
        return processPushJob(job);
      } else {
        throw new Error(`Unknown GitHub job type: ${job.name}`);
      }
    },
    { connection: redisConnectionOptions, concurrency: 3 }
  );

  githubWorker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'GitHub job completed successfully');
  });

  githubWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'GitHub job failed');
  });

  logger.info('GitHub BullMQ worker process initialized');
  return githubWorker;
}

async function processImportJob(job) {
  const { roomId, userId, owner, repo, branch, accessToken } = job.data;

  // 1. Fetch file tree from GitHub
  const tree = await githubClient.getRepositoryTree(accessToken, owner, repo, branch);

  // Limit import to first 50 files for security & memory protection
  const filesToImport = tree.slice(0, 50);
  const importedFiles = [];

  for (const item of filesToImport) {
    const content = await githubClient.getFileContent(accessToken, owner, repo, item.path, branch);
    const fileName = item.path.split('/').pop();
    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'txt';

    // Map extension to language string
    const langMap = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
    };
    const language = langMap[ext] || 'plaintext';

    // Upsert room file in database
    const existingFile = await prisma.file.findFirst({
      where: { roomId, name: fileName },
    });

    let fileRecord;
    if (existingFile) {
      fileRecord = await prisma.file.update({
        where: { id: existingFile.id },
        data: { content, language },
      });
    } else {
      fileRecord = await prisma.file.create({
        data: {
          roomId,
          name: fileName,
          content,
          language,
        },
      });
    }
    importedFiles.push(fileRecord);
  }

  // Create automatic version snapshot for imported repo
  if (importedFiles.length > 0) {
    await versionRepository.createSnapshot(
      roomId,
      userId,
      `GitHub Import (${owner}/${repo}#${branch})`,
      `Imported ${importedFiles.length} files from GitHub repository ${owner}/${repo}`,
      importedFiles
    );
  }

  return {
    roomId,
    filesCount: importedFiles.length,
    status: 'completed',
  };
}

async function processPushJob(job) {
  const { roomId, userId, owner, repo, branch, message, accessToken } = job.data;

  // 1. Fetch active room files
  const roomFiles = await prisma.file.findMany({
    where: { roomId },
  });

  if (roomFiles.length === 0) {
    throw new Error('No files found in room to commit and push.');
  }

  // 2. Commit and push via GitHub Client
  const result = await githubClient.commitAndPushFiles(
    accessToken,
    owner,
    repo,
    branch,
    message,
    roomFiles
  );

  return result;
}
