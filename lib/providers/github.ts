// ============================================================
// lib/providers/github.ts — GitHub API commit extractor
// ============================================================
// Uses GitHub REST API v3 to fetch public commit metadata.
// No git clone required — purely HTTP-based.
//
// NOTE on email privacy:
//   If a user has enabled "Keep my email addresses private" AND commits
//   via GitHub web UI or API, the displayed email will be:
//     {numeric_id}+{username}@users.noreply.github.com
//   However, if commits are pushed via git CLI with a real email configured
//   (git config user.email), that real email will appear regardless of the
//   privacy setting — this is normal Git behavior, not a security flaw.
// ============================================================

import { getGravatarUrl, isGitHubNoReplyEmail } from '@/lib/gravatar';
import type { Contributor, RawCommit } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_PAGES = 10;        // Up to 300 commits (30 per page default, we use 100)
const PER_PAGE = 100;        // Maximum allowed by GitHub API
const MAX_CONTRIBUTORS = 50; // Cap displayed contributors

interface GitHubCommitResponse {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitLeak-Finder/1.0 (academic-osint-project)',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim() !== '') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Attempts to find a GitHub profile URL for a given email
 * using the GitHub Users Search API.
 * Only works if the user has made their email public.
 */
async function tryFindGitHubProfile(email: string): Promise<string | undefined> {
  // Skip noreply emails — username can be extracted directly
  if (isGitHubNoReplyEmail(email)) {
    const match = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
    if (match) {
      return `https://github.com/${match[1]}`;
    }
  }

  try {
    const url = `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(email)}+in:email&per_page=1`;
    const response = await fetch(url, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return undefined;

    const data = (await response.json()) as { items: Array<{ html_url: string }> };
    if (data.items && data.items.length > 0) {
      return data.items[0].html_url;
    }
  } catch {
    // Search failed — not critical, silently ignore
  }
  return undefined;
}

/**
 * Aggregate raw commits into Contributor objects.
 */
function aggregateContributors(
  rawCommits: RawCommit[],
  profileMap: Map<string, string>
): Contributor[] {
  const map = new Map<
    string,
    {
      authorName: string;
      commitCount: number;
      firstCommitDate: string;
      lastCommitDate: string;
    }
  >();

  for (const commit of rawCommits) {
    const key = commit.email.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.commitCount++;
      if (commit.date < existing.firstCommitDate) {
        existing.firstCommitDate = commit.date;
      }
      if (commit.date > existing.lastCommitDate) {
        existing.lastCommitDate = commit.date;
      }
    } else {
      map.set(key, {
        authorName: commit.authorName,
        commitCount: 1,
        firstCommitDate: commit.date,
        lastCommitDate: commit.date,
      });
    }
  }

  return Array.from(map.entries())
    .map(([email, data]) => ({
      email,
      authorName: data.authorName,
      commitCount: data.commitCount,
      firstCommitDate: data.firstCommitDate,
      lastCommitDate: data.lastCommitDate,
      gravatarUrl: getGravatarUrl(email),
      githubProfileUrl: profileMap.get(email),
      isNoReplyEmail: isGitHubNoReplyEmail(email),
    }))
    .sort((a, b) => b.commitCount - a.commitCount)
    .slice(0, MAX_CONTRIBUTORS);
}

export interface GitHubAnalysisResult {
  contributors: Contributor[];
  totalCommitsAnalyzed: number;
  repoName: string;
  note?: string;
}

/**
 * Main entry point: fetches commits from a GitHub repository
 * using the REST API (no git clone needed).
 *
 * @param owner - Repository owner (user or organization)
 * @param repo  - Repository name
 * @throws Error with a code property for structured error handling
 */
export async function analyzeGitHubRepo(
  owner: string,
  repo: string
): Promise<GitHubAnalysisResult> {
  const rawCommits: RawCommit[] = [];
  let page = 1;
  let hasMore = true;
  let note: string | undefined;

  // Validate repo exists and is public
  const repoCheckUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const repoCheck = await fetch(repoCheckUrl, {
    headers: buildHeaders(),
    signal: AbortSignal.timeout(8000),
  });

  if (repoCheck.status === 404) {
    const err = new Error('Dépôt introuvable ou privé');
    (err as Error & { code: string }).code = 'REPO_NOT_FOUND';
    throw err;
  }
  if (repoCheck.status === 403 || repoCheck.status === 429) {
    const err = new Error(
      'Limite de taux GitHub atteinte. Configurez un GITHUB_TOKEN ou réessayez plus tard.'
    );
    (err as Error & { code: string }).code = 'RATE_LIMITED';
    throw err;
  }
  if (!repoCheck.ok) {
    const err = new Error(`Erreur API GitHub : ${repoCheck.status}`);
    (err as Error & { code: string }).code = 'UNKNOWN_ERROR';
    throw err;
  }

  const repoData = (await repoCheck.json()) as { private: boolean; full_name: string; name: string };
  if (repoData.private) {
    const err = new Error('Ce dépôt est privé. GitLeak Finder ne traite que les dépôts publics.');
    (err as Error & { code: string }).code = 'REPO_PRIVATE';
    throw err;
  }

  // Fetch commits with pagination
  while (hasMore && page <= MAX_PAGES) {
    const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${PER_PAGE}&page=${page}`;

    const response = await fetch(url, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 409) {
      // Empty repository
      const err = new Error('Ce dépôt ne contient aucun commit.');
      (err as Error & { code: string }).code = 'REPO_EMPTY';
      throw err;
    }

    if (response.status === 403 || response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 'quelques minutes';
      const err = new Error(
        `Limite de taux GitHub atteinte. Réessayez dans ${retryAfter}. Configurez un GITHUB_TOKEN pour des limites plus élevées.`
      );
      (err as Error & { code: string }).code = 'RATE_LIMITED';
      throw err;
    }

    if (!response.ok) {
      const err = new Error(`Erreur API GitHub lors de la récupération des commits : ${response.status}`);
      (err as Error & { code: string }).code = 'UNKNOWN_ERROR';
      throw err;
    }

    const commits = (await response.json()) as GitHubCommitResponse[];

    if (!Array.isArray(commits) || commits.length === 0) {
      hasMore = false;
      break;
    }

    for (const c of commits) {
      if (c.commit?.author?.email && c.commit?.author?.date) {
        rawCommits.push({
          email: c.commit.author.email,
          authorName: c.commit.author.name || 'Unknown',
          date: c.commit.author.date,
        });
      }
    }

    if (commits.length < PER_PAGE) {
      hasMore = false;
    } else {
      page++;
    }
  }

  if (rawCommits.length === 0) {
    const err = new Error('Aucun commit trouvé dans ce dépôt.');
    (err as Error & { code: string }).code = 'REPO_EMPTY';
    throw err;
  }

  if (page > MAX_PAGES) {
    note = `Analyse limitée aux ${rawCommits.length} commits les plus récents (plafonné à ${MAX_PAGES * PER_PAGE} pour les performances).`;
  }

  // Try to enrich with GitHub profile URLs (best-effort, capped)
  const uniqueEmails = [...new Set(rawCommits.map((c) => c.email.toLowerCase()))];
  const profileMap = new Map<string, string>();

  // Only search for profiles for top emails (limit API calls)
  const topEmails = uniqueEmails.slice(0, 10);
  await Promise.allSettled(
    topEmails.map(async (email) => {
      const profileUrl = await tryFindGitHubProfile(email);
      if (profileUrl) profileMap.set(email, profileUrl);
    })
  );

  const contributors = aggregateContributors(rawCommits, profileMap);

  return {
    contributors,
    totalCommitsAnalyzed: rawCommits.length,
    repoName: repoData.full_name,
    note,
  };
}
