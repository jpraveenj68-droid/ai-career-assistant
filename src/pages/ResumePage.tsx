import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExtractedResume } from '../types';
import { GlassCard } from '../components/GlassCard';
import { SkillChip } from '../components/SkillChip';
import { LoadingAnalysisModal } from '../components/LoadingAnalysisModal';
import {
  Upload,
  FileText,
  Save,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  Cloud,
  Wrench,
  BookOpen,
  Briefcase,
  GraduationCap,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ExtractedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // New skill input states
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'programmingLanguages' | 'frameworks' | 'databases' | 'cloudSkills' | 'tools' | 'softSkills'>('programmingLanguages');

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await api.getResume();
      setResume(res.resume);
    } catch {
      // Empty resume state on initial visit is normal; silently set to null
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }

    setParsing(true);
    setNotification(null);
    try {
      const res = await api.uploadResume(file);
      setResume(res.resume);
      setNotification({ type: 'success', message: 'Resume uploaded and parsed successfully!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to parse resume file' });
    } finally {
      setParsing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return;

    setParsing(true);
    setNotification(null);
    try {
      const res = await api.uploadResume(undefined, pasteText);
      setResume(res.resume);
      setNotification({ type: 'success', message: 'Resume text parsed successfully!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to parse resume text' });
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    setNotification(null);
    try {
      const res = await api.updateResume(resume);
      setResume(res.resume);
      setNotification({ type: 'success', message: 'Resume profile saved! Ready for job matching.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !resume) return;
    const skillName = newSkill.trim();

    const updatedCategoryList = [...(resume[newSkillCategory] || [])];
    if (!updatedCategoryList.includes(skillName)) {
      updatedCategoryList.push(skillName);
    }

    const updatedAllSkills = [...(resume.skills || [])];
    if (!updatedAllSkills.includes(skillName)) {
      updatedAllSkills.push(skillName);
    }

    setResume({
      ...resume,
      [newSkillCategory]: updatedCategoryList,
      skills: updatedAllSkills,
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (category: 'programmingLanguages' | 'frameworks' | 'databases' | 'cloudSkills' | 'tools' | 'softSkills', skillName: string) => {
    if (!resume) return;
    const updatedCategoryList = (resume[category] || []).filter((s) => s !== skillName);
    const updatedAllSkills = (resume.skills || []).filter((s) => s !== skillName);

    setResume({
      ...resume,
      [category]: updatedCategoryList,
      skills: updatedAllSkills,
    });
  };

  return (
    <div className="space-y-6">
      <LoadingAnalysisModal isOpen={parsing} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Resume Profile Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your resume or paste its contents. Review and edit extracted skills before career matching.
          </p>
        </div>

        {resume && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/job-analysis')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Match With Job</span>
            </button>
          </div>
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

      {/* Input Options (Upload or Paste) */}
      <GlassCard glow="none">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Resume (Photo / Image, PDF, DOCX, TXT)</span>
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
            Paste Text Manually
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Upload className="w-7 h-7 animate-bounce" />
                </div>
              </div>

              <span className="text-sm font-semibold text-slate-200 text-center">
                Click to select or drag and drop your resume photo or document
              </span>
              <span className="text-xs text-slate-400 mt-1 text-center max-w-md">
                Full visual OCR support: <strong className="text-cyan-300">Images (PNG, JPG, JPEG, WEBP)</strong>, PDF, DOCX, and TXT (Max 10MB)
              </span>

              <div className="mt-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                  📸 Resume Photo / Screenshot
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
                  📄 PDF / DOCX / TXT
                </span>
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded Image Preview */}
            {imagePreviewUrl && (
              <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-slate-950/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreviewUrl}
                    alt="Resume upload preview"
                    className="w-16 h-20 object-cover rounded-lg border border-slate-700 shadow-md"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Resume Image Processed
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Visual OCR extracted skills, education, and career experience.
                    </span>
                  </div>
                </div>

                <a
                  href={imagePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-xs text-slate-300 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Full Photo</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your raw resume text here (Education, Skills, Projects, Experience, Certifications)..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none font-mono"
            />
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim() || parsing}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
            >
              Parse Resume Text
            </button>
          </div>
        )}
      </GlassCard>

      {/* Extracted Information (Editable Sections) */}
      {resume && (
        <div className="space-y-6">
          {/* Candidate Profile Details */}
          <GlassCard glow="cyan">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Candidate Profile & Education
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={resume.name}
                  onChange={(e) => setResume({ ...resume, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  value={resume.education}
                  onChange={(e) => setResume({ ...resume, education: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-slate-400 mb-1">
                  Degree / Major
                </label>
                <input
                  type="text"
                  value={resume.degree}
                  onChange={(e) => setResume({ ...resume, degree: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </GlassCard>

          {/* Technical Skills breakdown */}
          <GlassCard glow="none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Extracted Technical Skills ({resume.skills.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Click '×' on any chip to remove, or use the input below to add more skills.
                </p>
              </div>

              {/* Add Skill Form */}
              <div className="flex items-center gap-2">
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:border-cyan-500 outline-none"
                >
                  <option value="programmingLanguages">Languages</option>
                  <option value="frameworks">Frameworks</option>
                  <option value="databases">Databases</option>
                  <option value="cloudSkills">Cloud / DevOps</option>
                  <option value="tools">Tools</option>
                  <option value="softSkills">Soft Skills</option>
                </select>
                <input
                  type="text"
                  placeholder="New skill (e.g. Docker)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none w-32 sm:w-40"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Languages */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Programming Languages ({resume.programmingLanguages?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resume.programmingLanguages?.map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      onRemove={() => handleRemoveSkill('programmingLanguages', s)}
                    />
                  ))}
                  {(!resume.programmingLanguages || resume.programmingLanguages.length === 0) && (
                    <span className="text-xs text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Frameworks */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Frameworks & Libraries ({resume.frameworks?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resume.frameworks?.map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      onRemove={() => handleRemoveSkill('frameworks', s)}
                    />
                  ))}
                </div>
              </div>

              {/* Databases */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Databases & Storage ({resume.databases?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resume.databases?.map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      onRemove={() => handleRemoveSkill('databases', s)}
                    />
                  ))}
                </div>
              </div>

              {/* Cloud & Tools */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud, DevOps & Tools ({((resume.cloudSkills?.length || 0) + (resume.tools?.length || 0))})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...(resume.cloudSkills || []), ...(resume.tools || [])].map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      onRemove={() => handleRemoveSkill('tools', s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Projects Section */}
          <GlassCard glow="none">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Key Projects ({resume.projects?.length || 0})
            </h3>
            <div className="space-y-3">
              {resume.projects?.map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...resume.projects];
                      updated[idx].title = e.target.value;
                      setResume({ ...resume, projects: updated });
                    }}
                    className="w-full text-sm font-semibold text-slate-100 bg-transparent border-b border-slate-800 pb-1 mb-2 outline-none focus:border-cyan-500"
                  />
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const updated = [...resume.projects];
                      updated[idx].description = e.target.value;
                      setResume({ ...resume, projects: updated });
                    }}
                    className="w-full text-xs text-slate-300 bg-transparent outline-none focus:text-white"
                  />
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.techStack.map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Certifications & Soft Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard glow="none">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Certifications
              </h3>
              <div className="space-y-2">
                {resume.certifications?.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard glow="none">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resume.softSkills?.map((s) => (
                  <SkillChip key={s} skill={s} onRemove={() => handleRemoveSkill('softSkills', s)} />
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
