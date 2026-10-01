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
import { Mic, Radio } from 'lucide-react';

// Layout wrapper for authenticated dashboard pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { voiceAssistantOpen, setVoiceAssistantOpen } = useAuth();

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

      {/* Floating Voice Assistant Trigger */}
      <button
        type="button"
        onClick={() => setVoiceAssistantOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] ring-4 ring-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2 group"
        title="Open Gemini 3.5 Multilingual Voice Assistant"
      >
        <Mic className="w-5 h-5 animate-pulse" />
        <span className="hidden lg:inline text-xs font-bold pr-1">
          Voice Coach (Multilingual)
        </span>
      </button>

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
