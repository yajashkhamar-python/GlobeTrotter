import pool from '../config/db.js';

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res) => {
  const { search } = req.query;

  try {
    let result;
    if (search) {
      result = await pool.query(
        `SELECT id, name, country, region, description, image, cost_index, popularity, latitude, longitude 
         FROM cities 
         WHERE name ILIKE $1 OR country ILIKE $1
         ORDER BY popularity DESC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, country, region, description, image, cost_index, popularity, latitude, longitude 
         FROM cities 
         ORDER BY popularity DESC`
      );
    }

    res.status(200).json({ success: true, cities: result.rows });
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ success: false, message: 'Server error fetching cities' });
  }
};

// @desc    Get single city
// @route   GET /api/cities/:id
// @access  Public
export const getCityById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, country, region, description, image, cost_index, popularity, latitude, longitude 
       FROM cities 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    res.status(200).json({ success: true, city: result.rows[0] });
  } catch (err) {
    console.error('Error fetching city:', err);
    res.status(500).json({ success: false, message: 'Server error fetching city' });
  }
};
