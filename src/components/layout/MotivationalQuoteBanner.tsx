'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote, X, Heart } from 'lucide-react';
import { MotivationalQuote, getRandomQuote, getDailyQuote } from '@/lib/motivational-quotes';

export const MotivationalQuoteBanner: React.FC = () => {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Pick a daily quote on app startup
    setQuote(getDailyQuote());
  }, []);

  const handleNextQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRotating(false);
    }, 200);
  };

  if (isDismissed || !quote) return null;

  const isBTS = quote.category === 'BTS';
  const isVirat = quote.category === 'VIRAT_KOHLI';

  return (
    <div className="relative mb-5 p-4 rounded-2xl border transition-all shadow-md bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90 border-slate-800/80">
      {/* Subtle background glow */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-10 pointer-events-none blur-xl ${
          isBTS
            ? 'bg-purple-500'
            : isVirat
            ? 'bg-amber-500'
            : 'bg-indigo-500'
        }`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
              isBTS
                ? 'bg-purple-950/60 text-purple-400 border border-purple-800/50'
                : isVirat
                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/50'
            }`}
          >
            <Quote size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Daily Motivation</span>
              </span>

              {isBTS && (
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  💜 BTS Inspiration
                </span>
              )}

              {isVirat && (
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  🏏 Virat Kohli Mindset
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-100 italic leading-relaxed">
              &ldquo;{quote.quote}&rdquo;
            </p>

            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="font-semibold text-white">{quote.author}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px]">{quote.role}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleNextQuote}
            className={`p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer ${
              isRotating ? 'rotate-180 duration-200' : ''
            }`}
            title="Next inspirational quote"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss quote banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
