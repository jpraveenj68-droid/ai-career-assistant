import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RecommendedProject } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkillChip } from '../components/SkillChip';
import { FolderGit2, Star, Clock, Layers, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjectRecommendations().then((res) => {
      setProjects(res.projects);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Curating gap-closing portfolio projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono mb-1">
          <FolderGit2 className="w-3 h-3" />
          <span>PORTFOLIO ACCELERATION</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Recommended Portfolio Projects
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hand-picked project architectures engineered to close your critical skill gaps and provide tangible proof of competence.
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((proj, idx) => (
          <GlassCard key={proj.id} glow={idx === 0 ? 'cyan' : 'none'} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    PROJECT #{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      proj.difficulty === 'Advanced'
                        ? 'bg-rose-500/20 text-rose-300'
                        : proj.difficulty === 'Intermediate'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {proj.difficulty}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Portfolio Value: {proj.portfolioValue}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{proj.title}</h3>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duration: <strong className="text-slate-200">{proj.estimatedDuration}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {proj.description}
            </p>

            {/* Skills Developed */}
            <div className="mb-4">
              <span className="text-[11px] uppercase font-mono text-slate-400 block mb-2 font-semibold">
                Skills Proven & Developed:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {proj.skillsDeveloped.map((sk) => (
                  <SkillChip key={sk} skill={sk} variant="strength" />
                ))}
              </div>
            </div>

            {/* Key Features & Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 block mb-2">
                  Key Technical Features to Implement
                </span>
                <ul className="space-y-1.5">
                  {proj.keyFeatures?.map((f, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 block mb-2">
                  System Architecture Overview
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {proj.architectureOverview}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
