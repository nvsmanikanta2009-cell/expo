#!/usr/bin/env node
/**
 * ============================================================================
 * Supabase Database Migration Runner
 * ============================================================================
 * This script applies /supabase/migrations/001_initial_schema.sql to Supabase.
 * It uses the service role key and/or direct PostgreSQL connection string.
 *
 * Usage:
 *   node scripts/migrate.js
 *   npm run db:migrate
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from server/.env then .env
const serverEnvPath = path.join(rootDir, 'server', '.env');
const rootEnvPath = path.join(rootDir, '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: false });
}

const { Pool } = pg;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://llfipvxhlfuqvkihinrc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

console.log('\n============================================================');
console.log('🚀 SUPABASE MIGRATION RUNNER');
console.log('============================================================');
console.log(`Supabase Project URL : ${SUPABASE_URL}`);
console.log(`Service Role Key     : ${SUPABASE_SERVICE_ROLE_KEY ? 'Present (configured)' : 'MISSING'}`);
console.log(`Database URL         : ${DATABASE_URL ? 'Configured' : 'Not set in .env'}`);
console.log('------------------------------------------------------------\n');

// 1. Locate migration file
const migrationFilePath = path.join(rootDir, 'supabase', 'migrations', '001_initial_schema.sql');
if (!fs.existsSync(migrationFilePath)) {
  console.error(`❌ Migration file not found: ${migrationFilePath}`);
  process.exit(1);
}

const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');
console.log(`✓ Loaded migration file: /supabase/migrations/001_initial_schema.sql (${migrationSql.length} bytes)`);

// Helper: Extract project ref from Supabase URL
function getProjectRef(url) {
  try {
    const host = new URL(url).hostname;
    return host.split('.')[0];
  } catch (e) {
    return null;
  }
}

// Helper: Make Supabase REST request using service role key
function supabaseRequest(pathname, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(SUPABASE_URL);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: pathname,
      method: method,
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

// 2. Check current schema tables in Supabase via REST
async function checkExistingTables() {
  console.log('\n📡 Inspecting Supabase Cloud schema via REST API...');
  try {
    const res = await supabaseRequest('/rest/v1/');
    if (res.statusCode === 200) {
      const spec = JSON.parse(res.data);
      const definitions = Object.keys(spec.definitions || {});
      console.log(`✓ Connected to Supabase REST endpoint successfully.`);
      console.log(`  Existing Public Tables: ${definitions.length > 0 ? definitions.join(', ') : 'None yet'}`);
      return definitions;
    } else {
      console.log(`  REST API returned status: ${res.statusCode}`);
      return [];
    }
  } catch (err) {
    console.warn(`  Warning inspecting REST API: ${err.message}`);
    return [];
  }
}

// 3. Apply via PostgreSQL connection pool if URL available
async function runPgMigration(connectionString) {
  console.log('\n🔄 Applying migration directly via PostgreSQL connection...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  try {
    console.log('✓ Connected to PostgreSQL engine successfully.');
    console.log('⚙️ Executing SQL statements (tables, indexes, triggers, RLS, seed data)...');
    
    await client.query('BEGIN');
    await client.query(migrationSql);
    await client.query('COMMIT');
    
    console.log('✅ Migration applied successfully via PostgreSQL!');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration execution error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// 4. Main runner
async function main() {
  const existingTables = await checkExistingTables();

  // Determine connection string to try
  let connectionUrl = DATABASE_URL;
  const projectRef = getProjectRef(SUPABASE_URL);

  if (!connectionUrl && SUPABASE_DB_PASSWORD && projectRef) {
    // Construct standard Supabase connection string
    connectionUrl = `postgresql://postgres:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`;
    console.log(`✓ Constructed connection string using project ref and SUPABASE_DB_PASSWORD`);
  }

  if (connectionUrl) {
    try {
      await runPgMigration(connectionUrl);
      console.log('\n✨ Database schema, RLS policies, and seed data are fully applied!');
      await checkExistingTables();
      return;
    } catch (err) {
      console.warn(`\n⚠️ Direct PostgreSQL connection failed: ${err.message}`);
    }
  }

  // If direct connection is not set or failed, check if tables already exist
  const required = ['users', 'accessibility_profiles', 'transformations', 'sessions'];
  const missing = required.filter((t) => !existingTables.includes(t));

  if (missing.length === 0) {
    console.log('\n✅ All required tables already exist in Supabase!');
    return;
  }

  console.log('\n------------------------------------------------------------');
  console.log('📌 SUPABASE CLOUD SETUP INSTRUCTIONS');
  console.log('------------------------------------------------------------');
  console.log('To apply the migration to Supabase Cloud, you have 2 easy options:');
  console.log('');
  console.log('OPTION 1: One-click in Supabase SQL Editor (Recommended & Instant):');
  console.log(`1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef || 'llfipvxhlfuqvkihinrc'}/sql`);
  console.log('2. Click "+ New query"');
  console.log('3. Copy the contents of: supabase/migrations/001_initial_schema.sql');
  console.log('4. Click "Run" (Green button)');
  console.log('');
  console.log('OPTION 2: Provide DATABASE_URL in server/.env:');
  console.log('Set your database connection string in server/.env:');
  console.log(`DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef || 'llfipvxhlfuqvkihinrc'}.supabase.co:5432/postgres`);
  console.log('Then re-run: npm run db:migrate');
  console.log('------------------------------------------------------------\n');
}

main().catch((err) => {
  console.error('Fatal error in migration runner:', err);
  process.exit(1);
});
