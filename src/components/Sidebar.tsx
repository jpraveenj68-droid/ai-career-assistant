import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  AlertCircle,
  Compass,
  FolderGit2,
  Award,
  MessageSquareCode,
  LineChart,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resume', label: 'Resume Profile', icon: FileText },
  { path: '/job-analysis', label: 'Job Analysis', icon: Briefcase },
  { path: '/skill-gap', label: 'Skill Gaps', icon: AlertCircle },
  { path: '/roadmap', label: 'Career Roadmap', icon: Compass },
  { path: '/projects', label: 'Recommended Projects', icon: FolderGit2 },
  { path: '/certifications', label: 'Certifications', icon: Award },
  { path: '/interview', label: 'Interview Prep', icon: MessageSquareCode },
  { path: '/progress', label: 'Career Analytics', icon: LineChart },
  { path: '/profile', label: 'Candidate Profile', icon: UserCheck },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md p-4 min-h-[calc(100vh-4rem)]">
      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 font-semibold">
        Career Intelligence
      </div>

      <nav className="space-y-1 mt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Status Box */}
      <div className="mt-auto pt-4 border-t border-slate-900">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-mono">System State</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Real-time recalculation enabled for skill gap closure.
          </p>
        </div>
      </div>
    </aside>
  );
};
