import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { SkillChip } from '../components/SkillChip';
import {
  UserCheck,
  Save,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileText,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [education, setEducation] = useState(user?.education || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '');
  const [preferredRole, setPreferredRole] = useState(user?.preferredRole || '');
  const [preferredDomain, setPreferredDomain] = useState('Full Stack / Distributed Cloud Systems');
  const [careerGoal, setCareerGoal] = useState('Secure a Tier-1 Full Stack / Cloud Engineering role within 60 days');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEducation(user.education);
      setGraduationYear(user.graduationYear);
      setPreferredRole(user.preferredRole);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name,
        education,
        graduationYear,
        preferredRole,
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-1">
            <UserCheck className="w-3 h-3" />
            <span>CANDIDATE INTELLIGENCE PROFILE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Candidate Profile & Career Goals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal baseline, graduation milestones, and primary role targets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/resume')}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Edit Extracted Resume</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <GlassCard glow="cyan">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Personal & Academic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Education & Degree Program
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="none">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            Career Target & Objectives
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Target Role
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Industry Domain
                </label>
                <input
                  type="text"
                  value={preferredDomain}
                  onChange={(e) => setPreferredDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary 60-Day Career Milestone Goal
              </label>
              <textarea
                rows={2}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
