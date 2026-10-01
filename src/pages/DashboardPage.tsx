import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { GlassCard } from '../components/GlassCard';
import { CareerScore } from '../components/CareerScore';
import { SkillChip } from '../components/SkillChip';
import {
  Layers,
  Briefcase,
  Target,
  AlertTriangle,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  FolderGit2,
  MessageSquareCode,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Synchronizing Career Intelligence...</span>
        </div>
      </div>
    );
  }

  const latest = summary?.latestAnalysis;
  const stats = summary?.quickStats;
  const target = summary?.currentTargetRole;

  return (
    <div className="space-y-6">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-1">
            <Sparkles className="w-3 h-3" />
            <span>COMMAND CENTER ACTIVE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Career Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Welcome back, <strong className="text-slate-200">{user?.name || 'Candidate'}</strong>. Real-time fit assessment and closing path.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/resume')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Update Resume</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/job-analysis')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Analyze New Job</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: Career Readiness Score & Current Target Role */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Career Readiness Score Card */}
        <div className="lg:col-span-4">
          <GlassCard glow="cyan" className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Readiness Metric
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Live Recalculation</span>
            </div>

            <CareerScore
              score={summary?.readinessScore || 78}
              label="Job Ready Progress"
              sublabel="Profile-to-Job Alignment"
              size="lg"
              showBreakdown={true}
              breakdown={latest?.breakdown}
            />
          </GlassCard>
        </div>

        {/* Current Target Role & Summary Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard glow="emerald" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">
                  Current Target Role
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {target?.role || 'Full Stack Developer'}
                </h3>
                <p className="text-xs text-slate-400">
                  {target?.company || 'NextGen Scale Dynamics'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                  {target?.matchScore || 82}% Alignment
                </span>
              </div>
            </div>

            {/* Quick Gaps and Topics metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Missing Skills</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {target?.missingSkillsCount || 4} Critical
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Recommended Learning</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {target?.recommendedLearningCount || 6} Modules
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Roadmap Completion</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {stats?.roadmapProgress || 35}%
                </span>
              </div>
            </div>

            {/* Strengths Chips */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Your Verified Strengths ({latest?.matchedSkills?.length || 0})</span>
                <button
                  type="button"
                  onClick={() => navigate('/skill-gap')}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                >
                  <span>Detailed Gap Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latest?.matchedSkills?.slice(0, 8).map((sk) => (
                  <SkillChip key={sk} skill={sk} variant="strength" />
                ))}
              </div>
            </div>

            {/* Close These Gaps */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Priority Gaps To Close:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latest?.missingCriticalSkills?.map((sk) => (
                  <SkillChip key={sk} skill={sk} variant="critical" />
                ))}
                {latest?.missingPreferredSkills?.slice(0, 3).map((sk) => (
                  <SkillChip key={sk} skill={sk} variant="preferred" />
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Skills Detected', val: stats?.skillsDetected || 11, icon: Layers, color: 'text-indigo-400' },
              { label: 'Jobs Analyzed', val: stats?.jobsAnalyzed || 1, icon: Briefcase, color: 'text-cyan-400' },
              { label: 'Skills Matched', val: stats?.skillsMatched || 7, icon: Target, color: 'text-emerald-400' },
              { label: 'Skill Gaps', val: stats?.skillGaps || 7, icon: AlertTriangle, color: 'text-rose-400' },
              { label: 'Roadmap Progress', val: `${stats?.roadmapProgress || 35}%`, icon: Compass, color: 'text-teal-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-mono leading-tight">{stat.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-lg font-bold font-mono text-white">{stat.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOWER ROW: Next 30 Days Roadmap & Quick Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next 30 Days Roadmap Preview */}
        <div className="lg:col-span-7">
          <GlassCard glow="none">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Your Next 30-Day Learning Plan
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sequential curriculum targeting critical requirements
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/roadmap')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>Full Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {latest?.roadmap?.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate('/roadmap')}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    task.completed
                      ? 'border-emerald-500/20 bg-emerald-950/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        task.completed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-cyan-400'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : task.week}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {task.skill}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {task.miniProject}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {task.duration}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Recommended Action Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recommended Project Card */}
          <GlassCard glow="none" hoverEffect onClick={() => navigate('/projects')}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-semibold">
                    Recommended Project
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {latest?.recommendedProjects?.[0]?.title || 'Real-Time Job Application Tracker'}
                  </h4>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
              {latest?.recommendedProjects?.[0]?.description ||
                'Build a production-grade application uniting your strengths with target gaps.'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>Value: <strong className="text-emerald-400">Exceptional</strong></span>
              <span>•</span>
              <span>Duration: 10 - 14 Days</span>
            </div>
          </GlassCard>

          {/* Interview Readiness Card */}
          <GlassCard glow="none" hoverEffect onClick={() => navigate('/interview')}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-semibold">
                    Interview Readiness
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Mock Interview & Question Simulator
                  </h4>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Practice 5 tailored technical, project-based, behavioral, and HR questions derived from your background.
            </p>
            <div className="mt-3">
              <button
                type="button"
                className="w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
              >
                Start Mock Interview Simulation
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
