'use client';

import { Loader2, Search, GitBranch } from 'lucide-react';

interface LoadingStateProps {
  repoUrl?: string;
}

export default function LoadingState({ repoUrl }: LoadingStateProps) {
  const messages = [
    'Connexion à l\'API…',
    'Récupération des commits…',
    'Agrégation des emails…',
    'Génération des avatars…',
  ];

  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4"
      aria-live="polite"
      aria-label="Analyse en cours"
    >
      {/* Animated icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
            <GitBranch size={24} className="text-blue-400" />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <h2 className="text-xl font-semibold text-white mb-2">Analyse en cours…</h2>
      {repoUrl && (
        <p className="text-sm text-gray-500 font-mono mb-6 max-w-sm truncate text-center">
          {repoUrl}
        </p>
      )}

      {/* Skeleton cards */}
      <div className="w-full max-w-3xl space-y-3 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-[#2a2a2a] bg-[#111111]"
            aria-hidden="true"
          >
            <div className="flex items-start gap-4">
              <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="flex gap-3">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-600 animate-pulse">
        Peut prendre jusqu&apos;à 30 secondes pour les gros dépôts…
      </p>
    </div>
  );
}
