import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, optionalAuth } from './auth';

export const interactiveRouter = Router();

// GET /api/roadmap
interactiveRouter.get('/roadmap', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
  if (!analysis) return res.status(404).json({ error: 'No roadmap found' });

  const completedCount = analysis.roadmap.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / (analysis.roadmap.length || 1)) * 100);

  return res.json({
    analysisId: analysis.id,
    targetRole: analysis.targetRole,
    roadmap: analysis.roadmap,
    progressPercent,
    completedCount,
    totalCount: analysis.roadmap.length,
  });
});

// POST /api/roadmap/:id/complete (Toggle task completion)
interactiveRouter.post('/roadmap/:id/complete', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
    if (!analysis) return res.status(404).json({ error: 'No analysis found' });

    const taskId = req.params.id;
    const completed = req.body.completed !== undefined ? Boolean(req.body.completed) : true;

    const updatedTask = db.updateRoadmapTask(analysis.id, taskId, completed);
    if (!updatedTask) return res.status(404).json({ error: 'Roadmap task not found' });

    // Recalculate progress
    const freshAnalysis = db.getAnalysis(analysis.id)!;
    const completedCount = freshAnalysis.roadmap.filter((t) => t.completed).length;
    const progressPercent = Math.round((completedCount / freshAnalysis.roadmap.length) * 100);

    return res.json({
      message: `Task marked as ${completed ? 'completed' : 'pending'}`,
      task: updatedTask,
      progressPercent,
      completedCount,
      totalCount: freshAnalysis.roadmap.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update task' });
  }
});

// GET /api/projects/recommendations
interactiveRouter.get('/projects/recommendations', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
  return res.json({
    projects: analysis?.recommendedProjects || [],
  });
});

// GET /api/certifications
interactiveRouter.get('/certifications', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
  return res.json({
    certifications: analysis?.recommendedCertifications || [],
  });
});

// POST /api/certifications/:id/status
interactiveRouter.post('/certifications/:id/status', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
    if (!analysis) return res.status(404).json({ error: 'No analysis found' });

    const certId = req.params.id;
    const status = req.body.status as 'Interested' | 'In Progress' | 'Completed';

    const updated = db.updateCertificationStatus(analysis.id, certId, status);
    if (!updated) return res.status(404).json({ error: 'Certification not found' });

    return res.json({
      message: 'Certification status updated',
      certification: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update certification status' });
  }
});

// GET /api/interview/questions
interactiveRouter.get('/interview/questions', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
  return res.json({
    targetRole: analysis?.targetRole || 'Full Stack Developer',
    questions: analysis?.interviewQuestions || [],
  });
});

// POST /api/interview/notes (Save candidate practice answers / notes)
interactiveRouter.post('/interview/notes', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');
    if (!analysis) return res.status(404).json({ error: 'No analysis found' });

    const { questionId, notes, answered } = req.body;
    const updated = db.updateInterviewQuestionNotes(analysis.id, questionId, notes, answered);
    return res.json({ message: 'Interview progress saved', question: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save notes' });
  }
});
