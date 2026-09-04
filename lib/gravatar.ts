// ============================================================
// lib/gravatar.ts — Gravatar URL generation
// ============================================================

import crypto from 'crypto';

/**
 * Generates a Gravatar URL for a given email address.
 * Uses MD5 hash of the normalized email (trimmed + lowercase).
 *
 * @param email - The email address to generate a Gravatar URL for
 * @param size  - Image size in pixels (default: 80)
 * @returns Full Gravatar URL with a "mystery person" fallback
 */
export function getGravatarUrl(email: string, size: number = 80): string {
  const normalized = email.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(normalized).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp&r=g`;
}

/**
 * Checks whether an email is a GitHub noreply address.
 * Examples:
 *   - 12345678+username@users.noreply.github.com
 *   - username@users.noreply.github.com (older format)
 */
export function isGitHubNoReplyEmail(email: string): boolean {
  return email.endsWith('@users.noreply.github.com');
}

/**
 * Extracts the GitHub username from a noreply email address.
 * Returns null if the email is not a noreply address.
 */
export function extractUsernameFromNoReply(email: string): string | null {
  if (!isGitHubNoReplyEmail(email)) return null;
  // Format: 12345678+username@users.noreply.github.com
  const match = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
  return match ? match[1] : null;
}
