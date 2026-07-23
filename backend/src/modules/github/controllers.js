import * as githubService from './services.js';
import CONSTANTS from '../../config/constants.js';

export async function initiateOAuth(req, res) {
  const userId = req.user.id;
  const authUrl = githubService.getOAuthAuthUrl(userId);
  res.redirect(authUrl);
}

export async function handleOAuthCallback(req, res) {
  const { code, state: userId } = req.query;

  if (!code) {
    return res.status(CONSTANTS.HTTP.BAD_REQUEST).json({
      status: 'error',
      message: 'Authorization code missing in OAuth callback',
    });
  }

  const targetUserId = userId || req.user?.id;
  if (!targetUserId) {
    return res.status(CONSTANTS.HTTP.UNAUTHORIZED).json({
      status: 'error',
      message: 'User identity missing for OAuth callback',
    });
  }

  const result = await githubService.exchangeOAuthCode(code, targetUserId);
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  res.redirect(`${frontendUrl}?github=success&username=${encodeURIComponent(result.username)}`);
}

export async function connectGitHub(req, res) {
  const userId = req.user.id;
  const { accessToken, username } = req.body;

  const result = await githubService.connectGitHub(userId, accessToken, username);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    message: 'GitHub account connected successfully.',
    data: result,
  });
}

export async function disconnectGitHub(req, res) {
  const userId = req.user.id;
  await githubService.disconnectGitHub(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    message: 'GitHub account disconnected.',
  });
}

export async function getGitHubStatus(req, res) {
  const userId = req.user.id;
  const status = await githubService.getGitHubStatus(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: status,
  });
}

export async function getUserRepos(req, res) {
  const userId = req.user.id;
  const repos = await githubService.getUserRepos(userId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: { repos },
  });
}

export async function importRepo(req, res) {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { owner, repo, branch } = req.body;

  const result = await githubService.importRepo(roomId, userId, owner, repo, branch);

  res.status(CONSTANTS.HTTP.ACCEPTED).json({
    status: 'success',
    data: result,
  });
}

export async function commitAndPush(req, res) {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { owner, repo, branch, message } = req.body;

  const result = await githubService.commitAndPush(roomId, userId, owner, repo, branch, message);

  res.status(CONSTANTS.HTTP.ACCEPTED).json({
    status: 'success',
    data: result,
  });
}

export async function createPullRequest(req, res) {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { owner, repo, title, body, head, base } = req.body;

  const pr = await githubService.createPullRequest(roomId, userId, owner, repo, title, body, head, base);

  res.status(CONSTANTS.HTTP.CREATED).json({
    status: 'success',
    data: { pullRequest: pr },
  });
}
