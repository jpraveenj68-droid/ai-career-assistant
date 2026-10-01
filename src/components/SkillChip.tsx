import React from 'react';
import { Check, AlertTriangle, Star, Plus } from 'lucide-react';

interface SkillChipProps {
  skill: string;
  variant?: 'strength' | 'critical' | 'preferred' | 'neutral';
  level?: string;
  onRemove?: () => void;
  onClick?: () => void;
  interactive?: boolean;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  skill,
  variant = 'neutral',
  level,
  onRemove,
  onClick,
  interactive = false,
}) => {
  const styles = {
    strength: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
    critical: 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20',
    preferred: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800',
  }[variant];

  const icons = {
    strength: <Check className="w-3.5 h-3.5 text-emerald-400" />,
    critical: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    preferred: <Star className="w-3.5 h-3.5 text-amber-400" />,
    neutral: null,
  }[variant];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${styles} ${
        interactive ? 'cursor-pointer' : ''
      }`}
    >
      {icons}
      <span>{skill}</span>
      {level && (
        <span className="text-[10px] opacity-75 font-mono px-1 py-0.2 bg-black/30 rounded">
          {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-white"
        >
          ×
        </button>
      )}
    </span>
  );
};
