import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

interface DatabaseSchema {
  users: Record<string, User>;
  resumes: Record<string, ExtractedResume>;
  jobs: Record<string, JobDescription>;
  analyses: Record<string, AnalysisRecord>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'career_assistant_db.json');

// In-memory cache
let dbCache: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;
  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('Failed to parse database file, resetting with seed data', err);
    }
  }

  // Initialize with seed data
  dbCache = getInitialSeedData();
  saveDatabase();
  return dbCache;
}

export function saveDatabase(): void {
  if (!dbCache) return;
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// Demo Candidate & Analysis Seeding
function getInitialSeedData(): DatabaseSchema {
  const demoUserId = 'demo-user-1';
  const demoAnalysisId = 'demo-analysis-1';
  const now = new Date().toISOString();

  const demoUser: User = {
    id: demoUserId,
    name: 'Praveen Kumar',
    email: 'demo@careerassistant.ai',
    passwordHash: '$2a$10$demoHashedPasswordFallbackOnlySample123',
    education: 'B.Tech in Artificial Intelligence & Data Science',
    graduationYear: '2026',
    preferredRole: 'Full Stack Developer',
    createdAt: now,
  };

  const demoResume: ExtractedResume = {
    name: 'Praveen Kumar',
    email: 'demo@careerassistant.ai',
    phone: '+91 98765 43210',
    education: 'Anna University / AI & Data Science',
    degree: 'B.Tech in AI & Data Science',
    skills: ['Python', 'Java', 'React', 'SQL', 'Git', 'Machine Learning', 'FastAPI', 'REST API', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
    programmingLanguages: ['Python', 'Java', 'JavaScript', 'SQL'],
    frameworks: ['React', 'FastAPI'],
    databases: ['SQL', 'SQLite'],
    cloudSkills: ['Git', 'GitHub'],
    tools: ['Git', 'VS Code', 'Postman'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Communication', 'Quick Learner'],
    projects: [
      {
        title: 'AI Blood Demand & Availability Prediction System',
        description: 'End-to-end predictive analytics platform forecasting regional hospital blood unit shortages with 92% accuracy using Random Forest and FastAPI backend.',
        techStack: ['Python', 'Machine Learning', 'FastAPI', 'React', 'SQL'],
      },
      {
        title: 'PulseVote Live Polling',
        description: 'Real-time interactive audience polling and sentiment analytics system with WebSocket updates, handling concurrent voting rooms.',
        techStack: ['React', 'JavaScript', 'FastAPI', 'Tailwind CSS'],
      },
      {
        title: 'SplitSphere Expense Splitting Application',
        description: 'Smart bill and expense sharing utility featuring debt simplification graph algorithms and automated ledger balance calculations.',
        techStack: ['React', 'Python', 'SQL', 'REST API'],
      },
    ],
    certifications: [
      'Foundations of Machine Learning - Coursera',
      'Java SE Programming Certification',
      'Google Cloud Computing Fundamentals',
    ],
    experience: [
      {
        role: 'Full Stack Intern',
        company: 'Apex Code Labs',
        duration: 'May 2025 - Jul 2025',
        summary: 'Built responsive frontend dashboards in React and developed 12+ REST endpoints using Python FastAPI for client data ingestion.',
      },
    ],
    rawText: `Praveen Kumar | demo@careerassistant.ai | +91 98765 43210
Education: B.Tech in Artificial Intelligence & Data Science (2022 - 2026)
Technical Skills: Python, Java, React, SQL, Git, Machine Learning, FastAPI, JavaScript, Tailwind CSS, REST API
Projects:
1. AI Blood Demand & Availability Prediction System - ML forecasting model with FastAPI and React.
2. PulseVote Live Polling - Real-time polling web app with WebSockets.
3. SplitSphere - Expense splitting and debt simplification platform.
Certifications: Google Cloud Fundamentals, Machine Learning Specialization.
Experience: Full Stack Intern at Apex Code Labs.`,
    updatedAt: now,
  };

  const demoJob: JobDescription = {
    id: 'demo-job-1',
    title: 'Full Stack Developer',
    company: 'NextGen Scale Dynamics',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Git', 'Docker'],
    preferredSkills: ['AWS', 'Redis', 'Tailwind CSS', 'CI/CD', 'GraphQL'],
    programmingLanguages: ['TypeScript', 'JavaScript'],
    frameworks: ['React', 'Node.js', 'Express'],
    databases: ['PostgreSQL', 'Redis'],
    cloudTechnologies: ['Docker', 'AWS'],
    tools: ['Git', 'Docker', 'Postman'],
    softSkills: ['Team Collaboration', 'Problem Solving', 'Agile Mindset'],
    experienceRequired: '1-3 years of modern web development',
    education: "Bachelor's degree in Computer Science, AI, or related field",
    responsibilities: [
      'Architect and build resilient web applications with React frontend and Node.js microservices',
      'Design relational schemas and optimize complex SQL queries in PostgreSQL',
      'Containerize services using Docker and collaborate in continuous deployment pipelines',
      'Integrate third-party REST APIs and enforce strict TypeScript type safety',
    ],
    rawText: `Role: Full Stack Developer
Company: NextGen Scale Dynamics
Required: React, TypeScript, Node.js, PostgreSQL, REST API, Git, Docker
Preferred: AWS, Redis, Tailwind CSS, CI/CD
We are seeking a high-caliber Full Stack Developer to engineer mission-critical cloud products.
Requirements: Strong proficiency in React, TypeScript, Node.js, and relational databases like PostgreSQL. Experience with Docker containerization and modern API design.`,
    createdAt: now,
  };

  const demoSkillGaps: SkillGapItem[] = [
    {
      id: 'gap-1',
      skill: 'TypeScript',
      category: 'critical',
      currentLevel: 'Beginner',
      requiredLevel: 'Intermediate',
      gap: 'Medium',
      importance: 'High',
      suggestedLearningDays: 7,
    },
    {
      id: 'gap-2',
      skill: 'Node.js',
      category: 'critical',
      currentLevel: 'Beginner',
      requiredLevel: 'Intermediate',
      gap: 'Medium',
      importance: 'High',
      suggestedLearningDays: 8,
    },
    {
      id: 'gap-3',
      skill: 'PostgreSQL',
      category: 'critical',
      currentLevel: 'Beginner',
      requiredLevel: 'Intermediate',
      gap: 'Low',
      importance: 'High',
      suggestedLearningDays: 5,
    },
    {
      id: 'gap-4',
      skill: 'Docker',
      category: 'critical',
      currentLevel: 'None',
      requiredLevel: 'Intermediate',
      gap: 'High',
      importance: 'High',
      suggestedLearningDays: 6,
    },
    {
      id: 'gap-5',
      skill: 'AWS',
      category: 'nice-to-have',
      currentLevel: 'Beginner',
      requiredLevel: 'Intermediate',
      gap: 'Medium',
      importance: 'Medium',
      suggestedLearningDays: 10,
    },
    {
      id: 'gap-6',
      skill: 'Redis',
      category: 'nice-to-have',
      currentLevel: 'None',
      requiredLevel: 'Beginner',
      gap: 'Medium',
      importance: 'Low',
      suggestedLearningDays: 4,
    },
    {
      id: 'gap-7',
      skill: 'React',
      category: 'strength',
      currentLevel: 'Advanced',
      requiredLevel: 'Intermediate',
      gap: 'None',
      importance: 'High',
      suggestedLearningDays: 0,
    },
    {
      id: 'gap-8',
      skill: 'Git',
      category: 'strength',
      currentLevel: 'Intermediate',
      requiredLevel: 'Intermediate',
      gap: 'None',
      importance: 'High',
      suggestedLearningDays: 0,
    },
    {
      id: 'gap-9',
      skill: 'REST API',
      category: 'strength',
      currentLevel: 'Intermediate',
      requiredLevel: 'Intermediate',
      gap: 'None',
      importance: 'High',
      suggestedLearningDays: 0,
    },
  ];

  const demoRoadmap: RoadmapTask[] = [
    {
      id: 'task-1',
      week: 1,
      skill: 'TypeScript Fundamentals & Typing',
      title: 'Type Safety & Modern TS with React',
      learningObjective: 'Master TypeScript interfaces, generics, utility types, and convert React JavaScript components to robust typed components.',
      duration: '7 Days (10 hrs)',
      difficulty: 'Intermediate',
      practiceTask: 'Refactor PulseVote polling state models into strictly typed interfaces with union action types.',
      miniProject: 'Typed Kanban Task Engine with generic CRUD handlers',
      completed: true,
      completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      week: 2,
      skill: 'Node.js & Express Backend Architecture',
      title: 'Backend Services, Middleware & JWT Auth',
      learningObjective: 'Build production Node.js services with Express, custom error middleware, input validation, and secure JWT authentication.',
      duration: '8 Days (12 hrs)',
      difficulty: 'Intermediate',
      practiceTask: 'Build a rate-limited REST auth microservice with token refresh flow in TypeScript.',
      miniProject: 'Secure API Gateway with role-based access control',
      completed: true,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      week: 3,
      skill: 'PostgreSQL Relational Mastery',
      title: 'Complex Queries, Indexing & Prisma/Drizzle ORM',
      learningObjective: 'Advance from basic SQL to PostgreSQL-specific features: JSONB, full-text search, composite indexes, and ORM migrations.',
      duration: '6 Days (9 hrs)',
      difficulty: 'Intermediate',
      practiceTask: 'Write optimized joins with explain analyze benchmarks on a 50,000 row sample table.',
      miniProject: 'Analytical Ledger Database Schema with automated triggers',
      completed: false,
    },
    {
      id: 'task-4',
      week: 4,
      skill: 'Full Stack Integration: React + Node.js + Postgres',
      title: 'End-to-End Application Pipeline & REST Architecture',
      learningObjective: 'Connect typed frontend to backend APIs with real-time feedback, optimistic updates, and clean modular code architecture.',
      duration: '7 Days (14 hrs)',
      difficulty: 'Intermediate',
      practiceTask: 'Implement TanStack Query caching with server pagination and optimistic mutation rollbacks.',
      miniProject: 'Real-Time Job Application Tracker with Kanban drag-and-drop',
      completed: false,
    },
    {
      id: 'task-5',
      week: 5,
      skill: 'Docker Containerization & Dev Environments',
      title: 'Containerizing Multi-Service Full Stack Apps',
      learningObjective: 'Write multi-stage Dockerfiles for React and Node.js; configure docker-compose for app, postgres, and redis containers.',
      duration: '5 Days (8 hrs)',
      difficulty: 'Intermediate',
      practiceTask: 'Containerize SplitSphere with docker-compose multi-container setup running in isolated networks.',
      miniProject: '1-Click Multi-Service Production Compose Bundle',
      completed: false,
    },
    {
      id: 'task-6',
      week: 6,
      skill: 'AWS & Cloud Deployment Readiness',
      title: 'Cloud Hosting, S3 Storage & CI/CD Pipelines',
      learningObjective: 'Deploy containerized web apps to AWS ECS/App Runner with RDS PostgreSQL, S3 asset buckets, and GitHub Actions CI/CD.',
      duration: '7 Days (10 hrs)',
      difficulty: 'Advanced',
      practiceTask: 'Set up automated GitHub Actions workflow to run lint, tests, and build Docker image on push.',
      miniProject: 'Production-ready CI/CD Pipeline with health checks',
      completed: false,
    },
  ];

  const demoProjects: RecommendedProject[] = [
    {
      id: 'proj-1',
      title: 'Real-Time Job Application & Pipeline Tracker',
      description: 'A production-grade applicant tracking dashboard featuring Kanban stages, real-time activity feeds, resume keyword matching, and automated email reminders.',
      skillsDeveloped: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker'],
      difficulty: 'Intermediate',
      estimatedDuration: '10 - 14 Days',
      portfolioValue: 'Exceptional',
      keyFeatures: [
        'Interactive drag-and-drop Kanban board for job stages (Applied, Interviewing, Offer)',
        'Full relational database backend with PostgreSQL and indexed query search',
        'TypeScript on both frontend and backend for strict end-to-end type safety',
        'Docker containerized with docker-compose for 1-command local evaluation',
      ],
      architectureOverview: 'React 19 + TypeScript on Vite frontend; Express + TypeScript REST API; PostgreSQL database with connection pooling; Dockerized container image.',
    },
    {
      id: 'proj-2',
      title: 'Cloud Native Microservice Log & Health Monitor',
      description: 'A high-throughput distributed service monitor collecting server telemetry, latency metrics, and error traces with Redis caching.',
      skillsDeveloped: ['Node.js', 'Docker', 'Redis', 'PostgreSQL', 'AWS'],
      difficulty: 'Intermediate',
      estimatedDuration: '7 - 10 Days',
      portfolioValue: 'High',
      keyFeatures: [
        'Time-series metric storage and percentile latency aggregation',
        'Redis cache layer reducing primary database read volume by 80%',
        'Alerting rules engine dispatching notifications when error spikes occur',
      ],
      architectureOverview: 'Node.js event emitter pipeline, Redis pub/sub, PostgreSQL historical archive, React dashboard visualization.',
    },
    {
      id: 'proj-3',
      title: 'Collaborative Document Workspace with Live Synced Edits',
      description: 'Notion-style collaborative document builder with markdown parsing, live cursor sync, and revision history logs.',
      skillsDeveloped: ['React', 'TypeScript', 'WebSocket', 'Node.js', 'Tailwind CSS'],
      difficulty: 'Advanced',
      estimatedDuration: '12 - 16 Days',
      portfolioValue: 'Exceptional',
      keyFeatures: [
        'Conflict-free multi-user typing sync over WebSocket connections',
        'Deep revision history with time-travel inspection in PostgreSQL',
        'Dark mode command palette with instant search indexing',
      ],
      architectureOverview: 'React frontend, Node.js WebSocket cluster, transactional relational storage.',
    },
  ];

  const demoCertifications: RecommendedCertification[] = [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner (CLF-C02)',
      issuer: 'Amazon Web Services',
      relevance: 'Directly validates AWS cloud fundamentals and architectural models required in modern Full Stack positions.',
      skillsCovered: ['AWS', 'Cloud Architecture', 'Security & Compliance', 'EC2/S3/RDS'],
      level: 'Foundational',
      status: 'Interested',
      link: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    },
    {
      id: 'cert-2',
      name: 'Docker Certified Associate (DCA)',
      issuer: 'Docker Inc.',
      relevance: 'Proves containerization expertise, multi-stage building, and container orchestration.',
      skillsCovered: ['Docker', 'Containers', 'Networking', 'Volume Management'],
      level: 'Intermediate',
      status: 'In Progress',
      link: 'https://www.docker.com/community/certification/',
    },
    {
      id: 'cert-3',
      name: 'Meta Front-End & Back-End Professional Specialization',
      issuer: 'Meta / Coursera',
      relevance: 'Validates industry-standard React and backend API architecture, relational schemas, and CI/CD.',
      skillsCovered: ['React', 'Node.js', 'REST API', 'Version Control'],
      level: 'Professional',
      status: 'Completed',
      link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    },
  ];

  const demoInterviewQuestions: InterviewQuestion[] = [
    {
      id: 'iq-1',
      category: 'Technical',
      question: 'What are the key architectural differences between REST APIs and WebSockets, and when would you choose each?',
      context: 'Relevant to your target role as Full Stack Developer and your projects (REST API vs PulseVote live polling).',
      suggestedPoints: [
        'REST is stateless request-response over HTTP/HTTPS, optimal for CRUD operations, caching, and idempotency.',
        'WebSocket is a full-duplex persistent bidirectional TCP connection, optimal for real-time streaming, chat, and live collaborative states.',
        'Mention connection overhead, scaling with load balancers, and graceful connection fallbacks.',
      ],
      difficulty: 'Medium',
      answered: false,
    },
    {
      id: 'iq-2',
      category: 'Technical',
      question: 'How do you prevent SQL injection in PostgreSQL, and how do connection pools like PgBouncer or node-postgres pool improve performance?',
      context: 'Tests PostgreSQL database depth and backend query security.',
      suggestedPoints: [
        'Always utilize parameterized queries / prepared statements rather than string concatenation.',
        'ORM layers (Prisma/Drizzle) parameterize by default, but raw queries must be guarded.',
        'Connection pooling avoids expensive TCP handshakes and process fork overhead per HTTP request.',
      ],
      difficulty: 'Medium',
      answered: false,
    },
    {
      id: 'iq-3',
      category: 'Project',
      question: 'In your "AI Blood Demand Prediction System", how did you handle model evaluation, latency in your FastAPI backend, and edge cases?',
      context: 'Directly derived from your resume project.',
      suggestedPoints: [
        'Detail your train-test split, metrics used (RMSE, MAE, or F1 score), and validation methodology.',
        'Explain why FastAPI was selected: asynchronous request handling, Pydantic type validation, and low latency serialization.',
        'Address edge cases like sudden seasonal hospital shortages or data sparsity.',
      ],
      difficulty: 'Hard',
      answered: false,
    },
    {
      id: 'iq-4',
      category: 'Behavioral',
      question: 'Describe a situation where you had to quickly learn an unfamiliar technology under a tight deadline. How did you structure your learning?',
      context: 'Evaluates adaptability regarding your skill gap learning plan (TypeScript, Docker).',
      suggestedPoints: [
        'Use the STAR method (Situation, Task, Action, Result).',
        'Highlight hands-on prototyping, documentation review, and iterative validation.',
        'Quantify positive outcomes and demonstrate curiosity and humility.',
      ],
      difficulty: 'Medium',
      answered: false,
    },
    {
      id: 'iq-5',
      category: 'HR',
      question: 'Walk me through your background and why you are targeting this Full Stack Developer position.',
      context: 'Standard opening question tailored to your profile.',
      suggestedPoints: [
        'Summarize your strong AI & Computer Science academic grounding.',
        'Highlight your practical hands-on experience building full stack systems (React, Python/FastAPI, TypeScript transition).',
        'Articulate genuine excitement about engineering scalable products.',
      ],
      difficulty: 'Easy',
      answered: false,
    },
  ];

  const demoAnalysis: AnalysisRecord = {
    id: demoAnalysisId,
    userId: demoUserId,
    targetRole: 'Full Stack Developer',
    jobTitle: 'Full Stack Developer at NextGen Scale Dynamics',
    createdAt: now,
    alignmentScore: 82,
    breakdown: {
      technicalSkills: 78,
      projects: 88,
      experience: 75,
      education: 92,
      certifications: 80,
      softSkills: 85,
    },
    matchedSkills: ['React', 'Git', 'REST API', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'SQL'],
    missingCriticalSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    missingPreferredSkills: ['AWS', 'Redis', 'CI/CD'],
    partialSkills: [
      {
        resumeSkill: 'SQL (SQLite)',
        jobSkill: 'PostgreSQL',
        reason: 'Strong SQL foundational knowledge readily bridges to PostgreSQL with minor dialect syntax learning.',
      },
      {
        resumeSkill: 'JavaScript',
        jobSkill: 'TypeScript',
        reason: 'Solid JavaScript fluency accelerates TypeScript static typing adoption.',
      },
    ],
    skillGaps: demoSkillGaps,
    roadmap: demoRoadmap,
    recommendedProjects: demoProjects,
    recommendedCertifications: demoCertifications,
    interviewQuestions: demoInterviewQuestions,
  };

  return {
    users: {
      [demoUserId]: demoUser,
    },
    resumes: {
      [demoUserId]: demoResume,
    },
    jobs: {
      'demo-job-1': demoJob,
    },
    analyses: {
      [demoAnalysisId]: demoAnalysis,
    },
  };
}

// Database helper operations
export const db = {
  getUserByEmail(email: string): User | null {
    const data = loadDatabase();
    const cleanEmail = email.toLowerCase().trim();
    for (const u of Object.values(data.users)) {
      if (u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
    return null;
  },

  getUserById(id: string): User | null {
    const data = loadDatabase();
    return data.users[id] || null;
  },

  createUser(user: User): User {
    const data = loadDatabase();
    data.users[user.id] = user;
    saveDatabase();
    return user;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const data = loadDatabase();
    if (!data.users[id]) return null;
    data.users[id] = { ...data.users[id], ...updates };
    saveDatabase();
    return data.users[id];
  },

  getResume(userId: string): ExtractedResume | null {
    const data = loadDatabase();
    return data.resumes[userId] || null;
  },

  saveResume(userId: string, resume: ExtractedResume): ExtractedResume {
    const data = loadDatabase();
    data.resumes[userId] = resume;
    saveDatabase();
    return resume;
  },

  saveJob(job: JobDescription): JobDescription {
    const data = loadDatabase();
    data.jobs[job.id] = job;
    saveDatabase();
    return job;
  },

  getJob(id: string): JobDescription | null {
    const data = loadDatabase();
    return data.jobs[id] || null;
  },

  getJobs(): JobDescription[] {
    const data = loadDatabase();
    return Object.values(data.jobs);
  },

  saveAnalysis(analysis: AnalysisRecord): AnalysisRecord {
    const data = loadDatabase();
    data.analyses[analysis.id] = analysis;
    saveDatabase();
    return analysis;
  },

  getAnalysis(id: string): AnalysisRecord | null {
    const data = loadDatabase();
    return data.analyses[id] || null;
  },

  getUserAnalyses(userId: string): AnalysisRecord[] {
    const data = loadDatabase();
    return Object.values(data.analyses)
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getLatestAnalysis(userId: string): AnalysisRecord | null {
    const list = this.getUserAnalyses(userId);
    return list.length > 0 ? list[0] : null;
  },

  updateRoadmapTask(analysisId: string, taskId: string, completed: boolean): RoadmapTask | null {
    const data = loadDatabase();
    const analysis = data.analyses[analysisId];
    if (!analysis) return null;
    const task = analysis.roadmap.find((t) => t.id === taskId);
    if (!task) return null;
    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : undefined;
    saveDatabase();
    return task;
  },

  updateCertificationStatus(
    analysisId: string,
    certId: string,
    status: 'Interested' | 'In Progress' | 'Completed'
  ): RecommendedCertification | null {
    const data = loadDatabase();
    const analysis = data.analyses[analysisId];
    if (!analysis) return null;
    const cert = analysis.recommendedCertifications.find((c) => c.id === certId);
    if (!cert) return null;
    cert.status = status;
    saveDatabase();
    return cert;
  },

  updateInterviewQuestionNotes(
    analysisId: string,
    questionId: string,
    notes: string,
    answered: boolean
  ): InterviewQuestion | null {
    const data = loadDatabase();
    const analysis = data.analyses[analysisId];
    if (!analysis) return null;
    const q = analysis.interviewQuestions.find((item) => item.id === questionId);
    if (!q) return null;
    q.userNotes = notes;
    q.answered = answered;
    saveDatabase();
    return q;
  },
};
