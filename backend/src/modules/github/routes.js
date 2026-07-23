import { Router } from 'express';
import * as githubController from './controllers.js';
import * as githubDto from './dto.js';
import validate from '../../core/middleware/validate.js';
import authenticate from '../../core/middleware/authenticate.js';
import authorize from '../../core/middleware/authorize.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

// ── Global User GitHub Routes (/api/v1/github) ─────────────────────
export const userGitHubRouter = Router();

// OAuth callback from GitHub (browser redirect, state param contains user ID)
userGitHubRouter.get('/callback', asyncHandler(githubController.handleOAuthCallback));

// Authenticated routes
userGitHubRouter.use(authenticate);

// Initiate GitHub OAuth flow (redirects browser to GitHub)
userGitHubRouter.get('/auth', asyncHandler(githubController.initiateOAuth));

userGitHubRouter.post(
  '/connect',
  validate(githubDto.connectTokenSchema),
  asyncHandler(githubController.connectGitHub)
);

userGitHubRouter.delete(
  '/disconnect',
  asyncHandler(githubController.disconnectGitHub)
);

userGitHubRouter.get(
  '/status',
  asyncHandler(githubController.getGitHubStatus)
);

userGitHubRouter.get(
  '/repos',
  asyncHandler(githubController.getUserRepos)
);


// ── Room-Scoped GitHub Routes (/api/v1/rooms/:roomId/github) ────────
export const roomGitHubRouter = Router({ mergeParams: true });

roomGitHubRouter.use(authenticate);

roomGitHubRouter.post(
  '/import',
  authorize('editor'),
  validate(githubDto.importRepoSchema),
  asyncHandler(githubController.importRepo)
);

roomGitHubRouter.post(
  '/commit-push',
  authorize('editor'),
  validate(githubDto.commitPushSchema),
  asyncHandler(githubController.commitAndPush)
);

roomGitHubRouter.post(
  '/pr',
  authorize('editor'),
  validate(githubDto.createPRSchema),
  asyncHandler(githubController.createPullRequest)
);
