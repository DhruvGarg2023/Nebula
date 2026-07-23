import logger from '../../core/logger/index.js';
import { AppError } from '../../core/errors/AppError.js';

const GITHUB_API_BASE = 'https://api.github.com';

function getHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Collaborative-AI-Code-Editor',
  };
}

/**
 * Fetch authenticated user repositories from GitHub.
 */
export async function getUserRepositories(accessToken) {
  const res = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new AppError('GITHUB_API_ERROR', `GitHub API error: ${errorBody.message || res.statusText}`, res.status);
  }

  const repos = await res.json();
  return repos.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    isPrivate: r.private,
    defaultBranch: r.default_branch,
    htmlUrl: r.html_url,
    description: r.description,
  }));
}

/**
 * Fetch recursive repository file tree from GitHub.
 */
export async function getRepositoryTree(accessToken, owner, repo, branch = 'main') {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new AppError('GITHUB_API_ERROR', `Failed to fetch repo tree: ${errorBody.message || res.statusText}`, res.status);
  }

  const data = await res.json();
  return (data.tree || []).filter((item) => item.type === 'blob'); // Filter files only
}

/**
 * Fetch content of a specific file from GitHub.
 */
export async function getFileContent(accessToken, owner, repo, path, branch = 'main') {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: getHeaders(accessToken),
  });

  if (!res.ok) return '';

  const data = await res.json();
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return data.content || '';
}

/**
 * Create a Git commit and update remote branch reference on GitHub.
 */
export async function commitAndPushFiles(accessToken, owner, repo, branch, message, files) {
  const headers = getHeaders(accessToken);

  // 1. Get branch reference (latest commit SHA)
  const refRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
  if (!refRes.ok) {
    throw new AppError('GITHUB_API_ERROR', `Branch '${branch}' not found on remote repository`, refRes.status);
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 2. Get latest commit tree SHA
  const commitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Create tree entries for all files
  const treeItems = files.map((file) => ({
    path: file.name,
    mode: '100644',
    type: 'blob',
    content: file.content || '',
  }));

  const createTreeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });

  if (!createTreeRes.ok) {
    const errData = await createTreeRes.json().catch(() => ({}));
    throw new AppError('GITHUB_API_ERROR', `Failed to create Git tree: ${errData.message || createTreeRes.statusText}`, createTreeRes.status);
  }
  const newTreeData = await createTreeRes.json();

  // 4. Create commit
  const newCommitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    }),
  });

  if (!newCommitRes.ok) {
    throw new AppError('GITHUB_API_ERROR', 'Failed to create commit on GitHub', newCommitRes.status);
  }
  const newCommitData = await newCommitRes.json();

  // 5. Update branch reference to point to new commit
  const updateRefRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommitData.sha,
      force: false,
    }),
  });

  if (!updateRefRes.ok) {
    throw new AppError('GITHUB_API_ERROR', 'Failed to push commit reference to GitHub', updateRefRes.status);
  }

  logger.info({ owner, repo, branch, commitSha: newCommitData.sha }, 'Successfully pushed commit to GitHub');

  return {
    commitSha: newCommitData.sha,
    branch,
    commitUrl: `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${newCommitData.sha}`,
  };
}

/**
 * Create a Pull Request on GitHub.
 */
export async function createPullRequest(accessToken, owner, repo, title, body, head, base = 'main') {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify({
      title,
      body: body || '',
      head,
      base,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new AppError('GITHUB_API_ERROR', `Failed to create Pull Request: ${errorBody.message || res.statusText}`, res.status);
  }

  const pr = await res.json();
  return {
    id: pr.id,
    number: pr.number,
    htmlUrl: pr.html_url,
    title: pr.title,
    state: pr.state,
  };
}
