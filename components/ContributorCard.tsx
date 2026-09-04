'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Copy,
  Check,
  ExternalLink,
  GitCommit,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import type { Contributor } from '@/types';

interface ContributorCardProps {
  contributor: Contributor;
  rank: number;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ContributorCard({ contributor, rank }: ContributorCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contributor.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = contributor.email;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
  const rankLabel = rank <= 3 ? rankColors[rank - 1] : 'text-gray-600';

  return (
    <article
      className="contributor-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(rank * 0.05, 0.5)}s`, animationFillMode: 'both' }}
      aria-label={`Contributeur : ${contributor.authorName}`}
    >
      <div className="flex items-start gap-4">
        {/* Rank + Avatar */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className={`text-xs font-bold font-mono ${rankLabel}`} aria-label={`Rang ${rank}`}>
            #{rank}
          </span>
          <div className="relative">
            <Image
              src={contributor.gravatarUrl}
              alt={`Avatar de ${contributor.authorName}`}
              width={48}
              height={48}
              className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a]"
              unoptimized
            />
            {rank === 1 && (
              <span
                className="absolute -top-1 -right-1 text-base"
                aria-label="Contributeur principal"
              >
                👑
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name + profile link */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <User size={12} />
            </div>
            <span className="font-semibold text-white text-sm truncate">
              {contributor.authorName}
            </span>
            {contributor.githubProfileUrl && (
              <a
                href={contributor.githubProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Voir le profil GitHub de ${contributor.authorName}`}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Profil
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Email chip + copy button */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <code className="email-chip" aria-label={`Adresse email : ${contributor.email}`}>
              {contributor.email}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Email copié !' : "Copier l'adresse email"}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-300 border border-[#2a2a2a] hover:border-gray-600 transition-all duration-150"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* noreply warning */}
          {contributor.isNoReplyEmail && (
            <div className="flex items-start gap-1.5 mb-3 text-xs text-amber-500/80 bg-amber-500/5 border border-amber-500/15 rounded-md px-2.5 py-1.5">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>
                Email noreply GitHub — les commits via l&apos;interface web utilisent ce format protégé.
                Le nom d&apos;utilisateur y est souvent lisible.
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <GitCommit size={12} className="text-blue-500" />
              <span>
                <strong className="text-gray-300 font-semibold">
                  {contributor.commitCount.toLocaleString('fr-FR')}
                </strong>{' '}
                commit{contributor.commitCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-600" />
              <span>
                {formatDate(contributor.firstCommitDate)}
                {contributor.firstCommitDate !== contributor.lastCommitDate && (
                  <> → {formatDate(contributor.lastCommitDate)}</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
