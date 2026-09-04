// ============================================================
// lib/extractor.ts — Provider detection and dispatch
// ============================================================
// Detects the appropriate provider from the repository URL
// and dispatches to the correct analyzer.
// ============================================================

import { analyzeGitHubRepo } from '@/lib/providers/github';
import { analyzeGitLabRepo } from '@/lib/providers/gitlab';
import { analyzeGenericRepo } from '@/lib/providers/generic-git';
import type { RepoInfo, Provider, AnalyzeResponse } from '@/types';

/**
 * Detects the provider and extracts repo info from a URL.
 */
export function detectProvider(repoUrl: string): RepoInfo {
  const parsed = new URL(repoUrl);
  const hostname = parsed.hostname.toLowerCase();

  if (hostname === 'github.com') {
    // Extract owner and repo from path
    const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (parts.length >= 2) {
      return {
        provider: 'github',
        owner: parts[0],
        repo: parts[1],
        url: repoUrl,
      };
    }
  }

  if (hostname === 'gitlab.com' || hostname.includes('gitlab.')) {
    const projectPath = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '');
    return {
      provider: 'gitlab',
      url: repoUrl,
      gitlabProjectPath: projectPath,
    };
  }

  // Default to generic git clone for any other host
  return {
    provider: 'generic',
    url: repoUrl,
  };
}

/**
 * Main extraction function: detects provider and runs analysis.
 * Returns a structured AnalyzeResponse (without the wrapping success/error).
 */
export async function extractCommitData(
  repoUrl: string
): Promise<Omit<AnalyzeResponse, 'success' | 'analysisTimestamp'>> {
  const repoInfo = detectProvider(repoUrl);

  switch (repoInfo.provider) {
    case 'github': {
      if (!repoInfo.owner || !repoInfo.repo) {
        const err = new Error("Impossible d'extraire le propriétaire/nom du dépôt depuis l'URL GitHub.");
        (err as Error & { code: string }).code = 'INVALID_URL';
        throw err;
      }
      const result = await analyzeGitHubRepo(repoInfo.owner, repoInfo.repo);
      return {
        repoUrl,
        repoName: result.repoName,
        provider: 'github',
        totalCommitsAnalyzed: result.totalCommitsAnalyzed,
        contributors: result.contributors,
        note: result.note,
      };
    }

    case 'gitlab': {
      const result = await analyzeGitLabRepo(repoUrl);
      return {
        repoUrl,
        repoName: result.repoName,
        provider: 'gitlab',
        totalCommitsAnalyzed: result.totalCommitsAnalyzed,
        contributors: result.contributors,
        note: result.note,
      };
    }

    case 'generic': {
      const result = await analyzeGenericRepo(repoUrl);
      return {
        repoUrl,
        repoName: result.repoName,
        provider: 'generic',
        totalCommitsAnalyzed: result.totalCommitsAnalyzed,
        contributors: result.contributors,
        note: result.note,
      };
    }
  }
}
