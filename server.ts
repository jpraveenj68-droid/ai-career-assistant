import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth';
import { resumeRouter } from './server/routes/resume';
import { jobRouter } from './server/routes/job';
import { analysisRouter } from './server/routes/analysis';
import { interactiveRouter } from './server/routes/interactive';
import { voiceRouter } from './server/routes/voice';
import { isAIAvailable } from './server/ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Basic parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and AI status check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AI Career Assistant',
    tagline: 'Know Your Fit. Close Your Skill Gaps. Build Your Career.',
    aiProvider: isAIAvailable() ? 'gemini-3.8-flash' : 'local-nlp-deterministic-engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routers
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/voice', voiceRouter);
app.use('/api', interactiveRouter);

// Set up Vite in dev, or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Career Assistant] Server operational on port ${PORT}`);
    console.log(`[AI Engine] Active provider: ${isAIAvailable() ? 'Gemini 3.8 Flash' : 'Local NLP Deterministic'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
