import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InterviewQuestion } from '../types';
import { GlassCard } from '../components/GlassCard';
import {
  MessageSquareCode,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  RotateCcw,
  BookOpen,
  Send,
} from 'lucide-react';

export const InterviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Technical' | 'Behavioral' | 'Project' | 'HR'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.getInterviewQuestions();
      setQuestions(res.questions);
      setTargetRole(res.targetRole);

      // Preload user notes
      const notesMap: Record<string, string> = {};
      res.questions.forEach((q) => {
        if (q.userNotes) notesMap[q.id] = q.userNotes;
      });
      setUserNotes(notesMap);
      if (res.questions.length > 0) {
        setExpandedId(res.questions[0].id);
      }
    } catch (err) {
      console.error('Failed to load interview questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnswered = async (questionId: string, currentAnswered: boolean) => {
    const next = !currentAnswered;
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answered: next } : q))
    );
    try {
      await api.saveInterviewNotes(questionId, userNotes[questionId] || '', next);
    } catch (e) {
      console.error('Failed to update question status:', e);
    }
  };

  const handleSaveNotes = async (questionId: string) => {
    try {
      const q = questions.find((item) => item.id === questionId);
      await api.saveInterviewNotes(questionId, userNotes[questionId] || '', q?.answered || false);
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  };

  const filtered = questions.filter((q) => {
    if (activeCategory === 'All') return true;
    return q.category === activeCategory;
  });

  const answeredCount = questions.filter((q) => q.answered).length;
  const readinessPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Synthesizing interview preparation questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-1">
            <MessageSquareCode className="w-3 h-3" />
            <span>INTERVIEW INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Target Role Interview Preparation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-calibrated Technical, Project, Behavioral, and HR questions based on your resume projects and target role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            Readiness: <strong className="text-cyan-400">{readinessPercent}%</strong>
          </div>
          <button
            type="button"
            onClick={() => setSimulationActive(!simulationActive)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simulationActive ? 'Exit Mock Simulator' : 'Start Mock Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Mock Simulation Mode */}
      {simulationActive && questions.length > 0 && (
        <GlassCard glow="cyan" className="p-6 border-cyan-500/40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">
                MOCK INTERVIEW IN PROGRESS • QUESTION {simulationIndex + 1} OF {questions.length}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Category: <strong className="text-white">{questions[simulationIndex]?.category}</strong>
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-relaxed">
            "{questions[simulationIndex]?.question}"
          </h3>
          <p className="text-xs text-slate-400 mb-4 italic">
            Context: {questions[simulationIndex]?.context}
          </p>

          <div className="mb-4">
            <label className="block text-xs uppercase font-mono text-slate-400 mb-1.5">
              Your Answer Points / Script:
            </label>
            <textarea
              rows={4}
              value={userNotes[questions[simulationIndex]?.id] || ''}
              onChange={(e) =>
                setUserNotes({ ...userNotes, [questions[simulationIndex]?.id]: e.target.value })
              }
              placeholder="Structure your answer using STAR method or architectural points..."
              className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={simulationIndex === 0}
              onClick={() => setSimulationIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white disabled:opacity-30"
            >
              Previous Question
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSaveNotes(questions[simulationIndex].id);
                  handleToggleAnswered(questions[simulationIndex].id, false);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
              >
                Mark Mastered & Saved
              </button>

              <button
                type="button"
                disabled={simulationIndex >= questions.length - 1}
                onClick={() => {
                  handleSaveNotes(questions[simulationIndex].id);
                  setSimulationIndex((prev) => Math.min(questions.length - 1, prev + 1));
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-30"
              >
                Next Question →
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs w-fit">
        {(['All', 'Technical', 'Project', 'Behavioral', 'HR'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeCategory === cat ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Question Accordion List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const isAnswered = item.answered;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isAnswered
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-4 md:p-5 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAnswered(item.id, isAnswered || false);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isAnswered
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'border border-slate-700 bg-slate-950 text-transparent hover:border-cyan-400'
                    }`}
                  >
                    ✓
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.difficulty === 'Hard'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.difficulty === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {item.question}
                    </h4>
                  </div>
                </div>

                <button type="button" className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-5 md:px-5 pt-2 border-t border-slate-800/80 space-y-4">
                  {/* Context */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-300">Why this question matters: </strong>
                    {item.context}
                  </div>

                  {/* Talking points */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                      High-Scoring Talking Points:
                    </span>
                    <ul className="space-y-1.5">
                      {item.suggestedPoints?.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* User Practice Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Your Practice Notes & Answer Outline
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(item.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Notes</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={userNotes[item.id] || ''}
                      onChange={(e) => setUserNotes({ ...userNotes, [item.id]: e.target.value })}
                      placeholder="Type your talking points or practice script here..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
