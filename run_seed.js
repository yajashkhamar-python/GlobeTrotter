import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/globetrotter'
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
