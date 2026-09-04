// ============================================================
// lib/providers/gitlab.ts — GitLab API commit extractor
// ============================================================
// Uses GitLab REST API v4 to fetch public commit metadata.
// Supports both gitlab.com and self-hosted GitLab instances.
// No git clone required — purely HTTP-based.
// ============================================================

import { getGravatarUrl, isGitHubNoReplyEmail } from '@/lib/gravatar';
import type { Contributor, RawCommit } from '@/types';

const MAX_PAGES = 10;
const PER_PAGE = 100;
const MAX_CONTRIBUTORS = 50;

interface GitLabCommitResponse {
  id: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
}

function buildHeaders(baseUrl: string): HeadersInit {
  const headers: HeadersInit = {
    'User-Agent': 'GitLeak-Finder/1.0 (academic-osint-project)',
  };

  // Use GITLAB_TOKEN for gitlab.com (can also be used for self-hosted)
  const token = process.env.GITLAB_TOKEN;
  if (token && token.trim() !== '') {
    headers['PRIVATE-TOKEN'] = token;
  }

  return headers;
}

/**
 * Aggregate raw commits into Contributor objects.
 */
function aggregateContributors(rawCommits: RawCommit[]): Contributor[] {
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
      isNoReplyEmail: isGitHubNoReplyEmail(email),
    }))
    .sort((a, b) => b.commitCount - a.commitCount)
    .slice(0, MAX_CONTRIBUTORS);
}

export interface GitLabAnalysisResult {
  contributors: Contributor[];
  totalCommitsAnalyzed: number;
  repoName: string;
  note?: string;
}

/**
 * Main entry point: fetches commits from a GitLab repository.
 *
 * @param repoUrl - Full HTTPS URL of the GitLab repository
 */
export async function analyzeGitLabRepo(repoUrl: string): Promise<GitLabAnalysisResult> {
  // Extract base URL and project path
  const parsed = new URL(repoUrl);
  const baseUrl = `${parsed.protocol}//${parsed.host}`;
  // Remove leading slash and .git suffix
  const projectPath = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '');
  // URL-encode the project path for the API (slashes → %2F)
  const encodedPath = encodeURIComponent(projectPath);

  const apiBase = `${baseUrl}/api/v4`;
  const projectUrl = `${apiBase}/projects/${encodedPath}`;

  // Check project exists and is public
  const projectCheck = await fetch(projectUrl, {
    headers: buildHeaders(baseUrl),
    signal: AbortSignal.timeout(8000),
  });

  if (projectCheck.status === 404) {
    const err = new Error('Dépôt GitLab introuvable ou privé.');
    (err as Error & { code: string }).code = 'REPO_NOT_FOUND';
    throw err;
  }

  if (projectCheck.status === 401 || projectCheck.status === 403) {
    const err = new Error('Ce dépôt GitLab est privé ou nécessite une authentification.');
    (err as Error & { code: string }).code = 'REPO_PRIVATE';
    throw err;
  }

  if (projectCheck.status === 429) {
    const err = new Error(
      'Limite de taux GitLab atteinte. Configurez un GITLAB_TOKEN ou réessayez plus tard.'
    );
    (err as Error & { code: string }).code = 'RATE_LIMITED';
    throw err;
  }

  if (!projectCheck.ok) {
    const err = new Error(`Erreur API GitLab : ${projectCheck.status}`);
    (err as Error & { code: string }).code = 'UNKNOWN_ERROR';
    throw err;
  }

  const projectData = (await projectCheck.json()) as {
    name: string;
    path_with_namespace: string;
    visibility: string;
  };

  if (projectData.visibility === 'private') {
    const err = new Error('Ce dépôt GitLab est privé. GitLeak Finder ne traite que les dépôts publics.');
    (err as Error & { code: string }).code = 'REPO_PRIVATE';
    throw err;
  }

  // Fetch commits with pagination
  const rawCommits: RawCommit[] = [];
  let page = 1;
  let hasMore = true;
  let note: string | undefined;

  while (hasMore && page <= MAX_PAGES) {
    const url = `${apiBase}/projects/${encodedPath}/repository/commits?per_page=${PER_PAGE}&page=${page}&all=true`;

    const response = await fetch(url, {
      headers: buildHeaders(baseUrl),
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 429) {
      const err = new Error(
        'Limite de taux GitLab atteinte. Réessayez plus tard ou configurez un GITLAB_TOKEN.'
      );
      (err as Error & { code: string }).code = 'RATE_LIMITED';
      throw err;
    }

    if (!response.ok) {
      // 404 on commits can mean empty repo
      if (response.status === 404) {
        break;
      }
      const err = new Error(`Erreur lors de la récupération des commits GitLab : ${response.status}`);
      (err as Error & { code: string }).code = 'UNKNOWN_ERROR';
      throw err;
    }

    const commits = (await response.json()) as GitLabCommitResponse[];

    if (!Array.isArray(commits) || commits.length === 0) {
      hasMore = false;
      break;
    }

    for (const c of commits) {
      if (c.author_email && c.authored_date) {
        rawCommits.push({
          email: c.author_email,
          authorName: c.author_name || 'Unknown',
          date: c.authored_date,
        });
      }
    }

    // Check if there are more pages
    const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1', 10);
    if (page >= totalPages || commits.length < PER_PAGE) {
      hasMore = false;
    } else {
      page++;
    }
  }

  if (rawCommits.length === 0) {
    const err = new Error('Aucun commit trouvé dans ce dépôt GitLab.');
    (err as Error & { code: string }).code = 'REPO_EMPTY';
    throw err;
  }

  if (page > MAX_PAGES) {
    note = `Analyse limitée aux ${rawCommits.length} commits les plus récents (plafonné à ${MAX_PAGES * PER_PAGE} pour les performances).`;
  }

  const contributors = aggregateContributors(rawCommits);

  return {
    contributors,
    totalCommitsAnalyzed: rawCommits.length,
    repoName: projectData.path_with_namespace,
    note,
  };
}
