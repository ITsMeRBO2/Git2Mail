'use client';

import { Link2, GitBranch, Search, Mail, Eye, Terminal as TerminalIcon } from 'lucide-react';
import React from 'react';

const steps = [
  {
    number: '01',
    icon: <Link2 size={24} className="text-blue-400" />,
    title: 'Collez une URL',
    description: "Entrez l'URL de n'importe quel dépôt Git public",
    detail: "Compatible avec GitHub, GitLab, Bitbucket, Codeberg, ou tout hébergeur git public. Le dépôt doit être accessible sans authentification.",
    align: 'left'
  },
  {
    number: '02',
    icon: <GitBranch size={24} className="text-blue-400" />,
    title: 'Analyse des commits',
    description: "Extraction des métadonnées via l'API ou Git",
    detail: "Nous utilisons l'API officielle pour GitHub/GitLab. Pour les autres, un clone superficiel est effectué puis nettoyé.",
    terminal: "$ git clone --depth=100 <url>\n$ git log --format='%ae|%an'",
    align: 'right'
  },
  {
    number: '03',
    icon: <Mail size={24} className="text-blue-400" />,
    title: 'Résultats affichés',
    description: "Emails, noms, et périodes d'activité",
    detail: "Les mêmes informations que 'git log' révèle localement, formatées et triées pour une lecture aisée.",
    align: 'left'
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 overflow-hidden bg-[#0d0d0d] border-y border-[#1a1a1a]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            MÉTHODOLOGIE
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            De la soumission de l'URL à l'affichage des résultats, découvrez notre processus d'extraction transparente.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mb-24">
          {/* Vertical line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent -translate-x-1/2 border-l border-dashed border-blue-500/30"></div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => (
              <div key={step.number} className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 ${step.align === 'right' ? 'md:flex-row-reverse' : ''}`}>

                {/* Content Side */}
                <div className={`w-full md:w-1/2 flex flex-col ${step.align === 'right' ? 'md:items-start' : 'md:items-end text-left md:text-right'}`}>
                  <div className="relative p-8 rounded-2xl bg-[#111111]/80 backdrop-blur-md border border-[#222] hover:border-blue-500/30 transition-all w-full max-w-md">
                    <div className="absolute -top-6 -right-4 font-display text-8xl font-black text-white/[0.02] select-none pointer-events-none">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-white text-xl mb-2 relative z-10">{step.title}</h3>
                    <p className="text-blue-400 font-medium text-sm mb-4 relative z-10">{step.description}</p>
                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">{step.detail}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="hidden md:flex relative w-16 h-16 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10">
                  {step.icon}
                </div>

                {/* Illustration Side */}
                <div className="w-full md:w-1/2 flex justify-center">
                  {step.terminal ? (
                    <div className="w-full max-w-sm rounded-xl overflow-hidden bg-[#050505] border border-[#333] shadow-lg">
                      <div className="flex items-center px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="mx-auto flex items-center gap-2 text-xs text-gray-500 font-mono">
                          <TerminalIcon size={12} /> bash
                        </div>
                      </div>
                      <div className="p-4 font-mono text-xs md:text-sm text-green-400 leading-relaxed overflow-x-auto">
                        {step.terminal.split('\n').map((line, idx) => (
                          <div key={idx} className="whitespace-pre">{line}</div>
                        ))}
                        <div className="text-gray-300 mt-2 opacity-80">
                          johndoe@example.com|John Doe<br />
                          noreply@github.com|Jane Smith
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full animate-pulse-slow border border-blue-500/20"></div>
                      {React.cloneElement(step.icon as React.ReactElement, { size: 64, className: "text-blue-500/40" })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical framework — redesigned */}
        <div id="about" className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              Éthique &amp; Transparence
            </div>
            <h2 className="font-display text-3xl font-black text-white mb-3">Cadre éthique</h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              GitLeak Finder n&apos;est pas un outil de surveillance. C&apos;est un miroir qui reflète ce que n&apos;importe qui peut déjà voir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* What we DO */}
            <div className="relative rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6 overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl opacity-10 select-none pointer-events-none font-black">✓</div>
              <h3 className="text-emerald-400 font-bold text-base mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✅</span>
                Ce que nous faisons
              </h3>
              <ul className="space-y-3">
                {[
                  'Lire les métadonnées de commits publics',
                  'Utiliser les APIs officielles GitHub & GitLab',
                  'Afficher uniquement ce qu\'un git clone révélerait',
                  'Nettoyer immédiatement les fichiers temporaires',
                  'Sensibiliser aux risques OSINT liés à Git',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-[10px] text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What we DON'T do */}
            <div className="relative rounded-2xl bg-red-500/5 border border-red-500/20 p-6 overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl opacity-10 select-none pointer-events-none font-black">✗</div>
              <h3 className="text-red-400 font-bold text-base mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-sm">❌</span>
                Ce que nous ne faisons pas
              </h3>
              <ul className="space-y-3">
                {[
                  'Accéder à des dépôts privés',
                  'Stocker définitivement les emails analysés',
                  'Croiser avec d\'autres bases de données',
                  'Contourner les paramètres de confidentialité',
                  'Permettre le scraping massif ou l\'abus',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-[10px] text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Noreply note */}
          <div className="rounded-2xl bg-[#111] border border-amber-500/20 p-5 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">ℹ</div>
            <div>
              <p className="text-amber-400 font-semibold text-sm mb-1.5">Note sur les emails GitHub noreply</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Si un développeur active l&apos;option &quot;Keep my email addresses private&quot; sur GitHub et committe via
                l&apos;interface web, son email apparaît sous la forme{' '}
                <code className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">id+username@users.noreply.github.com</code>.
                Cependant, si les commits sont poussés via{' '}
                <code className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">git push</code> en CLI
                avec un email réel configuré localement, cet email réel est visible.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
