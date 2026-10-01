import React from 'react';
import { Clock, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import { SkillGapItem } from '../types';

interface SkillGapCardProps {
  item: SkillGapItem;
  onExploreLearning?: (skill: string) => void;
}

export const SkillGapCard: React.FC<SkillGapCardProps> = ({ item, onExploreLearning }) => {
  const isStrength = item.category === 'strength';
  const isCritical = item.category === 'critical';

  const badgeColor = isStrength
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : isCritical
    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    : 'border-amber-500/30 bg-amber-500/10 text-amber-300';

  const gapColor = {
    None: 'text-emerald-400',
    Low: 'text-cyan-400',
    Medium: 'text-amber-400',
    High: 'text-rose-400',
  }[item.gap];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
            {item.skill}
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {isStrength ? 'Strength' : isCritical ? 'Critical Gap' : 'Nice-to-Have'}
            </span>
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Importance</span>
          <span
            className={`text-xs font-semibold ${
              item.importance === 'High' ? 'text-rose-400' : item.importance === 'Medium' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            {item.importance}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs mb-3">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-mono">Current</span>
          <span className="font-medium text-slate-200">{item.currentLevel}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-mono">Required</span>
          <span className="font-medium text-slate-200">{item.requiredLevel}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-mono">Gap Delta</span>
          <span className={`font-semibold ${gapColor}`}>{item.gap}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {item.suggestedLearningDays > 0 ? (
              <>
                Estimated Learning: <strong className="text-slate-200">{item.suggestedLearningDays} Days</strong>
              </>
            ) : (
              <span className="text-emerald-400 font-medium">Already Acquired</span>
            )}
          </span>
        </div>

        {onExploreLearning && item.suggestedLearningDays > 0 && (
          <button
            type="button"
            onClick={() => onExploreLearning(item.skill)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <span>Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
