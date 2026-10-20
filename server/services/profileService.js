import db from '../config/db.js';

class ProfileService {
  /**
   * Get user statistics
   * @param {number} userId 
   * @returns {Object} { totalTrips, totalDestinations, totalActivities, totalSaved }
   */
  async getProfileStats(userId) {
    // Total Trips
    const tripsRes = await db.query('SELECT COUNT(*) FROM trips WHERE user_id = $1', [userId]);
    const totalTrips = parseInt(tripsRes.rows[0].count, 10);

    // Total Destinations (unique cities visited)
    const destRes = await db.query(`
      SELECT COUNT(DISTINCT ts.city_id)
      FROM trip_stops ts
      JOIN trips t ON ts.trip_id = t.id
      WHERE t.user_id = $1
    `, [userId]);
    const totalDestinations = parseInt(destRes.rows[0].count, 10);

    // Total Activities
    const actRes = await db.query(`
      SELECT COUNT(ta.id)
      FROM trip_activities ta
      JOIN trip_stops ts ON ta.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE t.user_id = $1
    `, [userId]);
    const totalActivities = parseInt(actRes.rows[0].count, 10);

    // Total Saved
    const savedRes = await db.query('SELECT COUNT(*) FROM saved_destinations WHERE user_id = $1', [userId]);
    const totalSaved = parseInt(savedRes.rows[0].count, 10);

    return { totalTrips, totalDestinations, totalActivities, totalSaved };
  }

  /**
   * Get user travel preferences
   * @param {number} userId 
   * @returns {Object|null}
   */
  async getTravelPreferences(userId) {
    const res = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  /**
   * Update user basic information (Name, Email)
   * @param {number} userId 
   * @param {string} name 
   * @param {string} email 
   * @returns {Object} updated user
   */
  async updateProfile(userId, name, email) {
    // Check if email is already taken by someone else
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (emailCheck.rows.length > 0) {
      throw new Error('Email is already in use by another account');
    }

    const res = await db.query(`
      UPDATE users 
      SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, created_at, language
    `, [name, email, userId]);

    return res.rows[0];
  }

  /**
   * Update user password
   * @param {number} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const bcrypt = await import('bcryptjs');

    // Get current user hash
    const userRes = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) throw new Error('User not found');
    const user = userRes.rows[0];

    const isMatch = await bcrypt.default.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Incorrect current password');

    // Hash new password
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(newPassword, salt);

    await db.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, userId]);
  }

  /**
   * Update user language
   * @param {number} userId
   * @param {string} language
   */
  async updateLanguage(userId, language) {
    const res = await db.query(`
      UPDATE users SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      RETURNING id, name, email, created_at, language
    `, [language, userId]);
    return res.rows[0];
  }

  /**
   * Delete user account entirely
   * @param {number} userId
   */
  async deleteAccount(userId) {
    // ON DELETE CASCADE will handle all related tables
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
  }
}

export default new ProfileService();
