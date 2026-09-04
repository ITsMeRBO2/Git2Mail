'use client';

import { AlertTriangle, X, RefreshCw, Lock, GitBranch, Clock, Zap, HelpCircle } from 'lucide-react';
import type { AnalyzeErrorResponse } from '@/types';

interface ErrorBannerProps {
  error: AnalyzeErrorResponse;
  onDismiss?: () => void;
  onRetry?: () => void;
}

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  color: string;
  borderColor: string;
  bgColor: string;
  suggestion?: string;
}

function getErrorConfig(code: AnalyzeErrorResponse['code']): ErrorConfig {
  switch (code) {
    case 'REPO_NOT_FOUND':
      return {
        icon: <GitBranch size={18} />,
        title: 'Dépôt introuvable',
        color: 'text-red-400',
        borderColor: 'border-red-500/20',
        bgColor: 'bg-red-500/5',
        suggestion: "Vérifiez que l'URL est correcte et que le dépôt existe bien.",
      };
    case 'REPO_PRIVATE':
      return {
        icon: <Lock size={18} />,
        title: 'Dépôt privé',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/5',
        suggestion: 'GitLeak Finder ne peut analyser que des dépôts publics.',
      };
    case 'REPO_EMPTY':
      return {
        icon: <GitBranch size={18} />,
        title: 'Dépôt vide',
        color: 'text-gray-400',
        borderColor: 'border-gray-500/20',
        bgColor: 'bg-gray-500/5',
        suggestion: "Ce dépôt ne contient pas encore de commits.",
      };
    case 'RATE_LIMITED':
      return {
        icon: <Zap size={18} />,
        title: 'Limite de taux atteinte',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500/20',
        bgColor: 'bg-yellow-500/5',
        suggestion:
          'Réessayez dans quelques minutes. Vous pouvez configurer un GITHUB_TOKEN pour augmenter les limites.',
      };
    case 'RATE_LIMIT_EXCEEDED_LOCAL':
      return {
        icon: <Clock size={18} />,
        title: 'Trop de requêtes',
        color: 'text-orange-400',
        borderColor: 'border-orange-500/20',
        bgColor: 'bg-orange-500/5',
        suggestion: 'Vous avez dépassé la limite de 10 analyses par minute. Réessayez dans un moment.',
      };
    case 'REPO_TOO_LARGE':
    case 'TIMEOUT':
      return {
        icon: <Clock size={18} />,
        title: 'Dépôt trop volumineux',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/20',
        bgColor: 'bg-purple-500/5',
        suggestion:
          "L'opération a dépassé le délai maximum. Essayez un dépôt avec moins de commits.",
      };
    case 'INVALID_URL':
      return {
        icon: <AlertTriangle size={18} />,
        title: 'URL invalide',
        color: 'text-red-400',
        borderColor: 'border-red-500/20',
        bgColor: 'bg-red-500/5',
        suggestion: "Entrez une URL HTTPS valide vers un dépôt public (ex: https://github.com/owner/repo).",
      };
    default:
      return {
        icon: <HelpCircle size={18} />,
        title: 'Erreur inattendue',
        color: 'text-red-400',
        borderColor: 'border-red-500/20',
        bgColor: 'bg-red-500/5',
        suggestion: "Une erreur s'est produite. Réessayez ou vérifiez que le dépôt est accessible.",
      };
  }
}

export default function ErrorBanner({ error, onDismiss, onRetry }: ErrorBannerProps) {
  const config = getErrorConfig(error.code);

  return (
    <div
      role="alert"
      className={`max-w-3xl mx-auto mt-6 mx-4 sm:mx-auto sm:px-0 px-4`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border ${config.borderColor} ${config.bgColor} animate-fade-in-up`}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${config.color}`} aria-hidden="true">
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm mb-1 ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">{error.error}</p>
          {config.suggestion && (
            <p className="text-xs text-gray-500 mt-1.5">{config.suggestion}</p>
          )}

          {/* Actions */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all duration-150"
            >
              <RefreshCw size={12} />
              Réessayer
            </button>
          )}
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fermer l'erreur"
            className="flex-shrink-0 text-gray-600 hover:text-gray-400 transition-colors p-1 rounded"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
