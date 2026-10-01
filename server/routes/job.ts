import { Router, type Response } from 'express';
import multer from 'multer';
import { db } from '../db.ts';
import { type AuthenticatedRequest, optionalAuth } from './auth.ts';
import { parseJobWithAI, parseJobFromImageWithAI } from '../ai.ts';

export const jobRouter = Router();

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/jobs/analyze (Parse job description from pasted text or uploaded file / image)
jobRouter.post('/analyze', optionalAuth, upload.single('jobFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobTitleOverride = req.body.title || '';
    let job;

    if (req.file && (req.file.mimetype.startsWith('image/') || req.file.originalname.match(/\.(png|jpg|jpeg|webp)$/i))) {
      job = await parseJobFromImageWithAI(req.file.buffer, req.file.mimetype, jobTitleOverride);
    } else {
      let rawText = '';
      if (req.file) {
        rawText = req.file.buffer.toString('utf-8');
      } else if (req.body.text && typeof req.body.text === 'string') {
        rawText = req.body.text;
      }

      if (!rawText || rawText.trim().length < 15) {
        return res.status(400).json({
          error: 'Job description is too short or empty. Please paste or upload a detailed job description or screenshot.',
        });
      }

      job = await parseJobWithAI(rawText, jobTitleOverride);
    }

    if (req.body.company) {
      job.company = req.body.company;
    }

    db.saveJob(job);

    return res.json({
      message: 'Job description analyzed successfully',
      job,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to analyze job description' });
  }
});

// GET /api/jobs (Retrieve all saved/sample jobs)
jobRouter.get('/', (req, res) => {
  const jobs = db.getJobs();
  return res.json({ jobs });
});

// GET /api/jobs/:id
jobRouter.get('/:id', (req, res) => {
  const job = db.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json({ job });
});
