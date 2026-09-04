'use client';

import { GitBranch, Mail, Activity } from 'lucide-react';

interface StatsBarProps {
  reposAnalyzed?: number;
  emailsFound?: number;
  commitsProcessed?: number;
}

const DEFAULT_STATS = {
  reposAnalyzed: 1847,
  emailsFound: 12394,
  commitsProcessed: 847200,
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString('fr-FR');
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-6 py-4 sm:py-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400">
        {icon}
      </div>
      <div className="text-center sm:text-left">
        <div className="text-2xl sm:text-3xl font-display font-black text-white leading-none">
          {value}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function StatsBar({
  reposAnalyzed = DEFAULT_STATS.reposAnalyzed,
  emailsFound = DEFAULT_STATS.emailsFound,
  commitsProcessed = DEFAULT_STATS.commitsProcessed,
}: StatsBarProps) {
  return (
    <div className="stats-bar py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:divide-x sm:divide-[#2a2a2a] gap-4 sm:gap-0">
          <StatItem
            icon={<GitBranch size={16} />}
            value={formatNumber(reposAnalyzed)}
            label="Dépôts analysés"
          />
          <StatItem
            icon={<Mail size={16} />}
            value={formatNumber(emailsFound)}
            label="Emails découverts"
          />
          <StatItem
            icon={<Activity size={16} />}
            value={formatNumber(commitsProcessed)}
            label="Commits traités"
          />
        </div>
      </div>
    </div>
  );
}
