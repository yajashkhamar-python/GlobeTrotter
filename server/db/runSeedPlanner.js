/**
 * runSeedPlanner.js
 * Runs the seed_planner.sql to expand cities/activities in PostgreSQL.
 * Usage: node server/db/runSeedPlanner.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, 'seed_planner.sql');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🌍 Running GlobeTrotter Planner Seed...');
    const sql = readFileSync(sqlPath, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    // Verify
    const citiesCount = await client.query('SELECT COUNT(*) FROM cities');
    const activitiesCount = await client.query('SELECT COUNT(*) FROM activities');
    const newCities = await client.query(`SELECT name, country FROM cities ORDER BY id DESC LIMIT 10`);

    console.log(`✅ Seed complete!`);
    console.log(`   Cities: ${citiesCount.rows[0].count}`);
    console.log(`   Activities: ${activitiesCount.rows[0].count}`);
    console.log(`\n📍 Latest 10 cities added/existing:`);
    newCities.rows.forEach(c => console.log(`   - ${c.name}, ${c.country}`));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
