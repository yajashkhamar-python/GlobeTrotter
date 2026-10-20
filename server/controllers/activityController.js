import pool from '../config/db.js';

// @desc    Get all activities (with optional search)
// @route   GET /api/activities
// @access  Public
export const getActivities = async (req, res) => {
  const { search } = req.query;

  try {
    let result;
    if (search) {
      result = await pool.query(
        `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration, a.image, c.name as city_name 
         FROM activities a
         JOIN cities c ON a.city_id = c.id
         WHERE a.name ILIKE $1 OR a.description ILIKE $1 OR c.name ILIKE $1
         ORDER BY a.name ASC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration, a.image, c.name as city_name 
         FROM activities a
         JOIN cities c ON a.city_id = c.id
         ORDER BY a.name ASC`
      );
    }

    res.status(200).json({ success: true, activities: result.rows });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ success: false, message: 'Server error fetching activities' });
  }
};

// @desc    Get activities for a specific city
// @route   GET /api/cities/:cityId/activities
// @access  Public
export const getCityActivities = async (req, res) => {
  const { cityId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, city_id, name, description, type, cost, duration, image 
       FROM activities 
       WHERE city_id = $1`,
      [cityId]
    );

    res.status(200).json({ success: true, activities: result.rows });
  } catch (err) {
    console.error('Error fetching city activities:', err);
    res.status(500).json({ success: false, message: 'Server error fetching activities' });
  }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Public
export const getActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, city_id, name, description, type, cost, duration, image 
       FROM activities 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, activity: result.rows[0] });
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ success: false, message: 'Server error fetching activity' });
  }
};
