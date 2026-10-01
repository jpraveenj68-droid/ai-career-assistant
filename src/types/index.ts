export interface User {
  id: string;
  name: string;
  email: string;
  education: string;
  graduationYear: string;
  preferredRole: string;
  createdAt: string;
}

export interface ExtractedResume {
  name: string;
  email: string;
  phone: string;
  education: string;
  degree: string;
  skills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  cloudSkills: string[];
  tools: string[];
  softSkills: string[];
  projects: Array<{ title: string; description: string; techStack?: string[] }>;
  certifications: string[];
  experience: Array<{ role: string; company: string; duration: string; summary: string }>;
  rawText?: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  cloudTechnologies: string[];
  tools: string[];
  softSkills: string[];
  experienceRequired: string;
  education: string;
  responsibilities: string[];
  rawText: string;
  createdAt: string;
}

export interface SkillGapItem {
  id: string;
  skill: string;
  category: 'critical' | 'nice-to-have' | 'strength';
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  gap: 'None' | 'Low' | 'Medium' | 'High';
  importance: 'High' | 'Medium' | 'Low';
  suggestedLearningDays: number;
}

export interface RoadmapTask {
  id: string;
  week: number;
  skill: string;
  title: string;
  learningObjective: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  practiceTask: string;
  miniProject: string;
  completed: boolean;
  completedAt?: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  description: string;
  skillsDeveloped: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  portfolioValue: 'Medium' | 'High' | 'Exceptional';
  keyFeatures: string[];
  architectureOverview: string;
}

export interface RecommendedCertification {
  id: string;
  name: string;
  issuer: string;
  relevance: string;
  skillsCovered: string[];
  level: string;
  status: 'Interested' | 'In Progress' | 'Completed';
  link?: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'Project' | 'HR';
  question: string;
  context: string;
  suggestedPoints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answered?: boolean;
  userNotes?: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  targetRole: string;
  jobTitle: string;
  createdAt: string;
  alignmentScore: number;
  breakdown: {
    technicalSkills: number;
    projects: number;
    experience: number;
    education: number;
    certifications: number;
    softSkills: number;
  };
  matchedSkills: string[];
  missingCriticalSkills: string[];
  missingPreferredSkills: string[];
  partialSkills: Array<{ resumeSkill: string; jobSkill: string; reason: string }>;
  skillGaps: SkillGapItem[];
  roadmap: RoadmapTask[];
  recommendedProjects: RecommendedProject[];
  recommendedCertifications: RecommendedCertification[];
  interviewQuestions: InterviewQuestion[];
}

export interface DashboardSummary {
  readinessScore: number;
  quickStats: {
    skillsDetected: number;
    jobsAnalyzed: number;
    skillsMatched: number;
    skillGaps: number;
    roadmapProgress: number;
  };
  currentTargetRole: {
    role: string;
    company: string;
    matchScore: number;
    missingSkillsCount: number;
    recommendedLearningCount: number;
  };
  latestAnalysis: AnalysisRecord | null;
  recentAnalyses: AnalysisRecord[];
}
