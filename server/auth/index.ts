import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { User } from '../../shared/types/index.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSessionForUser(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.createSession(userId, tokenHash, expiresAt);
  return { token, expiresAt };
}

export async function invalidateSession(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await db.deleteSession(tokenHash);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.session_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const tokenHash = hashSessionToken(token);
    const session = await db.findSessionByToken(tokenHash);

    if (!session) {
      res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
      return;
    }

    req.user = session.user;
    req.sessionToken = token;
    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.session_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (token) {
      const tokenHash = hashSessionToken(token);
      const session = await db.findSessionByToken(tokenHash);
      if (session) {
        req.user = session.user;
        req.sessionToken = token;
      }
    }
    next();
  } catch (err) {
    next();
  }
}
