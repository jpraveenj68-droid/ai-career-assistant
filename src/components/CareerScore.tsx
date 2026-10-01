import React from 'react';
import { Target, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface CareerScoreProps {
  score: number;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  breakdown?: {
    technicalSkills: number;
    projects: number;
    experience: number;
    education: number;
    certifications: number;
    softSkills: number;
  };
}

export const CareerScore: React.FC<CareerScoreProps> = ({
  score = 0,
  label = 'Job Ready Progress',
  sublabel = 'Profile-to-Job Alignment',
  size = 'md',
  showBreakdown = false,
  breakdown,
}) => {
  const validScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const radius = size === 'lg' ? 70 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (val >= 65) return 'text-cyan-400 stroke-cyan-400';
    if (val >= 50) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getGradientId = () => `score-gradient-${size}-${validScore}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          className={`transform -rotate-90 ${
            size === 'lg' ? 'w-44 h-44' : size === 'md' ? 'w-32 h-32' : 'w-24 h-24'
          }`}
        >
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Background Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-black tracking-tight text-white font-mono ${
              size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {score}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Alignment
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <h4 className="font-semibold text-slate-200 text-sm flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          {label}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </div>

      {showBreakdown && breakdown && (
        <div className="w-full mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Weighted Score Breakdown
          </div>
          {[
            { name: 'Technical Skills (50%)', val: breakdown.technicalSkills, color: 'bg-cyan-500' },
            { name: 'Projects (15%)', val: breakdown.projects, color: 'bg-indigo-500' },
            { name: 'Experience (15%)', val: breakdown.experience, color: 'bg-emerald-500' },
            { name: 'Education (10%)', val: breakdown.education, color: 'bg-violet-500' },
            { name: 'Certifications (5%)', val: breakdown.certifications, color: 'bg-amber-500' },
            { name: 'Soft Skills (5%)', val: breakdown.softSkills, color: 'bg-pink-500' },
          ].map((item) => (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">{item.name}</span>
                <span className="font-mono text-slate-200 font-medium">{item.val}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                  style={{ width: `${item.val}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-slate-500 italic pt-1">
            * Score denotes alignment with job requirements based on parsed evidence, not a guarantee of employment.
          </p>
        </div>
      )}
    </div>
  );
};
