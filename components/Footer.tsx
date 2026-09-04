'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#080808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand with logo */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="GitLeak Finder"
                width={160}
                height={32}
                className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed">
              Outil d&apos;analyse des métadonnées Git. Exposé uniquement sur des
              dépôts publics, avec des données déjà accessibles à quiconque fait un{' '}
              <code className="text-gray-500">git clone</code>.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Comment ça marche', href: '#how-it-works' },
                { label: 'À propos', href: '#about' },
                { label: 'Documentation API', href: '/api/analyze' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Éthique &amp; Légal
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              GitLeak Finder n&apos;expose que des données présentes publiquement dans
              les métadonnées Git. Aucune donnée privée n&apos;est accédée ou stockée.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Utilisation abusive prohibée. Conçu à des fins pédagogiques.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#111] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-700">
            Réalisé par <span className="text-gray-500">Rahil Ibrahim</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
              aria-label="Code source sur GitHub"
            >
              <Github size={14} />
              <span>Code source</span>
              <ExternalLink size={10} />
            </a>
            <span className="text-gray-800 text-xs flex items-center gap-1">
              Fait avec <Heart size={10} className="text-red-900" /> pour la cybersécurité
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
