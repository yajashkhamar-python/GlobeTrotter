require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCities() {
  try {
    const res = await pool.query("SELECT id, name, latitude, longitude FROM cities WHERE name = 'Phuket'");
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkCities();
