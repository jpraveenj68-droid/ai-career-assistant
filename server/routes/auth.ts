import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User } from '../db';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'career-assistant-secure-jwt-key-2026';

// Middleware to extract authenticated user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Optional Auth (for demo or guest actions)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore
    }
  }
  next();
}

function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, education, graduationYear, preferredRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      education: education || 'Undergraduate in Computer Science / Engineering',
      graduationYear: graduationYear || '2026',
      preferredRole: preferredRole || 'Full Stack Developer',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // For demo account fallback or bcrypt check
    let validPassword = false;
    if (user.id === 'demo-user-1' && password === 'demo123') {
      validPassword = true;
    } else {
      validPassword = await bcrypt.compare(password, user.passwordHash);
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /api/auth/demo (1-Click Demo Login)
authRouter.post('/demo', (req: Request, res: Response) => {
  try {
    let demoUser = db.getUserById('demo-user-1');
    if (!demoUser) {
      demoUser = db.createUser({
        id: 'demo-user-1',
        name: 'Praveen Kumar',
        email: 'demo@careerassistant.ai',
        passwordHash: 'demohash',
        education: 'B.Tech in Artificial Intelligence & Data Science',
        graduationYear: '2026',
        preferredRole: 'Full Stack Developer',
        createdAt: new Date().toISOString(),
      });
    }

    const token = generateToken(demoUser);
    const { passwordHash: _, ...safeUser } = demoUser;
    return res.json({
      message: 'Logged in as Demo Candidate',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Demo login failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user!;
  return res.json({ user: safeUser });
});

// PUT /api/auth/profile
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, education, graduationYear, preferredRole } = req.body;
    const updated = db.updateUser(req.user!.id, {
      name: name ?? req.user!.name,
      education: education ?? req.user!.education,
      graduationYear: graduationYear ?? req.user!.graduationYear,
      preferredRole: preferredRole ?? req.user!.preferredRole,
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...safeUser } = updated;
    return res.json({ user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});
