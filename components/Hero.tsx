'use client';

import { useState } from 'react';
import SearchBar from './SearchBar';
import type { ApiResponse } from '@/types';

interface HeroProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function Hero({ onAnalyze, isLoading }: HeroProps) {
  return (
    <section className="hero-bg relative min-h-[520px] flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
      {/* Decorative glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-32 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #1e3a8a 0%, transparent 70%)' }}
      />


      {/* Main title */}
      <h1 className="animate-fade-in-up-delay-1 font-display hero-title text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-[1.05]">
        <span className="text-white">Is your email </span>
        <br className="hidden sm:block" />
        <span className="text-gradient">exposed in your commits?</span>
      </h1>

      {/* Sub-headline */}
      <p className="animate-fade-in-up-delay-2 text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        Collez l&apos;URL d&apos;un dépôt Git public et découvrez instantanément les adresses email
        présentes dans les métadonnées de commits —{' '}
        <span className="text-gray-300">exactement comme{' '}</span>
        <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm font-mono">
          git log
        </code>
        .
      </p>

      {/* Search bar */}
      <div className="animate-fade-in-up-delay-3 w-full max-w-2xl">
        <SearchBar onAnalyze={onAnalyze} isLoading={isLoading} />
        <p className="mt-3 text-xs text-gray-600">
          En utilisant ce service, vous acceptez nos{' '}
          <a href="#how-it-works" className="text-gray-500 hover:text-gray-400 underline underline-offset-2 transition-colors">
            conditions d&apos;utilisation
          </a>
          {' '}— Fonctionne uniquement sur des dépôts publics.
        </p>
      </div>

      {/* Example repos */}
      <div className="animate-fade-in-up-delay-3 mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-gray-600 mr-1 self-center">Essayez :</span>
        {[
          { label: 'facebook/react', url: 'https://github.com/facebook/react' },
          { label: 'vuejs/vue', url: 'https://github.com/vuejs/vue' },
          { label: 'axios/axios', url: 'https://github.com/axios/axios' },
        ].map(({ label, url }) => (
          <button
            key={label}
            type="button"
            onClick={() => onAnalyze(url)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-md border border-[#2a2a2a] text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all duration-150 disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
