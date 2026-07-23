import * as githubRepository from './repositories.js';
import * as githubClient from './githubClient.js';
import { getGitHubQueue } from './worker.js';
import { ForbiddenError, NotFoundError, ConflictError } from '../../core/errors/AppError.js';
import { getRedisClient } from '../../core/redis/client.js';
import logger from '../../core/logger/index.js';

import config from '../../config/index.js';
import { AppError } from '../../core/errors/AppError.js';

export function getOAuthAuthUrl(userId) {
  const clientId = config.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/v1/github/callback';

  if (!clientId) {
    throw new AppError('CONFIG_ERROR', 'GITHUB_CLIENT_ID is not configured in environment variables');
  }

  const scope = 'repo user';
  const state = userId;

  return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
}

export async function exchangeOAuthCode(code, userId) {
  const clientId = config.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const clientSecret = config.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new AppError('CONFIG_ERROR', 'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured');
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    throw new AppError('GITHUB_OAUTH_ERROR', `OAuth exchange failed: ${tokenData.error_description || tokenData.error}`);
  }

  const accessToken = tokenData.access_token;

  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Collaborative-AI-Code-Editor',
    },
  });

  const userData = await userRes.json();
  const username = userData.login || 'github-user';

  return connectGitHub(userId, accessToken, username);
}

export async function connectGitHub(userId, accessToken, username) {
  const tokenRecord = await githubRepository.upsertGitHubToken(userId, accessToken, username);
  logger.info({ userId, username }, 'GitHub account connected successfully');
  return {
    username: tokenRecord.username,
    connectedAt: tokenRecord.updatedAt,
  };
}

export async function disconnectGitHub(userId) {
  await githubRepository.deleteGitHubToken(userId);
  logger.info({ userId }, 'GitHub account disconnected');
}

export async function getGitHubStatus(userId) {
  const token = await githubRepository.getGitHubToken(userId);
  return {
    isConnected: !!token,
    username: token?.username || null,
  };
}

export async function getUserRepos(userId) {
  const token = await githubRepository.getGitHubToken(userId);
  if (!token) {
    throw new ForbiddenError('GitHub account is not connected. Please connect your GitHub account first.');
  }

  return githubClient.getUserRepositories(token.accessToken);
}

export async function importRepo(roomId, userId, owner, repo, branch = 'main') {
  const token = await githubRepository.getGitHubToken(userId);
  if (!token) {
    throw new ForbiddenError('GitHub account is not connected. Please connect your GitHub account first.');
  }

  const queue = getGitHubQueue();
  const job = await queue.add('import-repo', {
    roomId,
    userId,
    owner,
    repo,
    branch,
    accessToken: token.accessToken,
  });

  logger.info({ roomId, userId, jobId: job.id, owner, repo }, 'Enqueued repository import job');

  return {
    jobId: job.id,
    status: 'queued',
    message: `Import job for ${owner}/${repo} enqueued successfully.`,
  };
}

export async function commitAndPush(roomId, userId, owner, repo, branch = 'main', message) {
  const token = await githubRepository.getGitHubToken(userId);
  if (!token) {
    throw new ForbiddenError('GitHub account is not connected. Please connect your GitHub account first.');
  }

  const lockKey = `lock:github:push:${roomId}`;
  const lockVal = `${userId}:${Date.now()}`;
  let lockAcquired = false;

  try {
    const redis = getRedisClient();
    const result = await redis.set(lockKey, lockVal, 'PX', 10000, 'NX');
    if (!result) {
      throw new ConflictError('A push operation to GitHub is already in progress for this room');
    }
    lockAcquired = true;

    const queue = getGitHubQueue();
    const job = await queue.add('commit-push', {
      roomId,
      userId,
      owner,
      repo,
      branch,
      message,
      accessToken: token.accessToken,
    });

    logger.info({ roomId, userId, jobId: job.id, owner, repo, branch }, 'Enqueued commit and push job');

    return {
      jobId: job.id,
      status: 'queued',
      message: `Commit and push job for ${owner}/${repo}#${branch} enqueued successfully.`,
    };
  } finally {
    if (lockAcquired) {
      try {
        const redis = getRedisClient();
        const currentLock = await redis.get(lockKey);
        if (currentLock === lockVal) {
          await redis.del(lockKey);
        }
      } catch (err) {
        logger.error({ err, lockKey }, 'Failed to release GitHub push lock');
      }
    }
  }
}

export async function createPullRequest(roomId, userId, owner, repo, title, body, head, base = 'main') {
  const token = await githubRepository.getGitHubToken(userId);
  if (!token) {
    throw new ForbiddenError('GitHub account is not connected. Please connect your GitHub account first.');
  }

  return githubClient.createPullRequest(
    token.accessToken,
    owner,
    repo,
    title,
    body,
    head,
    base
  );
}
