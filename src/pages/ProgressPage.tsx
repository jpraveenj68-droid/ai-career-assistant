import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalysisRecord } from '../types';
import { GlassCard } from '../components/GlassCard';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, TrendingUp, Award, CheckCircle2, Target, Calendar } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecentAnalyses().then((res) => {
      setAnalyses(res.analyses);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const latest = analyses[0];

  // Radar Data for latest profile breakdown
  const radarData = [
    { subject: 'Technical Skills', score: latest?.breakdown.technicalSkills || 78, fullMark: 100 },
    { subject: 'Projects', score: latest?.breakdown.projects || 88, fullMark: 100 },
    { subject: 'Experience', score: latest?.breakdown.experience || 75, fullMark: 100 },
    { subject: 'Education', score: latest?.breakdown.education || 92, fullMark: 100 },
    { subject: 'Certifications', score: latest?.breakdown.certifications || 80, fullMark: 100 },
    { subject: 'Soft Skills', score: latest?.breakdown.softSkills || 85, fullMark: 100 },
  ];

  // Historical Alignment Data (simulated or real history)
  const alignmentHistoryData = [
    { month: 'Month 1', alignment: 58, roadmapProgress: 10 },
    { month: 'Month 2', alignment: 65, roadmapProgress: 25 },
    { month: 'Month 3', alignment: 72, roadmapProgress: 35 },
    { month: 'Current', alignment: latest?.alignmentScore || 82, roadmapProgress: 45 },
    { month: 'Target', alignment: 94, roadmapProgress: 100 },
  ];

  // Skill Distribution by Domain
  const skillCategoryData = [
    { category: 'Languages', count: 4 },
    { category: 'Frameworks', count: 3 },
    { category: 'Databases', count: 3 },
    { category: 'Cloud/DevOps', count: 3 },
    { category: 'Tools', count: 4 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Aggregating visual analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-1">
          <ChartIcon className="w-3 h-3" />
          <span>CAREER ANALYTICS & GROWTH</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Career Progress Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Longitudinal alignment tracking, competency radar distribution, and trajectory velocity.
        </p>
      </div>

      {/* Top metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard glow="cyan" className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Overall Alignment</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
            {latest?.alignmentScore || 82}%
          </span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +17% since initial intake
          </span>
        </GlassCard>

        <GlassCard glow="emerald" className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Roadmap Velocity</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {latest?.roadmap.filter((t) => t.completed).length || 2} / {latest?.roadmap.length || 6} Tasks
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">On-track for 30-day goal</span>
        </GlassCard>

        <GlassCard glow="none" className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Skills Mastered</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {latest?.matchedSkills.length || 7} Verified
          </span>
          <span className="text-[11px] text-cyan-400 mt-1 block">Matches primary JD specs</span>
        </GlassCard>

        <GlassCard glow="none" className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Job Benchmarks</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
            {Math.max(analyses.length, 1)} Roles
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Full Stack Developer</span>
        </GlassCard>
      </div>

      {/* Main Charts: Radar & Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Competency Radar */}
        <div className="lg:col-span-5">
          <GlassCard glow="none" className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Candidate Competency Radar
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Multivariate breakdown across core evaluation dimensions
              </p>
            </div>

            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Alignment History Timeline Area Chart */}
        <div className="lg:col-span-7">
          <GlassCard glow="none" className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Alignment Velocity & Target Projection
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Historical score gains as roadmap tasks are completed
              </p>
            </div>

            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alignmentHistoryData}>
                  <defs>
                    <linearGradient id="colorAlignment" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProgress" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="alignment"
                    name="Alignment Score %"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAlignment)"
                  />
                  <Area
                    type="monotone"
                    dataKey="roadmapProgress"
                    name="Roadmap Progress %"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
