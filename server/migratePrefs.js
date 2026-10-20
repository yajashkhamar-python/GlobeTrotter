import pool from './config/db.js';

const run = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          budget_preference VARCHAR(50),
          trip_pace VARCHAR(50),
          travel_type VARCHAR(50),
          interests TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created successfully");
  } catch(err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
