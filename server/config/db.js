import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const isCloudDb = process.env.DATABASE_URL?.includes('render.com') ||
                   process.env.DATABASE_URL?.includes('neon.tech') ||
                   process.env.DATABASE_URL?.includes('supabase.co') ||
                   process.env.DATABASE_URL?.includes('sslmode=require');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

// Test the connection when the application starts
pool.on('connect', () => {
  // console.log('Connected to PostgreSQL database'); // Removed to avoid spamming on every connection checkout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  // process.exit(-1); // DO NOT exit the process on idle client errors
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
