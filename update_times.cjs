const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("UPDATE trip_activities SET start_time = '09:00:00' WHERE start_time IS NULL");
    console.log("Updated", res.rowCount, "activities with missing start times");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
