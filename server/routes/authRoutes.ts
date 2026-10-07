import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import {
  hashPassword,
  verifyPassword,
  createSessionForUser,
  invalidateSession,
  requireAuth,
  AuthenticatedRequest,
} from '../auth/index.js';
import { signupSchema, loginSchema } from '../../shared/schemas/index.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await db.createUser(email, passwordHash);
    const { token } = await createSessionForUser(user.id);

    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.status(201).json({
      user,
      token,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    const userWithHash = await db.findUserByEmail(email);
    if (!userWithHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await verifyPassword(password, userWithHash.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { token } = await createSessionForUser(userWithHash.id);
    const user = {
      id: userWithHash.id,
      email: userWithHash.email,
      createdAt: userWithHash.createdAt,
      updatedAt: userWithHash.updatedAt,
    };

    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user,
      token,
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let token = req.cookies?.session_token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (token) {
      await invalidateSession(token);
    }

    res.clearCookie('session_token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

export default router;
