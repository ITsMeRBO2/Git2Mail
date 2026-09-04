// ============================================================
// lib/providers/generic-git.ts — Generic git clone fallback
// ============================================================
// Used for repositories NOT on github.com or gitlab.com.
// Performs a shallow clone into /tmp using simple-git,
// then parses git log output.
//
// SECURITY:
//   - Never builds shell commands by string concatenation.
//   - Uses simple-git methods which accept argument arrays internally.
//   - Cleans up /tmp directory in a finally block.
//
// CONSTRAINTS:
//   - Requires Node.js runtime (NOT Edge runtime).
//   - maxDuration must be set to 60s in the Route Handler.
//   - Timeout of 20s on the clone operation.
// ============================================================

import { getGravatarUrl, isGitHubNoReplyEmail } from '@/lib/gravatar';
import type { Contributor, RawCommit } from '@/types';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import simpleGit, { SimpleGit } from 'simple-git';

const MAX_DEPTH = 100;        // Shallow clone depth
const CLONE_TIMEOUT_MS = 20000; // 20 seconds max for clone
const MAX_CONTRIBUTORS = 50;

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

/**
 * Parses git log output in format: %ae|%an|%aI (email|name|ISO date)
 */
function parseGitLog(output: string): RawCommit[] {
  const commits: RawCommit[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Find the first and second pipe to safely handle names with pipes (unlikely but possible)
    const firstPipe = trimmed.indexOf('|');
    const secondPipe = trimmed.indexOf('|', firstPipe + 1);

    if (firstPipe === -1 || secondPipe === -1) continue;

    const email = trimmed.substring(0, firstPipe).trim();
    const authorName = trimmed.substring(firstPipe + 1, secondPipe).trim();
    const date = trimmed.substring(secondPipe + 1).trim();

    if (email && date) {
      commits.push({ email, authorName: authorName || 'Unknown', date });
    }
  }

  return commits;
}

export interface GenericGitAnalysisResult {
  contributors: Contributor[];
  totalCommitsAnalyzed: number;
  repoName: string;
  note?: string;
}

/**
 * Main entry point: clones a repository shallowly and extracts
 * commit email metadata from git log.
 *
 * @param repoUrl - Full HTTPS URL of the repository to analyze
 */
export async function analyzeGenericRepo(repoUrl: string): Promise<GenericGitAnalysisResult> {
  // Generate a unique temporary directory for this request
  const tmpDir = path.join(os.tmpdir(), `gitleak-${crypto.randomUUID()}`);

  try {
    // Create the temp directory
    await fs.mkdir(tmpDir, { recursive: true });

    // Initialize simple-git with the temp directory as base
    const git: SimpleGit = simpleGit({
      baseDir: os.tmpdir(),
      binary: 'git',
      maxConcurrentProcesses: 1,
      trimmed: false,
    });

    // Shallow clone with timeout
    // SECURITY: repoUrl is validated by Zod before reaching this point.
    // simple-git passes arguments as an array to execFile, preventing shell injection.
    const clonePromise = git.clone(repoUrl, tmpDir, [
      '--depth', String(MAX_DEPTH),
      '--no-single-branch',
      '--no-tags',
    ]);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('CLONE_TIMEOUT'));
      }, CLONE_TIMEOUT_MS);
    });

    try {
      await Promise.race([clonePromise, timeoutPromise]);
    } catch (cloneErr) {
      const msg = cloneErr instanceof Error ? cloneErr.message : String(cloneErr);

      if (msg === 'CLONE_TIMEOUT') {
        const err = new Error(
          'Le dépôt est trop volumineux pour une analyse rapide (timeout après 20s). Essayez un dépôt plus petit.'
        );
        (err as Error & { code: string }).code = 'REPO_TOO_LARGE';
        throw err;
      }

      // Parse common git clone errors
      if (msg.includes('Repository not found') || msg.includes('not found') || msg.includes('does not exist')) {
        const err = new Error('Dépôt introuvable. Vérifiez que l\'URL est correcte et que le dépôt est public.');
        (err as Error & { code: string }).code = 'REPO_NOT_FOUND';
        throw err;
      }

      if (msg.includes('Authentication failed') || msg.includes('403') || msg.includes('401')) {
        const err = new Error('Ce dépôt est privé ou nécessite une authentification.');
        (err as Error & { code: string }).code = 'REPO_PRIVATE';
        throw err;
      }

      throw cloneErr;
    }

    // Initialize git in the cloned directory
    const repoGit: SimpleGit = simpleGit(tmpDir);

    // Extract commit log: format is %ae|%an|%aI (author email|author name|author date ISO)
    const logOutput = await repoGit.raw([
      'log',
      '--all',
      `--pretty=format:%ae|%an|%aI`,
      '--no-merges',
    ]);

    const rawCommits = parseGitLog(logOutput);

    if (rawCommits.length === 0) {
      const err = new Error('Aucun commit trouvé dans ce dépôt.');
      (err as Error & { code: string }).code = 'REPO_EMPTY';
      throw err;
    }

    const contributors = aggregateContributors(rawCommits);

    // Extract a clean repo name from the URL
    const parsed = new URL(repoUrl);
    const repoName = parsed.pathname
      .replace(/^\//, '')
      .replace(/\.git$/, '')
      .replace(/\/$/, '');

    const note =
      rawCommits.length >= MAX_DEPTH
        ? `Analyse basée sur un clone superficiel (${MAX_DEPTH} commits). L'historique complet peut contenir davantage de contributeurs.`
        : undefined;

    return {
      contributors,
      totalCommitsAnalyzed: rawCommits.length,
      repoName,
      note,
    };
  } finally {
    // ALWAYS clean up the temporary directory, even if an error occurred
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Cleanup failure is non-critical — log it but don't throw
      console.warn(`[generic-git] Failed to clean up temp dir: ${tmpDir}`);
    }
  }
}
