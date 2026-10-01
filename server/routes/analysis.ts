import { Router, type Response } from 'express';
import { db, type AnalysisRecord, type ExtractedResume, type JobDescription } from '../db.ts';
import { type AuthenticatedRequest, optionalAuth, requireAuth } from './auth.ts';
import { runComprehensiveAnalysis } from '../ai.ts';

export const analysisRouter = Router();

// POST /api/analysis (Trigger full skill matching & gap analysis)
analysisRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';

    // Get candidate resume (from body or user record)
    let resume: ExtractedResume | null = null;
    if (req.body.resume) {
      resume = req.body.resume;
    } else {
      resume = db.getResume(userId);
    }

    if (!resume) {
      return res.status(400).json({
        error: 'Please upload or save your resume before running career analysis.',
      });
    }

    // Get target job description (from body or job ID)
    let job: JobDescription | null = null;
    if (req.body.jobId) {
      job = db.getJob(req.body.jobId);
    } else if (req.body.job) {
      job = req.body.job;
    }

    if (!job) {
      // Default to the demo job if not provided
      job = db.getJob('demo-job-1');
    }

    if (!job) {
      return res.status(400).json({
        error: 'No job description provided for analysis.',
      });
    }

    // Run comprehensive AI / NLP pipeline
    const matchResults = await runComprehensiveAnalysis(resume, job);

    const analysisId = `analysis-${Date.now()}`;
    const analysisRecord: AnalysisRecord = {
      id: analysisId,
      userId,
      targetRole: job.title || 'Full Stack Developer',
      jobTitle: `${job.title} ${job.company ? 'at ' + job.company : ''}`.trim(),
      createdAt: new Date().toISOString(),
      alignmentScore: matchResults.alignmentScore,
      breakdown: matchResults.breakdown,
      matchedSkills: matchResults.matchedSkills,
      missingCriticalSkills: matchResults.missingCriticalSkills,
      missingPreferredSkills: matchResults.missingPreferredSkills,
      partialSkills: matchResults.partialSkills,
      skillGaps: matchResults.skillGaps,
      roadmap: matchResults.roadmap,
      recommendedProjects: matchResults.recommendedProjects,
      recommendedCertifications: matchResults.recommendedCertifications,
      interviewQuestions: matchResults.interviewQuestions,
    };

    db.saveAnalysis(analysisRecord);

    return res.status(201).json({
      message: 'Analysis completed successfully',
      analysis: analysisRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Analysis failed to execute' });
  }
});

// GET /api/analysis/recent
analysisRouter.get('/recent', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const list = db.getUserAnalyses(userId);
  return res.json({ analyses: list });
});

// GET /api/analysis/:id
analysisRouter.get('/:id', (req, res) => {
  const analysis = db.getAnalysis(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  return res.json({ analysis });
});

// GET /api/dashboard (Full metrics aggregate)
analysisRouter.get('/dashboard/summary', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const resume = db.getResume(userId);
  const analyses = db.getUserAnalyses(userId);
  const latestAnalysis = analyses[0] || db.getAnalysis('demo-analysis-1');

  // Compute metrics
  const skillsDetected = resume?.skills?.length || 11;
  const jobsAnalyzed = Math.max(analyses.length, 1);
  const skillsMatched = latestAnalysis?.matchedSkills?.length || 7;
  const skillGaps = (latestAnalysis?.missingCriticalSkills?.length || 0) + (latestAnalysis?.missingPreferredSkills?.length || 0);

  // Roadmap progress
  let roadmapProgress = 0;
  if (latestAnalysis?.roadmap?.length) {
    const completedTasks = latestAnalysis.roadmap.filter((t) => t.completed).length;
    roadmapProgress = Math.round((completedTasks / latestAnalysis.roadmap.length) * 100);
  }

  // Career readiness score
  const readinessScore = latestAnalysis ? latestAnalysis.alignmentScore : 78;

  return res.json({
    readinessScore,
    quickStats: {
      skillsDetected,
      jobsAnalyzed,
      skillsMatched,
      skillGaps,
      roadmapProgress,
    },
    currentTargetRole: {
      role: latestAnalysis?.targetRole || 'Full Stack Developer',
      company: latestAnalysis?.jobTitle || 'Tech Leader',
      matchScore: latestAnalysis?.alignmentScore || 82,
      missingSkillsCount: latestAnalysis?.missingCriticalSkills?.length || 4,
      recommendedLearningCount: latestAnalysis?.roadmap?.length || 6,
    },
    latestAnalysis,
    recentAnalyses: analyses.slice(0, 5),
  });
});

// GET /api/skills (User's extracted and matched skills)
analysisRouter.get('/skills/overview', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const resume = db.getResume(userId);
  const latest = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');

  return res.json({
    resumeSkills: resume?.skills || [],
    programmingLanguages: resume?.programmingLanguages || [],
    frameworks: resume?.frameworks || [],
    databases: resume?.databases || [],
    cloudSkills: resume?.cloudSkills || [],
    tools: resume?.tools || [],
    softSkills: resume?.softSkills || [],
    skillGaps: latest?.skillGaps || [],
    matchedSkills: latest?.matchedSkills || [],
  });
});
