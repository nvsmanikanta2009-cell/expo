import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import {
  User,
  AccessibilityProfile,
  TransformationRecord,
  TransformationStats,
  TaskType,
  AccessibilityNeed,
} from '../../shared/types/index.js';

dotenv.config();

const { Pool } = pg;

interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}

interface LocalDBData {
  users: Array<{
    id: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  }>;
  accessibility_profiles: Array<{
    id: string;
    user_id: string;
    visual_assistance: boolean;
    hearing_assistance: boolean;
    cognitive_assistance: boolean;
    reading_assistance: boolean;
    language_assistance: boolean;
    screen_reader_mode: boolean;
    preferred_language: string;
    created_at: string;
    updated_at: string;
  }>;
  transformations: Array<{
    id: string;
    user_id: string;
    task: string;
    accessibility_need: string;
    language: string;
    original_content: string;
    transformed_content: string | null;
    explanation: string | null;
    accessibility_score: number | null;
    ai_suggestions: any;
    created_at: string;
  }>;
  sessions: Array<{
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
    created_at: string;
  }>;
}

class DatabaseManager {
  private pool: pg.Pool | null = null;
  private isPostgres = false;
  private localDbPath: string;
  private localData: LocalDBData = {
    users: [],
    accessibility_profiles: [],
    transformations: [],
    sessions: [],
  };

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localDbPath = path.join(dataDir, 'database.json');
    this.loadLocalData();
  }

  private loadLocalData() {
    if (fs.existsSync(this.localDbPath)) {
      try {
        const raw = fs.readFileSync(this.localDbPath, 'utf8');
        this.localData = JSON.parse(raw);
      } catch (err) {
        console.warn('Error reading local JSON db, initializing fresh:', err);
      }
    } else {
      this.saveLocalData();
    }
  }

  private saveLocalData() {
    try {
      fs.writeFileSync(this.localDbPath, JSON.stringify(this.localData, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving local database:', err);
    }
  }

  async initialize() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim().length > 0) {
      try {
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });

        // Test connection
        const client = await this.pool.connect();
        try {
          await client.query('SELECT 1');
          console.log('✓ Successfully connected to PostgreSQL database');
          this.isPostgres = true;
          await this.runPostgresMigrations(client);
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('PostgreSQL connection failed. Falling back to embedded resilient storage:', err.message);
        this.isPostgres = false;
        this.pool = null;
      }
    } else {
      console.log('✓ Initialized embedded database engine (PostgreSQL compatible mode)');
    }
  }

  private async runPostgresMigrations(client: pg.PoolClient) {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS accessibility_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          visual_assistance BOOLEAN NOT NULL DEFAULT FALSE,
          hearing_assistance BOOLEAN NOT NULL DEFAULT FALSE,
          cognitive_assistance BOOLEAN NOT NULL DEFAULT FALSE,
          reading_assistance BOOLEAN NOT NULL DEFAULT FALSE,
          language_assistance BOOLEAN NOT NULL DEFAULT FALSE,
          screen_reader_mode BOOLEAN NOT NULL DEFAULT FALSE,
          preferred_language VARCHAR(50) NOT NULL DEFAULT 'English',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transformations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          task VARCHAR(100) NOT NULL,
          accessibility_need VARCHAR(100) NOT NULL,
          language VARCHAR(50) NOT NULL DEFAULT 'English',
          original_content TEXT NOT NULL,
          transformed_content TEXT,
          explanation TEXT,
          accessibility_score INTEGER,
          ai_suggestions JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transformations_user_id ON transformations(user_id);
      CREATE INDEX IF NOT EXISTS idx_transformations_created_at ON transformations(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
    `;
    await client.query(schemaSql);
    console.log('✓ PostgreSQL schemas and indexes verified');
  }

  // User Management
  async findUserByEmail(email: string): Promise<User & { passwordHash: string } | null> {
    const normalized = email.toLowerCase().trim();
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [normalized]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    } else {
      const user = this.localData.users.find((u) => u.email === normalized);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'SELECT id, email, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    } else {
      const user = this.localData.users.find((u) => u.id === id);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const normalized = email.toLowerCase().trim();

    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO users (id, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4)
         RETURNING id, email, created_at, updated_at`,
        [id, normalized, passwordHash, now]
      );
      const row = res.rows[0];
      // Also create default accessibility profile
      await this.upsertProfile(id, {
        visualAssistance: false,
        hearingAssistance: false,
        cognitiveAssistance: false,
        readingAssistance: false,
        languageAssistance: false,
        screenReaderMode: false,
        preferredLanguage: 'English',
      });
      return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    } else {
      const newUser = {
        id,
        email: normalized,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      };
      this.localData.users.push(newUser);
      this.saveLocalData();

      // Create default profile
      await this.upsertProfile(id, {
        visualAssistance: false,
        hearingAssistance: false,
        cognitiveAssistance: false,
        readingAssistance: false,
        languageAssistance: false,
        screenReaderMode: false,
        preferredLanguage: 'English',
      });

      return {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      };
    }
  }

  // Session Management
  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<SessionRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const expiresAtIso = expiresAt.toISOString();

    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, token_hash, expires_at, created_at`,
        [id, userId, tokenHash, expiresAtIso, now]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at.toISOString(),
        createdAt: row.created_at.toISOString(),
      };
    } else {
      const record = {
        id,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAtIso,
        created_at: now,
      };
      this.localData.sessions.push(record);
      this.saveLocalData();
      return {
        id: record.id,
        userId: record.user_id,
        tokenHash: record.token_hash,
        expiresAt: record.expires_at,
        createdAt: record.created_at,
      };
    }
  }

  async findSessionByToken(tokenHash: string): Promise<(SessionRecord & { user: User }) | null> {
    const nowIso = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT s.id, s.user_id, s.token_hash, s.expires_at, s.created_at,
                u.email, u.created_at as user_created_at, u.updated_at as user_updated_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > $2`,
        [tokenHash, nowIso]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at.toISOString(),
        createdAt: row.created_at.toISOString(),
        user: {
          id: row.user_id,
          email: row.email,
          createdAt: row.user_created_at.toISOString(),
          updatedAt: row.user_updated_at.toISOString(),
        },
      };
    } else {
      const session = this.localData.sessions.find(
        (s) => s.token_hash === tokenHash && s.expires_at > nowIso
      );
      if (!session) return null;
      const user = this.localData.users.find((u) => u.id === session.user_id);
      if (!user) return null;
      return {
        id: session.id,
        userId: session.user_id,
        tokenHash: session.token_hash,
        expiresAt: session.expires_at,
        createdAt: session.created_at,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    }
  }

  async deleteSession(tokenHash: string): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    } else {
      this.localData.sessions = this.localData.sessions.filter((s) => s.token_hash !== tokenHash);
      this.saveLocalData();
    }
  }

  // Accessibility Profile
  async getProfile(userId: string): Promise<AccessibilityProfile | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT id, user_id, visual_assistance, hearing_assistance, cognitive_assistance,
                reading_assistance, language_assistance, screen_reader_mode, preferred_language,
                created_at, updated_at
         FROM accessibility_profiles
         WHERE user_id = $1`,
        [userId]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        visualAssistance: row.visual_assistance,
        hearingAssistance: row.hearing_assistance,
        cognitiveAssistance: row.cognitive_assistance,
        readingAssistance: row.reading_assistance,
        languageAssistance: row.language_assistance,
        screenReaderMode: row.screen_reader_mode,
        preferredLanguage: row.preferred_language,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    } else {
      const p = this.localData.accessibility_profiles.find((item) => item.user_id === userId);
      if (!p) return null;
      return {
        id: p.id,
        userId: p.user_id,
        visualAssistance: p.visual_assistance,
        hearingAssistance: p.hearing_assistance,
        cognitiveAssistance: p.cognitive_assistance,
        readingAssistance: p.reading_assistance,
        languageAssistance: p.language_assistance,
        screenReaderMode: p.screen_reader_mode,
        preferredLanguage: p.preferred_language,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }
  }

  async upsertProfile(
    userId: string,
    data: {
      visualAssistance: boolean;
      hearingAssistance: boolean;
      cognitiveAssistance: boolean;
      readingAssistance: boolean;
      languageAssistance: boolean;
      screenReaderMode: boolean;
      preferredLanguage: string;
    }
  ): Promise<AccessibilityProfile> {
    const now = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO accessibility_profiles
          (id, user_id, visual_assistance, hearing_assistance, cognitive_assistance,
           reading_assistance, language_assistance, screen_reader_mode, preferred_language,
           created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         ON CONFLICT (user_id) DO UPDATE SET
           visual_assistance = EXCLUDED.visual_assistance,
           hearing_assistance = EXCLUDED.hearing_assistance,
           cognitive_assistance = EXCLUDED.cognitive_assistance,
           reading_assistance = EXCLUDED.reading_assistance,
           language_assistance = EXCLUDED.language_assistance,
           screen_reader_mode = EXCLUDED.screen_reader_mode,
           preferred_language = EXCLUDED.preferred_language,
           updated_at = EXCLUDED.updated_at
         RETURNING id, user_id, visual_assistance, hearing_assistance, cognitive_assistance,
                   reading_assistance, language_assistance, screen_reader_mode, preferred_language,
                   created_at, updated_at`,
        [
          userId,
          data.visualAssistance,
          data.hearingAssistance,
          data.cognitiveAssistance,
          data.readingAssistance,
          data.languageAssistance,
          data.screenReaderMode,
          data.preferredLanguage || 'English',
          now,
        ]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        visualAssistance: row.visual_assistance,
        hearingAssistance: row.hearing_assistance,
        cognitiveAssistance: row.cognitive_assistance,
        readingAssistance: row.reading_assistance,
        languageAssistance: row.language_assistance,
        screenReaderMode: row.screen_reader_mode,
        preferredLanguage: row.preferred_language,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    } else {
      let existingIndex = this.localData.accessibility_profiles.findIndex(
        (p) => p.user_id === userId
      );
      if (existingIndex >= 0) {
        this.localData.accessibility_profiles[existingIndex] = {
          ...this.localData.accessibility_profiles[existingIndex],
          visual_assistance: data.visualAssistance,
          hearing_assistance: data.hearingAssistance,
          cognitive_assistance: data.cognitiveAssistance,
          reading_assistance: data.readingAssistance,
          language_assistance: data.languageAssistance,
          screen_reader_mode: data.screenReaderMode,
          preferred_language: data.preferredLanguage || 'English',
          updated_at: now,
        };
      } else {
        this.localData.accessibility_profiles.push({
          id: uuidv4(),
          user_id: userId,
          visual_assistance: data.visualAssistance,
          hearing_assistance: data.hearingAssistance,
          cognitive_assistance: data.cognitiveAssistance,
          reading_assistance: data.readingAssistance,
          language_assistance: data.languageAssistance,
          screen_reader_mode: data.screenReaderMode,
          preferred_language: data.preferredLanguage || 'English',
          created_at: now,
          updated_at: now,
        });
        existingIndex = this.localData.accessibility_profiles.length - 1;
      }
      this.saveLocalData();
      const p = this.localData.accessibility_profiles[existingIndex];
      return {
        id: p.id,
        userId: p.user_id,
        visualAssistance: p.visual_assistance,
        hearingAssistance: p.hearing_assistance,
        cognitiveAssistance: p.cognitive_assistance,
        readingAssistance: p.reading_assistance,
        languageAssistance: p.language_assistance,
        screenReaderMode: p.screen_reader_mode,
        preferredLanguage: p.preferred_language,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }
  }

  // Transformations & History (Strict User Isolation)
  async createTransformation(params: {
    userId: string;
    task: TaskType;
    accessibilityNeed: AccessibilityNeed;
    language: string;
    originalContent: string;
    transformedContent: string | null;
    explanation: string | null;
    accessibilityScore: number | null;
    aiSuggestions: any;
  }): Promise<TransformationRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();

    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO transformations
          (id, user_id, task, accessibility_need, language, original_content,
           transformed_content, explanation, accessibility_score, ai_suggestions, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          id,
          params.userId,
          params.task,
          params.accessibilityNeed,
          params.language,
          params.originalContent,
          params.transformedContent,
          params.explanation,
          params.accessibilityScore,
          JSON.stringify(params.aiSuggestions),
          now,
        ]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        task: row.task as TaskType,
        accessibilityNeed: row.accessibility_need as AccessibilityNeed,
        language: row.language,
        originalContent: row.original_content,
        transformedContent: row.transformed_content,
        explanation: row.explanation,
        accessibilityScore: row.accessibility_score,
        aiSuggestions: row.ai_suggestions,
        createdAt: row.created_at.toISOString(),
      };
    } else {
      const record = {
        id,
        user_id: params.userId,
        task: params.task,
        accessibility_need: params.accessibilityNeed,
        language: params.language,
        original_content: params.originalContent,
        transformed_content: params.transformedContent,
        explanation: params.explanation,
        accessibility_score: params.accessibilityScore,
        ai_suggestions: params.aiSuggestions,
        created_at: now,
      };
      this.localData.transformations.unshift(record);
      this.saveLocalData();
      return {
        id: record.id,
        userId: record.user_id,
        task: record.task as TaskType,
        accessibilityNeed: record.accessibility_need as AccessibilityNeed,
        language: record.language,
        originalContent: record.original_content,
        transformedContent: record.transformed_content,
        explanation: record.explanation,
        accessibilityScore: record.accessibility_score,
        aiSuggestions: record.ai_suggestions,
        createdAt: record.created_at,
      };
    }
  }

  async getTransformationsByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<TransformationRecord[]> {
    // Isolated by userId
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT id, user_id, task, accessibility_need, language, original_content,
                transformed_content, explanation, accessibility_score, ai_suggestions, created_at
         FROM transformations
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        task: row.task as TaskType,
        accessibilityNeed: row.accessibility_need as AccessibilityNeed,
        language: row.language,
        originalContent: row.original_content,
        transformedContent: row.transformed_content,
        explanation: row.explanation,
        accessibilityScore: row.accessibility_score,
        aiSuggestions: row.ai_suggestions,
        createdAt: row.created_at.toISOString(),
      }));
    } else {
      const filtered = this.localData.transformations
        .filter((t) => t.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(offset, offset + limit);

      return filtered.map((t) => ({
        id: t.id,
        userId: t.user_id,
        task: t.task as TaskType,
        accessibilityNeed: t.accessibility_need as AccessibilityNeed,
        language: t.language,
        originalContent: t.original_content,
        transformedContent: t.transformed_content,
        explanation: t.explanation,
        accessibilityScore: t.accessibility_score,
        aiSuggestions: t.ai_suggestions,
        createdAt: t.created_at,
      }));
    }
  }

  async getTransformationByIdAndUser(
    id: string,
    userId: string
  ): Promise<TransformationRecord | null> {
    // Strictly enforces ownership check: WHERE id = $1 AND user_id = $2
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT id, user_id, task, accessibility_need, language, original_content,
                transformed_content, explanation, accessibility_score, ai_suggestions, created_at
         FROM transformations
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        task: row.task as TaskType,
        accessibilityNeed: row.accessibility_need as AccessibilityNeed,
        language: row.language,
        originalContent: row.original_content,
        transformedContent: row.transformed_content,
        explanation: row.explanation,
        accessibilityScore: row.accessibility_score,
        aiSuggestions: row.ai_suggestions,
        createdAt: row.created_at.toISOString(),
      };
    } else {
      const record = this.localData.transformations.find(
        (t) => t.id === id && t.user_id === userId
      );
      if (!record) return null;
      return {
        id: record.id,
        userId: record.user_id,
        task: record.task as TaskType,
        accessibilityNeed: record.accessibility_need as AccessibilityNeed,
        language: record.language,
        originalContent: record.original_content,
        transformedContent: record.transformed_content,
        explanation: record.explanation,
        accessibilityScore: record.accessibility_score,
        aiSuggestions: record.ai_suggestions,
        createdAt: record.created_at,
      };
    }
  }

  async deleteTransformationByIdAndUser(id: string, userId: string): Promise<boolean> {
    // Strictly enforces ownership check
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'DELETE FROM transformations WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return (res.rowCount ?? 0) > 0;
    } else {
      const prevLen = this.localData.transformations.length;
      this.localData.transformations = this.localData.transformations.filter(
        (t) => !(t.id === id && t.user_id === userId)
      );
      if (this.localData.transformations.length < prevLen) {
        this.saveLocalData();
        return true;
      }
      return false;
    }
  }

  async getStatsByUser(userId: string): Promise<TransformationStats> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT task, accessibility_score
         FROM transformations
         WHERE user_id = $1`,
        [userId]
      );
      const rows = res.rows;
      const total = rows.length;
      if (total === 0) {
        return {
          totalTransformations: 0,
          averageScore: 0,
          mostFrequentTask: null,
          tasksBreakdown: {},
        };
      }
      let sumScore = 0;
      let scoredCount = 0;
      const breakdown: Record<string, number> = {};
      for (const row of rows) {
        if (row.accessibility_score !== null) {
          sumScore += Number(row.accessibility_score);
          scoredCount++;
        }
        breakdown[row.task] = (breakdown[row.task] || 0) + 1;
      }
      const mostFrequent = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return {
        totalTransformations: total,
        averageScore: scoredCount > 0 ? Math.round(sumScore / scoredCount) : 0,
        mostFrequentTask: mostFrequent,
        tasksBreakdown: breakdown,
      };
    } else {
      const userTransforms = this.localData.transformations.filter((t) => t.user_id === userId);
      const total = userTransforms.length;
      if (total === 0) {
        return {
          totalTransformations: 0,
          averageScore: 0,
          mostFrequentTask: null,
          tasksBreakdown: {},
        };
      }
      let sumScore = 0;
      let scoredCount = 0;
      const breakdown: Record<string, number> = {};
      for (const t of userTransforms) {
        if (t.accessibility_score !== null) {
          sumScore += Number(t.accessibility_score);
          scoredCount++;
        }
        breakdown[t.task] = (breakdown[t.task] || 0) + 1;
      }
      const mostFrequent = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return {
        totalTransformations: total,
        averageScore: scoredCount > 0 ? Math.round(sumScore / scoredCount) : 0,
        mostFrequentTask: mostFrequent,
        tasksBreakdown: breakdown,
      };
    }
  }
}

export const db = new DatabaseManager();
