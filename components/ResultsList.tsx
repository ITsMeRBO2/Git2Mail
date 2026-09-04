'use client';

import { GitBranch, Users, Hash, Info } from 'lucide-react';
import type { AnalyzeResponse } from '@/types';
import ContributorCard from './ContributorCard';

interface ResultsListProps {
  result: AnalyzeResponse;
}

const PROVIDER_LABELS: Record<AnalyzeResponse['provider'], string> = {
  github: 'GitHub API',
  gitlab: 'GitLab API',
  generic: 'Git Clone (générique)',
};

const PROVIDER_COLORS: Record<AnalyzeResponse['provider'], string> = {
  github: 'bg-gray-800 text-gray-200 border-gray-700',
  gitlab: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
  generic: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
};

export default function ResultsList({ result }: ResultsListProps) {
  const { contributors, repoName, totalCommitsAnalyzed, provider, note } = result;

  if (contributors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-300 mb-2">Aucun contributeur trouvé</h2>
        <p className="text-gray-500 text-sm">
          Ce dépôt ne contient pas de commits avec des métadonnées d&apos;auteur.
        </p>
      </div>
    );
  }

  return (
    <section
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up"
      aria-label="Résultats de l'analyse"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-2xl font-display font-black text-white">
            Résultats
          </h2>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${PROVIDER_COLORS[provider]}`}
          >
            {PROVIDER_LABELS[provider]}
          </span>
        </div>

        {/* Repo info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <GitBranch size={14} className="text-gray-600" />
            <a
              href={result.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs"
            >
              {repoName}
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <Hash size={14} className="text-gray-600" />
            <span>
              <strong className="text-gray-300">{totalCommitsAnalyzed.toLocaleString('fr-FR')}</strong>
              {' '}commits analysés
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-600" />
            <span>
              <strong className="text-gray-300">{contributors.length}</strong>
              {' '}contributeur{contributors.length > 1 ? 's' : ''} identifié{contributors.length > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {/* Optional note */}
        {note && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 text-sm text-blue-300/80">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-400" />
            <span>{note}</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {contributors.map((contributor, index) => (
          <ContributorCard
            key={contributor.email}
            contributor={contributor}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="mt-8 p-4 rounded-lg bg-[#111111] border border-[#2a2a2a] text-xs text-gray-600 leading-relaxed">
        <strong className="text-gray-500">ℹ️ Note éthique :</strong> Ces données sont extraites des métadonnées publiques de commits Git
        — identiques à ce qu&apos;afficherait la commande <code className="text-gray-400 bg-[#1a1a1a] px-1 rounded">git log</code> sur ce dépôt.
        Aucune donnée privée n&apos;est accédée. Seuls les dépôts publics sont analysés.
      </div>
    </section>
  );
}
