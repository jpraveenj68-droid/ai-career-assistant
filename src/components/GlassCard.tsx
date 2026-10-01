import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'emerald' | 'violet' | 'none';
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverEffect = false,
  onClick,
}) => {
  const glowClass = {
    cyan: 'shadow-[0_0_30px_-5px_rgba(6,182,212,0.18)] border-cyan-500/30',
    emerald: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.18)] border-emerald-500/30',
    violet: 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.18)] border-violet-500/30',
    none: 'border-slate-800/80',
  }[glow];

  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:-translate-y-0.5'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border p-5 md:p-6 text-slate-100 ${glowClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
