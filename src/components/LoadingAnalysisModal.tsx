import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckCircle, Search, Layers, Compass } from 'lucide-react';

interface LoadingAnalysisModalProps {
  isOpen: boolean;
}

const STEPS = [
  { label: 'Reading your profile…', icon: Search },
  { label: 'Extracting skills…', icon: Layers },
  { label: 'Understanding job requirements…', icon: Brain },
  { label: 'Comparing skills & semantic mapping…', icon: Sparkles },
  { label: 'Identifying gaps & level deltas…', icon: Layers },
  { label: 'Building your career roadmap…', icon: Compass },
];

export const LoadingAnalysisModal: React.FC<LoadingAnalysisModalProps> = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 md:p-8 shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)]">
        {/* Glow ambient */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Career Intelligence Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing resume alignment & synthesizing personalized roadmap
          </p>
        </div>

        {/* Dynamic Steps */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                    : isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-300'
                    : 'border-slate-800/60 bg-slate-900/30 text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 animate-spin'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className="text-xs font-medium flex-1">{step.label}</span>
                {isCurrent && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            Deterministic NLP & AI reasoning in progress...
          </p>
        </div>
      </div>
    </div>
  );
};
