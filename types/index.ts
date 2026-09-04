// ============================================================
// types/index.ts — Shared TypeScript types for GitLeak Finder
// ============================================================

/** A single contributor aggregated from git commit history */
export interface Contributor {
  email: string;
  authorName: string;
  commitCount: number;
  firstCommitDate: string; // ISO 8601
  lastCommitDate: string;  // ISO 8601
  gravatarUrl: string;
  /** GitHub profile URL if found via /search/users (optional) */
  githubProfileUrl?: string;
  /** Flag: this email is a GitHub noreply address */
  isNoReplyEmail?: boolean;
}

/** Response from /api/analyze */
export interface AnalyzeResponse {
  success: true;
  repoUrl: string;
  repoName: string;
  provider: 'github' | 'gitlab' | 'generic';
  totalCommitsAnalyzed: number;
  contributors: Contributor[];
  analysisTimestamp: string; // ISO 8601
  note?: string; // Extra contextual note (pagination limit, noreply explanation, etc.)
}

/** Error response from /api/analyze */
export interface AnalyzeErrorResponse {
  success: false;
  error: string;
  code:
    | 'INVALID_URL'
    | 'REPO_NOT_FOUND'
    | 'REPO_PRIVATE'
    | 'REPO_EMPTY'
    | 'RATE_LIMITED'
    | 'TIMEOUT'
    | 'REPO_TOO_LARGE'
    | 'RATE_LIMIT_EXCEEDED_LOCAL' // Our own in-memory rate limit
    | 'UNKNOWN_ERROR';
}

/** Union type for API response */
export type ApiResponse = AnalyzeResponse | AnalyzeErrorResponse;

/** Raw commit entry before aggregation */
export interface RawCommit {
  email: string;
  authorName: string;
  date: string; // ISO 8601
}

/** Provider detection result */
export type Provider = 'github' | 'gitlab' | 'generic';

/** Parsed repository info from URL */
export interface RepoInfo {
  provider: Provider;
  owner?: string;
  repo?: string;
  url: string;
  /** For GitLab: project URL-encoded path or numeric ID */
  gitlabProjectPath?: string;
}
