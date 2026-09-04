'use client';

import { useState, useRef, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  defaultValue?: string;
}

export default function SearchBar({ onAnalyze, isLoading, defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onAnalyze(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Analyser un dépôt Git"
      className="relative flex items-center w-full"
    >
      {/* Search icon (left) */}
      <div
        aria-hidden="true"
        className="absolute left-4 z-10 pointer-events-none"
      >
        {isLoading ? (
          <Loader2 size={18} className="text-blue-400 animate-spin" />
        ) : (
          <Search size={18} className="text-gray-500" />
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id="repo-url-input"
        type="url"
        inputMode="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://github.com/owner/repository"
        required
        disabled={isLoading}
        aria-label="URL du dépôt Git public"
        aria-busy={isLoading}
        autoComplete="off"
        spellCheck={false}
        className="w-full h-14 pl-11 pr-[120px] rounded-2xl text-sm font-mono placeholder:font-sans placeholder:text-gray-600 bg-[#111] border border-[#333] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      />

      {/* Submit button — inside the input, on the right */}
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        aria-label="Lancer l'analyse"
        className="absolute right-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className="hidden sm:inline">Analyse…</span>
          </>
        ) : (
          'Analyser'
        )}
      </button>
    </form>
  );
}
