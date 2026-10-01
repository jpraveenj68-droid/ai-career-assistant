# AI Career Assistant
> **“Know Your Fit. Close Your Skill Gaps. Build Your Career.”**

---

## 1. Overview & Architecture

**AI Career Assistant** is a real-time Career Intelligence Command Center designed for students, job seekers, and career changers. It bridges the gap between raw candidate resumes and complex modern job descriptions through:

1. **Intelligent Ingestion**: Extracts languages, frameworks, databases, cloud skills, projects, and soft skills from PDF, DOCX, TXT, or pasted text.
2. **Dual-Engine Matching (Deterministic NLP + Gemini 3.8 Flash)**:
   - **Local Deterministic NLP Engine**: Implements tokenization, stop-word removal, 500+ technical skill canonical dictionary, alias normalization (e.g. `JS` → `JavaScript`, `Postgres` → `PostgreSQL`), TF-IDF vectorization, and Cosine Similarity calculation.
   - **Gemini 3.8 Flash Engine**: If `GEMINI_API_KEY` is provided, enhances project portfolio recommendations, generates hyper-tailored interview simulations, and synthesizes nuanced roadmaps.
   - **Zero-Failure Architecture**: If Gemini is unreachable or no key is configured, the application falls back immediately to the deterministic NLP engine without breaking the user experience.
3. **Transparent Weighted Fit Formula ("Profile-to-Job Alignment")**:
   - Technical Skills: 50%
   - Projects: 15%
   - Experience: 15%
   - Education: 10%
   - Certifications: 5%
   - Soft Skills: 5%
4. **Actionable Career Development**:
   - **Skill Gap Matrix**: Categorizes requirements into Strengths, Critical Gaps, and Nice-to-Have Gaps with delta and estimated learning days.
   - **Personalized 6-Week Learning Roadmap**: Interactive timeline with real-time completion tracking, practice tasks, and mini-projects.
   - **Curated Gap-Closing Projects**: Architectures designed to prove competence in missing technologies.
   - **Industry Certifications**: High-yield credential tracks with status toggles (Interested / In Progress / Completed).
   - **Interview Prep Simulator**: Technical, Project-specific, Behavioral, and HR questions with model answers and note saving.
   - **Visual Analytics**: Interactive Recharts radar charts, growth trajectories, and alignment velocity.

---

## 2. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti.
- **Backend**: Express (Node.js/TypeScript via `tsx`), Multer, Mammoth for DOCX, JWT authentication, Bcrypt.
- **AI / NLP**: `@google/genai` (Gemini 3.8 Flash) + Deterministic TF-IDF Cosine Similarity & Skill Dictionary.
- **Persistence**: Relational SQLite/JSON schema with auto-seed demo profiles in `data/career_assistant_db.json`.
- **Deployment**: Multi-stage `Dockerfile`, `docker-compose.yml`.

---

## 3. Demo Credentials (1-Click Evaluation)

- **One-Click Demo Button**: Click **"Try Demo"** on the landing page or sign-in page to instantly load the pre-configured candidate profile and benchmark job.
- **Manual Demo Login**:
  - **Email**: `demo@careerassistant.ai`
  - **Password**: `demo123`
- **Preloaded Profile**:
  - **Candidate**: Praveen Kumar (B.Tech in AI & Data Science)
  - **Strengths**: Python, Java, React, SQL, Git, FastAPI, Machine Learning, REST API
  - **Projects**: AI Blood Demand Prediction System, PulseVote Live Polling, SplitSphere
  - **Target Role**: Full Stack Developer at NextGen Scale Dynamics

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js 20+ installed
- npm 9+ installed

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
```env
PORT=3000
NODE_ENV=development
# GEMINI_API_KEY: Optional. If present, activates Gemini 3.8 Flash reasoning.
# If omitted or invalid, the app operates using the deterministic NLP engine.
GEMINI_API_KEY="YOUR_KEY_HERE"
JWT_SECRET="career-assistant-secure-jwt-key-2026"
```

### Step 3: Run Full-Stack Development Server
Runs Express on port 3000 with Vite middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Docker Deployment

### Run with Docker Compose
```bash
docker-compose up --build
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 6. REST API Documentation

### Authentication
- `POST /api/auth/register` — Create candidate profile
- `POST /api/auth/login` — Sign in with credentials
- `POST /api/auth/demo` — 1-click evaluator login
- `GET /api/auth/me` — Retrieve active session profile
- `PUT /api/auth/profile` — Update candidate target goals

### Resume Processing
- `POST /api/resume/upload` — Upload PDF/DOCX/TXT or raw text
- `GET /api/resume` — Fetch extracted resume profile
- `PUT /api/resume` — Update and edit parsed sections

### Job Analysis
- `POST /api/jobs/analyze` — Parse job description text or file
- `GET /api/jobs` — Retrieve sample & analyzed jobs
- `GET /api/jobs/:id` — Get single job details

### Matching & Career Intelligence
- `POST /api/analysis` — Execute dual-engine alignment matching
- `GET /api/analysis/recent` — Historical alignment records
- `GET /api/analysis/:id` — Specific analysis details
- `GET /api/analysis/dashboard/summary` — Aggregated dashboard metrics
- `GET /api/analysis/skills/overview` — Skill taxonomy breakdown

### Interactive Modules
- `GET /api/roadmap` — Fetch personalized 6-week curriculum
- `POST /api/roadmap/:id/complete` — Toggle task completion (recalculates progress in real time)
- `GET /api/projects/recommendations` — Fetch curated portfolio projects
- `GET /api/certifications` — Recommended certification pathways
- `POST /api/certifications/:id/status` — Update cert status (`Interested`, `In Progress`, `Completed`)
- `GET /api/interview/questions` — Retrieve tailored mock interview questions
- `POST /api/interview/notes` — Save practice scripts and answers
