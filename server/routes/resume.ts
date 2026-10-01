import { Router, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { db, ExtractedResume } from '../db';
import { AuthenticatedRequest, requireAuth, optionalAuth } from './auth';
import { parseResumeWithAI, parseResumeFromImageWithAI } from '../ai';
import { parseResumeText } from '../nlp';

export const resumeRouter = Router();

// Configure Multer for in-memory file buffers (max 10MB)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.mimetype.startsWith('image/') ||
      file.originalname.match(/\.(pdf|docx|txt|doc|png|jpg|jpeg|webp)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, DOCX, TXT, or Image (PNG/JPG/WEBP).'));
    }
  },
});

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split('.').pop()?.toLowerCase();

  if (ext === 'txt' || file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8');
  }

  if (ext === 'docx' || file.mimetype.includes('wordprocessingml')) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (err) {
      console.warn('Mammoth docx parsing failed, falling back to buffer string:', err);
    }
  }

  if (ext === 'pdf' || file.mimetype === 'application/pdf') {
    try {
      // Basic text extraction for PDF streams: look for readable text chunks in PDF stream
      const bufferStr = file.buffer.toString('binary');
      // Look for standard stream blocks or text encoding
      const textMatches: string[] = [];
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let match;
      while ((match = streamRegex.exec(bufferStr)) !== null) {
        const streamData = match[1];
        // Extract readable ASCII
        const readable = streamData.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
        if (readable.length > 30) {
          textMatches.push(readable);
        }
      }
      if (textMatches.length > 0) {
        return textMatches.join('\n');
      }
    } catch (e) {
      console.warn('PDF stream extraction error:', e);
    }
    // Fallback: extract ASCII characters
    return file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }

  return file.buffer.toString('utf-8');
}

// POST /api/resume/upload (handles multipart file or raw text in JSON)
resumeRouter.post('/upload', optionalAuth, upload.single('resumeFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    let extractedData: ExtractedResume;

    // Check if uploaded file is an image
    if (req.file && (req.file.mimetype.startsWith('image/') || req.file.originalname.match(/\.(png|jpg|jpeg|webp)$/i))) {
      extractedData = await parseResumeFromImageWithAI(req.file.buffer, req.file.mimetype);
    } else {
      let rawText = '';
      if (req.file) {
        rawText = await extractTextFromFile(req.file);
      } else if (req.body.text && typeof req.body.text === 'string') {
        rawText = req.body.text;
      }

      if (!rawText || rawText.trim().length < 10) {
        return res.status(400).json({
          error: 'Resume text is empty or could not be extracted. Please paste your resume text manually or upload a clear PDF, DOCX, or Image (PNG/JPG).',
        });
      }

      // Parse resume using AI with deterministic NLP fallback
      extractedData = await parseResumeWithAI(rawText);
    }

    // Save to user's profile in database
    db.saveResume(userId, extractedData);

    return res.json({
      message: 'Resume parsed successfully',
      resume: extractedData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

// GET /api/resume
resumeRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : 'demo-user-1';
  const resume = db.getResume(userId);

  if (!resume) {
    return res.status(404).json({ error: 'No resume found. Please upload or paste a resume.' });
  }

  return res.json({ resume });
});

// PUT /api/resume (Save user edits to the extracted resume)
resumeRouter.put('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    const existing = db.getResume(userId) || ({} as ExtractedResume);

    const updatedResume: ExtractedResume = {
      name: req.body.name || existing.name || 'Candidate',
      email: req.body.email || existing.email || '',
      phone: req.body.phone || existing.phone || '',
      education: req.body.education || existing.education || '',
      degree: req.body.degree || existing.degree || '',
      skills: Array.isArray(req.body.skills) ? req.body.skills : existing.skills || [],
      programmingLanguages: Array.isArray(req.body.programmingLanguages) ? req.body.programmingLanguages : existing.programmingLanguages || [],
      frameworks: Array.isArray(req.body.frameworks) ? req.body.frameworks : existing.frameworks || [],
      databases: Array.isArray(req.body.databases) ? req.body.databases : existing.databases || [],
      cloudSkills: Array.isArray(req.body.cloudSkills) ? req.body.cloudSkills : existing.cloudSkills || [],
      tools: Array.isArray(req.body.tools) ? req.body.tools : existing.tools || [],
      softSkills: Array.isArray(req.body.softSkills) ? req.body.softSkills : existing.softSkills || [],
      projects: Array.isArray(req.body.projects) ? req.body.projects : existing.projects || [],
      certifications: Array.isArray(req.body.certifications) ? req.body.certifications : existing.certifications || [],
      experience: Array.isArray(req.body.experience) ? req.body.experience : existing.experience || [],
      rawText: req.body.rawText || existing.rawText || '',
      updatedAt: new Date().toISOString(),
    };

    db.saveResume(userId, updatedResume);
    return res.json({
      message: 'Resume profile saved successfully',
      resume: updatedResume,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update resume' });
  }
});
