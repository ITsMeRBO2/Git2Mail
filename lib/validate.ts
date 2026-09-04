// ============================================================
// lib/validate.ts — Input validation using Zod
// ============================================================

import { z } from 'zod';

/**
 * Regex that matches plausible public git repository URLs.
 * Accepts:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - https://gitlab.com/group/subgroup/repo
 *   - https://gitlab.com/group/subgroup/repo.git
 *   - https://bitbucket.org/owner/repo
 *   - https://codeberg.org/owner/repo
 *   - Any https:// URL ending in .git
 *
 * Rejects:
 *   - http:// URLs (unencrypted, potentially unsafe)
 *   - SSH git URLs (git@github.com:...) — we can't clone those in serverless
 *   - localhost / private IP ranges
 *   - Anything without a recognizable git host pattern
 */
const GIT_URL_REGEX =
  /^https:\/\/(?:github\.com|gitlab\.com|bitbucket\.org|codeberg\.org|[\w.-]+\.[\w]{2,})\/[\w.@:~\-/%]+(?:\.git)?(?:\/)?$/i;

/** Private/internal IP ranges that should never be accepted */
const PRIVATE_HOST_REGEX =
  /^(localhost|127\.|0\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i;

export const repoUrlSchema = z
  .string()
  .min(10, 'URL trop courte')
  .max(500, 'URL trop longue')
  .trim()
  .transform((url) => {
    // Remove trailing slashes for normalization
    return url.replace(/\/+$/, '');
  })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: "L'URL doit utiliser le protocole HTTPS" }
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return !PRIVATE_HOST_REGEX.test(parsed.hostname);
      } catch {
        return false;
      }
    },
    { message: 'Les adresses locales ou privées ne sont pas autorisées' }
  )
  .refine((url) => GIT_URL_REGEX.test(url), {
    message:
      "L'URL ne ressemble pas à une URL de dépôt Git valide (ex: https://github.com/owner/repo)",
  });

export const analyzeRequestSchema = z.object({
  repoUrl: repoUrlSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// ---- Manual test utility (used during development) ----
export function testValidation() {
  const cases = [
    { url: 'https://github.com/torvalds/linux', expectValid: true },
    { url: 'https://github.com/facebook/react.git', expectValid: true },
    { url: 'https://gitlab.com/gitlab-org/gitlab', expectValid: true },
    { url: 'https://bitbucket.org/atlassian/python-bitbucket', expectValid: true },
    { url: 'http://github.com/owner/repo', expectValid: false },
    { url: 'git@github.com:owner/repo.git', expectValid: false },
    { url: 'https://localhost/owner/repo', expectValid: false },
    { url: 'https://192.168.1.1/owner/repo', expectValid: false },
    { url: 'not-a-url', expectValid: false },
    { url: '', expectValid: false },
  ];

  let allPassed = true;
  for (const { url, expectValid } of cases) {
    const result = repoUrlSchema.safeParse(url);
    const passed = result.success === expectValid;
    if (!passed) {
      console.error(`FAIL: "${url}" — expected ${expectValid}, got ${result.success}`);
      allPassed = false;
    }
  }
  return allPassed;
}
