import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AnalysisRecord, SkillGapItem } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkillGapCard } from '../components/SkillGapCard';
import { SkillChip } from '../components/SkillChip';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Star,
  Compass,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'nice-to-have' | 'strength'>('all');

  useEffect(() => {
    api.getDashboardSummary().then((summary) => {
      setAnalysis(summary.latestAnalysis);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Loading skill gap matrix...</div>
      </div>
    );
  }

  const gaps = analysis?.skillGaps || [];
  const strengths = gaps.filter((g) => g.category === 'strength');
  const critical = gaps.filter((g) => g.category === 'critical');
  const preferred = gaps.filter((g) => g.category === 'nice-to-have');

  const filteredGaps = gaps.filter((g) => {
    if (activeFilter === 'all') return true;
    return g.category === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono mb-1">
            <AlertCircle className="w-3 h-3" />
            <span>SKILL-GAP MATRIX</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Skill Gap & Readiness Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Benchmarked against <strong className="text-slate-200">{analysis?.targetRole || 'Full Stack Developer'}</strong> requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Launch Personalized Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard glow="emerald">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Verified Strengths
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mb-2">
            {strengths.length}
          </div>
          <p className="text-xs text-slate-400">
            Skills meeting or exceeding the target job requirement levels.
          </p>
        </GlassCard>

        <GlassCard glow="none" className="border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
              Critical Gaps
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-300 mb-2">
            {critical.length}
          </div>
          <p className="text-xs text-slate-400">
            Mandatory technologies required for primary job duties.
          </p>
        </GlassCard>

        <GlassCard glow="none" className="border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Nice-to-Have Gaps
            </span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mb-2">
            {preferred.length}
          </div>
          <p className="text-xs text-slate-400">
            Differentiator skills that elevate candidates into top percentiles.
          </p>
        </GlassCard>
      </div>

      {/* Partial / Sibling Skills Mapping banner */}
      {analysis?.partialSkills && analysis.partialSkills.length > 0 && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Semantic & Adjacent Skill Bridges Detected
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.partialSkills.map((bridge, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-200 mb-1">
                  <span className="text-emerald-400">{bridge.resumeSkill}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 font-bold">{bridge.jobSkill}</span>
                </div>
                <p className="text-[11px] text-slate-400">{bridge.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Skills ({gaps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeFilter === 'critical' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Critical Gaps ({critical.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('nice-to-have')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeFilter === 'nice-to-have' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nice-to-Have ({preferred.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('strength')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeFilter === 'strength' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Strengths ({strengths.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredGaps.length} skills
        </span>
      </div>

      {/* Skill Gap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGaps.map((item) => (
          <SkillGapCard
            key={item.id}
            item={item}
            onExploreLearning={(sk) => navigate('/roadmap')}
          />
        ))}
      </div>
    </div>
  );
};
