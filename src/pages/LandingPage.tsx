import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  Target,
  Compass,
  CheckCircle2,
  FileText,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ChevronDown,
  Code2,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleTryDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  const handleStartAnalysis = () => {
    navigate('/resume');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Top Banner Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-bold">
            CA
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">
              Mike Career Assistant
            </span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
              Career Intelligence Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTryDemo}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition-all"
          >
            Try Demo
          </button>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Know Your Fit. Close Your Skill Gaps. Build Your Career.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Turn your resume into a{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            personalized career roadmap.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste a job description, discover your skill gaps, and get a practical roadmap to become job-ready.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Analyze My Career</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleTryDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try 1-Click Demo</span>
          </button>
        </div>

        {/* HERO VISUAL PIPELINE */}
        <div className="mt-16 relative">
          <div className="p-1 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-slate-800 to-transparent">
            <div className="rounded-[22px] bg-slate-950/80 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 flex items-center justify-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Interactive Career Intelligence Pipeline</span>
              </div>

              {/* Pipeline nodes */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { step: '01', title: 'Resume', desc: 'PDF, DOCX, Text extraction', icon: FileText, color: 'text-indigo-400' },
                  { step: '02', title: 'AI Analysis', desc: 'TF-IDF & NLP parser', icon: Brain, color: 'text-cyan-400' },
                  { step: '03', title: 'Skill Match', desc: 'Exact & semantic aliases', icon: Target, color: 'text-teal-400' },
                  { step: '04', title: 'Skill Gap', desc: 'Critical & nice-to-have', icon: Layers, color: 'text-amber-400' },
                  { step: '05', title: 'Roadmap', desc: 'Week-by-week actions', icon: Compass, color: 'text-violet-400' },
                  { step: '06', title: 'Job Ready', desc: 'Alignment score & prep', icon: CheckCircle2, color: 'text-emerald-400' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 text-left transition-all hover:border-cyan-500/40 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-400">{item.step}</span>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            From Raw Application to Target Job Placement
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Most portals simply show job openings. Mike Career Assistant gives you the systematic path to qualify for them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glow="cyan">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Intelligent Ingestion</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Upload your resume in PDF, DOCX, or text format. The system extracts technical languages, frameworks, cloud tooling, projects, and soft skills into an editable profile.
            </p>
          </GlassCard>

          <GlassCard glow="emerald">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Dual NLP & AI Matching</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Matches your profile against the job description using TF-IDF cosine similarity, normalized skill taxonomy, and alias detection (e.g. Postgres to PostgreSQL, JS to JavaScript).
            </p>
          </GlassCard>

          <GlassCard glow="violet">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Actionable Roadmaps</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Receives a weekly tailored learning schedule, hands-on portfolio projects to close the exact missing skills, industry certifications, and role-tailored mock interview prep.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Engine Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for Real-World Career Acceleration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Skill Gap Breakdown',
              desc: 'Categorizes missing requirements into Critical vs Nice-to-Have with estimated learning days.',
              icon: Layers,
            },
            {
              title: 'Targeted Projects',
              desc: 'Curates portfolio projects engineered to bridge your specific missing technologies.',
              icon: Code2,
            },
            {
              title: 'Interview Simulator',
              desc: 'Generates technical, project-based, behavioral, and HR questions with suggested talking points.',
              icon: Brain,
            },
            {
              title: 'Progress Tracking',
              desc: 'Interactive progress rings and charts that recalculate career readiness in real time.',
              icon: TrendingUp,
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-1">Everything you need to know about the engine</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How is the Profile-to-Job Alignment score calculated?',
              a: 'The engine uses a transparent weighted model: Technical Skills (50%), Projects (15%), Experience (15%), Education (10%), Certifications (5%), and Soft Skills (5%). It indicates alignment with stated requirements rather than a guaranteed hiring probability.',
            },
            {
              q: 'Does it work if Gemini API is offline or unconfigured?',
              a: 'Yes. The application contains a built-in deterministic NLP engine utilizing TF-IDF tokenization, cosine similarity, and a 500+ skill alias catalog so it remains 100% operational under all circumstances.',
            },
            {
              q: 'Can I edit the skills extracted from my resume?',
              a: 'Absolutely. The resume analyzer provides an editable interface where you can review, add, modify, or remove any extracted languages, frameworks, or projects before launching an analysis.',
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>Mike Career Assistant • “Know Your Fit. Close Your Skill Gaps. Build Your Career.”</p>
        <p className="mt-1 font-mono text-[11px] text-slate-600">Built for production-grade career development intelligence.</p>
      </footer>
    </div>
  );
};
