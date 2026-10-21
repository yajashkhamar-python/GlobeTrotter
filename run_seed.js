import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCloudDb = process.env.DATABASE_URL?.includes('render.com') ||
                   process.env.DATABASE_URL?.includes('neon.tech') ||
                   process.env.DATABASE_URL?.includes('supabase.co');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter',
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

const sql = fs.readFileSync(path.join(__dirname, 'server/db/seed_enhanced.sql'), 'utf8');

const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

async function run() {
  const client = await pool.connect();
  try {
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log('OK:', stmt.substring(0, 60).replace(/\n/g, ' '));
      } catch (e) {
        console.error('ERR:', e.message, '|', stmt.substring(0, 60));
      }
    }
    console.log('\nSeed complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

run();
