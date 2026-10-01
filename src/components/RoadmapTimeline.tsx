import React from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle, Clock, Award, Terminal, Code2, Sparkles, ArrowRight } from 'lucide-react';
import { RoadmapTask } from '../types';

interface RoadmapTimelineProps {
  tasks: RoadmapTask[];
  onToggleTask: (taskId: string, currentStatus: boolean) => void;
  progressPercent: number;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  tasks,
  onToggleTask,
  progressPercent,
}) => {
  const handleToggle = (taskId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    onToggleTask(taskId, currentStatus);

    // If marking as completed and overall progress reaches 100% or milestone, fire celebratory confetti
    if (nextStatus) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#6366f1'],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              Personalized Learning Acceleration
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Targeted Skill Closure Roadmap
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Roadmap Progress:</span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Week Timeline */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-slate-800 space-y-6">
        {tasks.map((task) => {
          const isCompleted = task.completed;

          return (
            <div key={task.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                onClick={() => handleToggle(task.id, isCompleted)}
                className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900 border-2 border-slate-700 text-transparent hover:border-cyan-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400" />
                )}
              </div>

              {/* Task Content Card */}
              <div
                className={`rounded-xl border transition-all p-4 md:p-5 ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        WEEK {task.week}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          task.difficulty === 'Advanced'
                            ? 'bg-rose-500/20 text-rose-300'
                            : task.difficulty === 'Intermediate'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {task.difficulty}
                      </span>
                    </div>
                    <h4
                      className={`text-base font-semibold ${
                        isCompleted ? 'text-slate-300 line-through opacity-85' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id, isCompleted)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {task.learningObjective}
                </p>

                {/* Practical Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Hands-on Practice Task</span>
                    </div>
                    <p className="text-slate-400">{task.practiceTask}</p>
                  </div>

                  <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Deliverable Mini-Project</span>
                    </div>
                    <p className="text-slate-400">{task.miniProject}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
