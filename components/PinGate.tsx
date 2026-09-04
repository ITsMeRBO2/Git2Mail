'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PinGate() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [banRemaining, setBanRemaining] = useState<number | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (banRemaining && banRemaining > 0) {
      const timer = setInterval(() => {
        setBanRemaining((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [banRemaining]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only keep last char
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newPin.every(p => p !== '')) {
      submitPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const submitPin = async (fullPin: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dash/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });
      const data = await res.json();
      
      if (res.ok) {
        router.refresh(); // Reload to hit server component and see DashboardStats
      } else {
        setError(data.error || 'Code incorrect');
        if (data.remainingSeconds) {
          setBanRemaining(data.remainingSeconds);
        }
        setPin(['', '', '', '']);
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111] border border-[#222] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Lock className="text-blue-400" size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Accès Sécurisé</h1>
          <p className="text-gray-400 text-sm text-center">
            Veuillez entrer le code PIN pour accéder au tableau de bord.
          </p>
        </div>

        {banRemaining ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center animate-fade-in-up">
            <ShieldAlert className="text-red-400 mx-auto mb-3" size={32} />
            <h3 className="text-red-400 font-semibold mb-2">Accès bloqué</h3>
            <p className="text-gray-300 text-sm mb-4">
              Trop de tentatives. Veuillez patienter avant de réessayer.
            </p>
            <div className="text-3xl font-mono text-white font-bold tracking-widest">
              {formatTime(banRemaining)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-mono font-bold bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center font-medium animate-shake">
                {error}
              </div>
            )}

            <button
              onClick={() => submitPin(pin.join(''))}
              disabled={isLoading || pin.some(p => p === '')}
              className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Déverrouiller
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
