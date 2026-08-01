// ═══════════════════════════════════════════════════════════════
// GitHub Integration Types
// ═══════════════════════════════════════════════════════════════

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  expiresAt?: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  updated_at: string;
}

export interface ConnectGitHubData {
  accessToken: string;
  username: string;
}

export interface ImportRepoData {
  owner: string;
  repo: string;
  branch?: string;
}

export interface CommitPushData {
  owner: string;
  repo: string;
  branch?: string;
  message: string;
}

export interface CreatePRData {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  head: string;
  base?: string;
}

export interface PullRequest {
  number: number;
  html_url: string;
  title: string;
  state: string;
}
