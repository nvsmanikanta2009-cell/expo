-- ============================================================================
-- Supabase Cloud PostgreSQL Migration: 001_initial_schema.sql
-- Project: AI-Powered Accessibility & Inclusion Assistant
-- Description: Table schemas, indexes, triggers, Row Level Security (RLS)
--              policies, and initial seed data.
-- ============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accessibility Profiles Table
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

-- Transformations (AI Tasks & History) Table
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
    ai_suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions Table (JWT / Refresh tokens & state)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accessibility_profiles_user_id ON accessibility_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transformations_user_id ON transformations(user_id);
CREATE INDEX IF NOT EXISTS idx_transformations_created_at ON transformations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transformations_task ON transformations(task);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- 4. AUTOMATIC TIMESTAMP TRIGGER (updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_accessibility_profiles_updated_at ON accessibility_profiles;
CREATE TRIGGER trg_accessibility_profiles_updated_at
    BEFORE UPDATE ON accessibility_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 5.1 Service Role Policies (Backend service role key has full access to all operations)
DROP POLICY IF EXISTS "Service role full access on users" ON users;
CREATE POLICY "Service role full access on users"
    ON users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on accessibility_profiles" ON accessibility_profiles;
CREATE POLICY "Service role full access on accessibility_profiles"
    ON accessibility_profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on transformations" ON transformations;
CREATE POLICY "Service role full access on transformations"
    ON transformations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on sessions" ON sessions;
CREATE POLICY "Service role full access on sessions"
    ON sessions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5.2 Authenticated User Policies (Individual logged-in users only access their own records)
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON accessibility_profiles;
CREATE POLICY "Users can read own profile"
    ON accessibility_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON accessibility_profiles;
CREATE POLICY "Users can insert own profile"
    ON accessibility_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON accessibility_profiles;
CREATE POLICY "Users can update own profile"
    ON accessibility_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transformations" ON transformations;
CREATE POLICY "Users can view own transformations"
    ON transformations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transformations" ON transformations;
CREATE POLICY "Users can insert own transformations"
    ON transformations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transformations" ON transformations;
CREATE POLICY "Users can delete own transformations"
    ON transformations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions"
    ON sessions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5.3 Public / Anon Policies (Registration and authentication)
DROP POLICY IF EXISTS "Allow anon signup" ON users;
CREATE POLICY "Allow anon signup"
    ON users FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon login lookup" ON users;
CREATE POLICY "Allow anon login lookup"
    ON users FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow anon session creation" ON sessions;
CREATE POLICY "Allow anon session creation"
    ON sessions FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================================================
-- 6. SEED DATA
-- ============================================================================

-- Seed 1: Demo User (Credentials: demo@accessibility.ai / DemoUser123!)
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@accessibility.ai',
    '$2b$10$L9nM1IW2Ef4k2RW01jld2O4sCR6aJwd0suHKwpBGoHj4tQz2IfF9u',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Seed 2: Admin User (Credentials: admin@accessibility.ai / AdminPass123!)
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'admin@accessibility.ai',
    '$2b$10$HS2YEeDYC.3ImcWjVVhdiuGhgfLMd9wmoyKOyPc9hDRh6hKuKD4Cu',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Seed Accessibility Profiles for Demo and Admin
INSERT INTO accessibility_profiles (
    id,
    user_id,
    visual_assistance,
    hearing_assistance,
    cognitive_assistance,
    reading_assistance,
    language_assistance,
    screen_reader_mode,
    preferred_language,
    created_at,
    updated_at
)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    'English',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO accessibility_profiles (
    id,
    user_id,
    visual_assistance,
    hearing_assistance,
    cognitive_assistance,
    reading_assistance,
    language_assistance,
    screen_reader_mode,
    preferred_language,
    created_at,
    updated_at
)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    'English',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Seed Sample Transformation Records for Demo User
INSERT INTO transformations (
    id,
    user_id,
    task,
    accessibility_need,
    language,
    original_content,
    transformed_content,
    explanation,
    accessibility_score,
    ai_suggestions,
    created_at
)
VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'simplify',
    'cognitive',
    'English',
    'The multidimensional pedagogical paradigms implemented across tertiary educational institutions necessitate thorough empirical evaluation regarding cognitive load reduction.',
    'Universities and colleges need to test and prove whether their new teaching methods truly make learning simpler and easier for students to understand.',
    'Complex academic terminology was converted into plain, active voice language with short sentences for improved readability.',
    94,
    '["Use bulleted lists for multi-clause arguments", "Avoid Latinate academic jargon"]'::jsonb,
    NOW() - INTERVAL '2 hours'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'screen_reader',
    'visual',
    'English',
    'Click here to review terms. Download button is on the top right. Contact support at info@example.com.',
    '# Document Navigation\n\nLink: Review the full Terms and Conditions (opens in new tab).\nButton: Download document PDF.\nContact Email: support email info@example.com.',
    'Vague hyperlink references like "click here" were replaced with descriptive landmarks and semantic headings.',
    98,
    '["Always ensure hyperlinks have unique, descriptive labels", "Structure actions with clear semantic headings"]'::jsonb,
    NOW() - INTERVAL '1 hour'
)
ON CONFLICT (id) DO NOTHING;
