import pool from '../config/db.js';

export async function getSavedDestinations(userId) {
  const result = await pool.query(`
    SELECT sd.id as saved_id, sd.created_at as saved_at, c.* 
    FROM saved_destinations sd
    JOIN cities c ON sd.city_id = c.id
    WHERE sd.user_id = $1
    ORDER BY sd.created_at DESC
  `, [userId]);
  return result.rows;
}

export async function saveDestination(userId, cityId) {
  // Use ON CONFLICT to avoid errors on duplicate saves
  const result = await pool.query(`
    INSERT INTO saved_destinations (user_id, city_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, city_id) DO NOTHING
    RETURNING *
  `, [userId, cityId]);
  
  if (result.rows.length === 0) {
    // If it was a conflict, we just return the existing record or signal success
    return { success: true, message: 'Already saved' };
  }
  return result.rows[0];
}

export async function unsaveDestination(userId, cityId) {
  const result = await pool.query(`
    DELETE FROM saved_destinations 
    WHERE user_id = $1 AND city_id = $2
    RETURNING id
  `, [userId, cityId]);
  
  return result.rowCount > 0;
}
