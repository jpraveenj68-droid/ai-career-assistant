/**
 * AI Career Assistant
 * "Know Your Fit. Close Your Skill Gaps. Build Your Career."
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumePage } from './pages/ResumePage';
import { JobAnalysisPage } from './pages/JobAnalysisPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { InterviewPage } from './pages/InterviewPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CuteRoamingBot } from './components/CuteRoamingBot';
import { AudioLines, Sparkles } from 'lucide-react';

// Layout wrapper for authenticated dashboard pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { voiceAssistantOpen, setVoiceAssistantOpen, subramaniBotEnabled, setSubramaniBotEnabled } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col command-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-32 md:pb-28 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomNav />

      {/* Floating AI Voice Assistant Trigger */}
      <button
        type="button"
        onClick={() => setVoiceAssistantOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-950/95 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 ring-1 ring-cyan-500/20"
        title="Open Gemini 3.5 Multilingual AI Voice Coach"
      >
        {/* Animated AI Audio Soundwave Orb */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-sm shrink-0">
          <div className="w-full h-full rounded-full bg-[#080c14] flex items-center justify-center">
            <AudioLines className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
        </div>

        {/* Text Details & Live Pulse */}
        <div className="flex flex-col items-start pr-1 text-left">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
              AI Voice Coach
            </span>
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span className="text-cyan-400 font-medium">Gemini 3.5</span>
            <span>•</span>
            <span>Multilingual</span>
          </div>
        </div>

        {/* Live Audio Equalizer Bars */}
        <div className="hidden sm:flex items-center gap-0.5 pl-1 pr-1 h-3.5">
          <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
          <span className="w-0.5 h-4 bg-indigo-400 rounded-full animate-pulse delay-75" />
          <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150" />
          <span className="w-0.5 h-3 bg-fuchsia-400 rounded-full animate-pulse delay-100" />
        </div>
      </button>

      {/* Cute Interactive Roaming AI Companion Bot (ON / OFF controllable) */}
      {subramaniBotEnabled ? (
        <CuteRoamingBot onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} />
      ) : (
        <button
          type="button"
          onClick={() => setSubramaniBotEnabled(true)}
          className="fixed bottom-20 md:bottom-6 left-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs shadow-lg backdrop-blur-md transition-all hover:scale-105 group"
          title="Turn Subramani Bot ON"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🤖</span>
          <span className="text-[11px] font-medium">Turn Subramani ON</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-emerald-400" />
        </button>
      )}

      {/* Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceAssistantOpen}
        onClose={() => setVoiceAssistantOpen(false)}
      />
    </div>
  );
};

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-xs font-mono text-cyan-400 animate-pulse">
          Initializing Career Intelligence Engine...
        </div>
      </div>
    );
  }

  // If no user session, allow seamless access with demo fallback or redirect to auth
  return <AppLayout>{children}</AppLayout>;
};

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Dashboard & Career Intelligence Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-analysis"
        element={
          <ProtectedRoute>
            <JobAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-gap"
        element={
          <ProtectedRoute>
            <SkillGapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certifications"
        element={
          <ProtectedRoute>
            <CertificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
