import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RecommendedCertification } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkillChip } from '../components/SkillChip';
import { Award, ExternalLink, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const CertificationsPage: React.FC = () => {
  const [certifications, setCertifications] = useState<RecommendedCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCertifications().then((res) => {
      setCertifications(res.certifications);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (certId: string, newStatus: 'Interested' | 'In Progress' | 'Completed') => {
    // Optimistic update
    setCertifications((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, status: newStatus } : c))
    );
    try {
      await api.updateCertificationStatus(certId, newStatus);
    } catch (err) {
      console.error('Failed to update certification status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Loading certification tracks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono mb-1">
          <Award className="w-3 h-3" />
          <span>CREDENTIAL VALIDATION</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Targeted Industry Certifications
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Industry-recognized certifications calibrated to validate your skill gaps and strengthen recruiter credibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
        {certifications.map((cert) => (
          <GlassCard key={cert.id} glow="none" className="flex flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {cert.level}
                </span>
                <span className="text-xs text-slate-400">{cert.issuer}</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{cert.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {cert.relevance}
              </p>

              <div className="mb-4">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">
                  Skills Validated:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cert.skillsCovered.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Tracking Status:
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    cert.status === 'Completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : cert.status === 'In Progress'
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                  }`}
                >
                  {cert.status === 'Completed' ? '✓ Completed' : cert.status === 'In Progress' ? '● In Progress' : '○ Interested'}
                </span>
              </div>

              {/* Status Segmented Control */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(['Interested', 'In Progress', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(cert.id, st)}
                    className={`flex-1 h-8 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center border ${
                      cert.status === st
                        ? st === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : st === 'In Progress'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{st}</span>
                  </button>
                ))}
              </div>

              {cert.link && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Official Curriculum & Exam Info</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
