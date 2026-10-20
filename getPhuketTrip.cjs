require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getPhuketTrip() {
  try {
    const res = await pool.query(`
      SELECT t.id, t.name 
      FROM trips t
      JOIN trip_stops ts ON t.id = ts.trip_id
      JOIN cities c ON ts.city_id = c.id
      WHERE c.name = 'Phuket'
      LIMIT 1;
    `);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
getPhuketTrip();
