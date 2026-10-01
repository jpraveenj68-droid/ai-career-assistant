import {
  User,
  ExtractedResume,
  JobDescription,
  AnalysisRecord,
  DashboardSummary,
  RoadmapTask,
  RecommendedProject,
  RecommendedCertification,
  InterviewQuestion,
} from '../types';

const TOKEN_KEY = 'ai_career_assistant_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Auto set JSON Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; app: string; aiProvider: string }>('/api/health'),

  // Auth
  register: (payload: { name: string; email: string; password: string; education?: string; graduationYear?: string; preferredRole?: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoLogin: () =>
    request<{ token: string; user: User }>('/api/auth/demo', {
      method: 'POST',
    }),

  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: Partial<User>) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Resume
  uploadResume: (file?: File, text?: string) => {
    if (file) {
      const formData = new FormData();
      formData.append('resumeFile', file);
      return request<{ message: string; resume: ExtractedResume }>('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
    } else {
      return request<{ message: string; resume: ExtractedResume }>('/api/resume/upload', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    }
  },

  getResume: () => request<{ resume: ExtractedResume }>('/api/resume'),

  updateResume: (resume: Partial<ExtractedResume>) =>
    request<{ message: string; resume: ExtractedResume }>('/api/resume', {
      method: 'PUT',
      body: JSON.stringify(resume),
    }),

  // Job
  analyzeJob: (payload: { file?: File; text?: string; title?: string; company?: string }) => {
    if (payload.file) {
      const formData = new FormData();
      formData.append('jobFile', payload.file);
      if (payload.title) formData.append('title', payload.title);
      if (payload.company) formData.append('company', payload.company);
      return request<{ message: string; job: JobDescription }>('/api/jobs/analyze', {
        method: 'POST',
        body: formData,
      });
    } else {
      return request<{ message: string; job: JobDescription }>('/api/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({
          text: payload.text,
          title: payload.title,
          company: payload.company,
        }),
      });
    }
  },

  getJobs: () => request<{ jobs: JobDescription[] }>('/api/jobs'),

  // Analysis & Dashboard
  runAnalysis: (payload: { jobId?: string; job?: JobDescription; resume?: ExtractedResume }) =>
    request<{ message: string; analysis: AnalysisRecord }>('/api/analysis', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDashboardSummary: () => request<DashboardSummary>('/api/analysis/dashboard/summary'),

  getRecentAnalyses: () => request<{ analyses: AnalysisRecord[] }>('/api/analysis/recent'),

  getAnalysisById: (id: string) => request<{ analysis: AnalysisRecord }>(`/api/analysis/${id}`),

  getSkillsOverview: () => request<{
    resumeSkills: string[];
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    cloudSkills: string[];
    tools: string[];
    softSkills: string[];
    skillGaps: any[];
    matchedSkills: string[];
  }>('/api/analysis/skills/overview'),

  // Interactive Roadmap
  getRoadmap: () =>
    request<{
      analysisId: string;
      targetRole: string;
      roadmap: RoadmapTask[];
      progressPercent: number;
      completedCount: number;
      totalCount: number;
    }>('/api/roadmap'),

  toggleRoadmapTask: (taskId: string, completed: boolean) =>
    request<{
      message: string;
      task: RoadmapTask;
      progressPercent: number;
      completedCount: number;
      totalCount: number;
    }>(`/api/roadmap/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    }),

  // Projects & Certs
  getProjectRecommendations: () => request<{ projects: RecommendedProject[] }>('/api/projects/recommendations'),

  getCertifications: () => request<{ certifications: RecommendedCertification[] }>('/api/certifications'),

  updateCertificationStatus: (certId: string, status: 'Interested' | 'In Progress' | 'Completed') =>
    request<{ message: string; certification: RecommendedCertification }>(`/api/certifications/${certId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Interview Prep
  getInterviewQuestions: () =>
    request<{ targetRole: string; questions: InterviewQuestion[] }>('/api/interview/questions'),

  saveInterviewNotes: (questionId: string, notes: string, answered: boolean) =>
    request<{ message: string; question: InterviewQuestion }>('/api/interview/notes', {
      method: 'POST',
      body: JSON.stringify({ questionId, notes, answered }),
    }),

  // Multilingual Voice Assistant (Gemini 3.5 Transcribe & Gemini 3.8 Flash TTS)
  interactVoice: (payload: {
    audio?: string;
    mimeType?: string;
    text?: string;
    language?: string;
    voice?: string;
    context?: any;
  }) =>
    request<{
      userTranscript: string;
      replyText: string;
      replyAudio?: string;
      language: string;
      voice: string;
    }>('/api/voice/interact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
