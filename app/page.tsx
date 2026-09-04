'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ResultsList from '@/components/ResultsList';
import LoadingState from '@/components/LoadingState';
import ErrorBanner from '@/components/ErrorBanner';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import type { AnalyzeResponse, AnalyzeErrorResponse } from '@/types';

type AppState =
  | { status: 'idle' }
  | { status: 'loading'; repoUrl: string }
  | { status: 'success'; result: AnalyzeResponse }
  | { status: 'error'; error: AnalyzeErrorResponse; repoUrl: string };

export default function HomePage() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = useCallback(async (repoUrl: string) => {
    setState({ status: 'loading', repoUrl });

    // Scroll to results area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = (await response.json()) as AnalyzeResponse | AnalyzeErrorResponse;

      if (data.success) {
        setState({ status: 'success', result: data });
      } else {
        setState({ status: 'error', error: data, repoUrl });
      }
    } catch (err) {
      const networkError: AnalyzeErrorResponse = {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erreur réseau — vérifiez votre connexion et réessayez.',
        code: 'UNKNOWN_ERROR',
      };
      setState({ status: 'error', error: networkError, repoUrl });
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (state.status === 'error') {
      handleAnalyze(state.repoUrl);
    }
  }, [state, handleAnalyze]);

  const handleDismissError = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const isLoading = state.status === 'loading';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1" id="main-content">
        {/* ── Hero + Search ── */}
        <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* ── Stats Bar ── */}
        <StatsBar />

        {/* ── Results area ── */}
        <div ref={resultsRef} className="min-h-[200px]">
          {state.status === 'loading' && (
            <LoadingState repoUrl={state.repoUrl} />
          )}

          {state.status === 'error' && (
            <ErrorBanner
              error={state.error}
              onDismiss={handleDismissError}
              onRetry={handleRetry}
            />
          )}

          {state.status === 'success' && (
            <ResultsList result={state.result} />
          )}

          {state.status === 'idle' && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">🔐</div>
              <p className="text-gray-600 text-sm max-w-md mx-auto px-4">
                Entrez l&apos;URL d&apos;un dépôt Git public ci-dessus pour commencer l&apos;analyse.
              </p>
            </div>
          )}
        </div>

        {/* ── How It Works ── */}
        <div className="border-t border-[#1a1a1a] mt-8">
          <HowItWorks />
        </div>
      </main>

      <Footer />
    </div>
  );
}
