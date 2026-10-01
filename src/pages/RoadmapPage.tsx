import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RoadmapTask } from '../types';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { GlassCard } from '../components/GlassCard';
import { Compass, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.getRoadmap();
      setTasks(res.roadmap);
      setTargetRole(res.targetRole);
      setProgressPercent(res.progressPercent);
      setCompletedCount(res.completedCount);
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: nextStatus } : t))
      );

      const res = await api.toggleRoadmapTask(taskId, nextStatus);
      setProgressPercent(res.progressPercent);
      setCompletedCount(res.completedCount);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.task : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchRoadmap(); // rollback on error
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-slate-400">Loading personalized roadmap...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-1">
            <Compass className="w-3 h-3" />
            <span>ACCELERATED CAREER CURRICULUM</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Personalized Learning Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structured week-by-week sprints designed to close all critical skill gaps for <strong className="text-slate-200">{targetRole}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Recommended Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Completion status summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard glow="cyan" className="p-4">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Roadmap Velocity</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {completedCount} of {tasks.length} Completed
          </div>
        </GlassCard>

        <GlassCard glow="emerald" className="p-4">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Progress Metric</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {progressPercent}% Complete
          </div>
        </GlassCard>

        <GlassCard glow="none" className="p-4">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Estimated Remaining Time</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {Math.max(0, tasks.length - completedCount) * 7} Days
          </div>
        </GlassCard>
      </div>

      {/* Interactive Timeline */}
      <RoadmapTimeline
        tasks={tasks}
        onToggleTask={handleToggleTask}
        progressPercent={progressPercent}
      />
    </div>
  );
};
