import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, User, LogOut, Sparkles, ChevronRight, Zap, Mic, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin, aiProvider, setVoiceAssistantOpen } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 md:px-8">
      {/* Left side branding / target role context */}
      <div className="flex items-center gap-3 md:gap-4">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              AI Career Assistant
            </h1>
            <p className="text-[10px] text-slate-400 font-mono leading-none">
              Command Center v2.4
            </p>
          </div>
        </div>

        {user && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-cyan-400">{user.preferredRole || 'Full Stack Developer'}</span>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Voice Assistant Trigger Button */}
        <button
          type="button"
          onClick={() => setVoiceAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-sm transition-all"
        >
          <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Voice Coach</span>
        </button>

        {/* AI Provider Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden md:inline text-slate-400">Engine:</span>
          <span className="text-cyan-300 font-medium truncate max-w-[120px] md:max-w-none">
            {aiProvider.includes('gemini') ? 'Gemini 3.8 Flash' : 'NLP Deterministic'}
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium">{user.name.split(' ')[0]}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => demoLogin().then(() => navigate('/dashboard'))}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Try Demo</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-xs font-medium text-slate-200 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
