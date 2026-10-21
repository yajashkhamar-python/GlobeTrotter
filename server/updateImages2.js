import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../.env' });

const isCloudDb = process.env.DATABASE_URL?.includes('render.com') ||
                   process.env.DATABASE_URL?.includes('neon.tech') ||
                   process.env.DATABASE_URL?.includes('supabase.co');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/globetrotter',
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

const updates = [
  { table: 'activities', name: 'Eiffel Tower', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Vatican Museums', image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'British Museum', image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Senso-ji Temple', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80' }
];

async function run() {
  try {
    for (let u of updates) {
      await pool.query(`UPDATE ${u.table} SET image = $1 WHERE name = $2`, [u.image, u.name]);
      console.log(`Updated ${u.table} - ${u.name}`);
    }
    console.log('Finished updating DB images');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
