import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobDescription } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkillChip } from '../components/SkillChip';
import { LoadingAnalysisModal } from '../components/LoadingAnalysisModal';
import {
  Briefcase,
  Upload,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  Cloud,
  FileText,
  Search,
} from 'lucide-react';

export const JobAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDescription | null>(null);
  const [sampleJobs, setSampleJobs] = useState<JobDescription[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [company, setCompany] = useState('NextGen Scale Dynamics');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'sample'>('sample');
  const [loading, setLoading] = useState(false);
  const [analyzingAlignment, setAnalyzingAlignment] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load sample jobs
    api.getJobs().then((res) => {
      setSampleJobs(res.jobs);
      if (res.jobs.length > 0 && !job) {
        setJob(res.jobs[0]);
      }
    }).catch(() => {});
  }, []);

  const handleSelectSampleJob = (selected: JobDescription) => {
    setJob(selected);
    setNotification({ type: 'success', message: `Loaded sample job: ${selected.title}` });
  };

  const handleParsePasted = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setNotification(null);
    try {
      const res = await api.analyzeJob({
        text: pasteText,
        title: jobTitle,
        company,
      });
      setJob(res.job);
      setNotification({ type: 'success', message: 'Job requirements extracted successfully!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to analyze job description' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setNotification(null);
    try {
      const res = await api.analyzeJob({
        file,
        title: jobTitle,
        company,
      });
      setJob(res.job);
      setNotification({ type: 'success', message: 'Job requirements extracted from file!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to extract job description' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullAlignment = async () => {
    if (!job) return;
    setAnalyzingAlignment(true);
    try {
      await api.runAnalysis({ job });
      // Short delay to let user see "Building your career roadmap..."
      setTimeout(() => {
        setAnalyzingAlignment(false);
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setAnalyzingAlignment(false);
      setNotification({ type: 'error', message: err.message || 'Alignment analysis failed' });
    }
  };

  return (
    <div className="space-y-6">
      <LoadingAnalysisModal isOpen={analyzingAlignment || loading} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            Job Description Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze target job descriptions, extract required vs preferred skills, and compute alignment fit.
          </p>
        </div>

        {job && (
          <button
            type="button"
            onClick={handleRunFullAlignment}
            disabled={analyzingAlignment}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Compute Match & Build Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Selector Tabs */}
      <GlassCard glow="none">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sample'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preloaded Sample Jobs (1-Click)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'paste'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Option A: Paste Job Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Option B: Upload File or Screenshot (PDF, TXT, PNG, JPG)
          </button>
        </div>

        {activeTab === 'sample' && (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 block mb-2">
              Select a benchmark industry job specification:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleJobs.map((sj) => (
                <div
                  key={sj.id}
                  onClick={() => handleSelectSampleJob(sj)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    job?.id === sj.id
                      ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-white">{sj.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {sj.company || 'Tech Leader'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {sj.rawText}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sj.requiredSkills?.slice(0, 4).map((sk) => (
                      <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Job Role Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. NextGen Scale Dynamics"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste job description text here including requirements, responsibilities, and qualifications..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
            />

            <button
              type="button"
              onClick={handleParsePasted}
              disabled={!pasteText.trim() || loading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
            >
              Extract Requirements
            </button>
          </div>
        )}

        {activeTab === 'upload' && (
          <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40">
            <Upload className="w-10 h-10 text-cyan-400 mb-3 animate-bounce" />
            <span className="text-sm font-semibold text-slate-200">
              Upload Job Description Document or Screenshot
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Supports Screenshots (PNG, JPG, WEBP), TXT, and PDF (Max 10MB)
            </span>
            <input
              type="file"
              accept=".txt,.pdf,.png,.jpg,.jpeg,.webp,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </GlassCard>

      {/* Extracted Job Requirements Presentation */}
      {job && (
        <div className="space-y-6">
          <GlassCard glow="cyan">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Extracted Job Specification
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{job.title}</h3>
                <p className="text-xs text-slate-400">{job.company || 'Target Organization'}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  Exp: <strong className="text-slate-200">{job.experienceRequired}</strong>
                </span>
              </div>
            </div>

            {/* Required vs Preferred Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20">
                <div className="text-xs font-bold text-rose-400 mb-2 flex items-center justify-between">
                  <span>Required Skills ({job.requiredSkills?.length || 0})</span>
                  <span className="text-[10px] font-mono uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                    Mandatory
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills?.map((sk) => (
                    <SkillChip key={sk} skill={sk} variant="critical" />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20">
                <div className="text-xs font-bold text-amber-400 mb-2 flex items-center justify-between">
                  <span>Preferred / Nice-to-Have ({job.preferredSkills?.length || 0})</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Bonus
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferredSkills?.map((sk) => (
                    <SkillChip key={sk} skill={sk} variant="preferred" />
                  ))}
                  {(!job.preferredSkills || job.preferredSkills.length === 0) && (
                    <span className="text-xs text-slate-500 italic">None specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Key Responsibilities:
              </h4>
              <ul className="space-y-1.5">
                {job.responsibilities?.map((resp, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Action Trigger Banner */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Ready to evaluate your profile alignment?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Computes TF-IDF similarity, maps canonical aliases, detects gaps, and generates your 6-week curriculum.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunFullAlignment}
              disabled={analyzingAlignment}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Fit Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
