'use client';

import React, { useState } from 'react';

export default function HowItWorks() {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    const code = `$ git clone --depth=100 <url>\n$ git log --format='%ae|%an'`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="relative py-24 px-4 overflow-hidden bg-[#07090e]">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-32">
        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: MÉTHODOLOGIE & COMMENT ÇA MARCHE
           ════════════════════════════════════════════════════════════════════ */}
        <div>
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              MÉTHODOLOGIE
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
              Comment ça marche ?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              De la soumission de l&apos;URL à l&apos;affichage des résultats, découvrez notre processus d&apos;extraction transparente.
            </p>
          </div>

          {/* Timeline Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/40 to-emerald-500/20 -translate-y-12 z-0" />

            {/* ── STEP 1 ── */}
            <div className="group relative z-10 flex flex-col justify-between rounded-3xl bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/80 hover:border-blue-500/50 p-8 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    ÉTAPE 01
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-mono group-hover:scale-110 transition-transform">
                    🌐
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Collez une URL
                </h3>
                <p className="text-blue-400 text-sm font-semibold mb-4">
                  Entrez l&apos;URL de n&apos;importe quel dépôt Git public
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Compatible avec GitHub, GitLab, Bitbucket, Codeberg, ou tout hébergeur git public. Le dépôt doit être accessible sans authentification.
                </p>
              </div>

              {/* Badges preview */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                {['GitHub', 'GitLab', 'Bitbucket', 'Codeberg'].map((provider) => (
                  <div key={provider} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {provider}
                  </div>
                ))}
              </div>
            </div>

            {/* ── STEP 2 ── */}
            <div className="group relative z-10 flex flex-col justify-between rounded-3xl bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/80 hover:border-indigo-500/50 p-8 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    ÉTAPE 02
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-mono group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Analyse des commits
                </h3>
                <p className="text-indigo-400 text-sm font-semibold mb-4">
                  Extraction des métadonnées via l&apos;API ou Git
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Nous utilisons l&apos;API officielle pour GitHub/GitLab. Pour les autres, un clone superficiel est effectué puis nettoyé.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl bg-[#080d1a] border border-indigo-900/40 p-4 font-mono text-xs overflow-hidden shadow-inner">
                <div className="flex items-center justify-between text-slate-500 border-b border-indigo-900/30 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-[10px] text-indigo-300/60 font-semibold">terminal</span>
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="text-[10px] hover:text-white transition-colors bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                  >
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="text-cyan-400">$ git clone --depth=100 &lt;url&gt;</div>
                  <div className="text-purple-300">$ git log --format=&apos;%ae|%an&apos;</div>
                  <div className="text-emerald-400 pt-1 text-[11px] opacity-90">johndoe@example.com|John Doe</div>
                  <div className="text-emerald-400 text-[11px] opacity-90">noreply@github.com|Jane Smith</div>
                </div>
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className="group relative z-10 flex flex-col justify-between rounded-3xl bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800/80 hover:border-emerald-500/50 p-8 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ÉTAPE 03
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-mono group-hover:scale-110 transition-transform">
                    📊
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Résultats affichés
                </h3>
                <p className="text-emerald-400 text-sm font-semibold mb-4">
                  Emails, noms, et périodes d&apos;activité
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Les mêmes informations que &apos;git log&apos; révèle localement, formatées et triées pour une lecture aisée.
                </p>
              </div>

              {/* Visual Result Preview Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                      JD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">John Doe</div>
                      <div className="text-[10px] text-slate-400 font-mono">johndoe@example.com</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    42 commits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2: CADRE ÉTHIQUE & TRANSPARENCE
           ════════════════════════════════════════════════════════════════════ */}
        <div id="about" className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              🛡️ Cadre Éthique
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Éthique &amp; Transparence
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              GitLeak Finder n&apos;est pas un outil de surveillance. C&apos;est un miroir qui reflète ce que n&apos;importe qui peut déjà voir.
            </p>
          </div>

          {/* 2-Column Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Column 1: Ce que nous faisons */}
            <div className="relative rounded-3xl bg-[#0b1612]/80 backdrop-blur-2xl border border-emerald-500/30 p-8 shadow-2xl hover:border-emerald-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                    ✅
                  </div>
                  <h3 className="font-display text-xl font-bold text-emerald-400">
                    Ce que nous faisons
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400/70 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  AUTORISÉ
                </span>
              </div>

              <ul className="space-y-4">
                {[
                  'Lire les métadonnées de commits publics',
                  'Utiliser les APIs officielles GitHub & GitLab',
                  'Afficher uniquement ce qu\'un git clone révélerait',
                  'Nettoyer immédiatement les fichiers temporaires',
                  'Sensibiliser aux risques OSINT liés à Git',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 group">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 text-xs font-bold group-hover:scale-110 transition-transform">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Ce que nous ne faisons pas */}
            <div className="relative rounded-3xl bg-[#1a0f12]/80 backdrop-blur-2xl border border-rose-500/30 p-8 shadow-2xl hover:border-rose-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-lg">
                    ❌
                  </div>
                  <h3 className="font-display text-xl font-bold text-rose-400">
                    Ce que nous ne faisons pas
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400/70 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  INTERDIT
                </span>
              </div>

              <ul className="space-y-4">
                {[
                  'Accéder à des dépôts privés',
                  'Stocker définitivement les emails analysés',
                  'Croiser avec d\'autres bases de données',
                  'Contourner les paramètres de confidentialité',
                  'Permettre le scraping massif ou l\'abus',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 group">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400 text-xs font-bold group-hover:scale-110 transition-transform">
                      ✗
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Security Advisory: Noreply Note */}
          <div className="rounded-3xl bg-amber-950/20 backdrop-blur-xl border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 text-xl font-bold">
              ℹ️
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="font-display text-lg font-bold text-amber-400">
                  Note sur les emails GitHub noreply
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CONSEIL OSINT
                </span>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Si un développeur active l&apos;option &quot;Keep my email addresses private&quot; sur GitHub et committe via l&apos;interface web, son email apparaît sous la forme{' '}
                <code className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
                  id+username@users.noreply.github.com
                </code>
                . Cependant, si les commits sont poussés via{' '}
                <code className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
                  git push
                </code>{' '}
                en CLI avec un email réel configuré localement, cet email réel est visible.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
