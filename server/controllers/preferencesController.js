import pool from '../config/db.js';

const ALLOWED_BUDGETS = ['Budget', 'Moderate', 'Premium'];
const ALLOWED_PACES = ['Relaxed', 'Balanced', 'Packed'];
const ALLOWED_TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Friends'];
const ALLOWED_INTERESTS = [
  'Adventure', 'History & Culture', 'Food & Cuisine', 'Beaches', 
  'Nature & Wildlife', 'Shopping', 'Art & Museums', 'Nightlife', 
  'Photography', 'Family', 'Romantic', 'Relaxation'
];

// @desc    Get user travel preferences
// @route   GET /api/preferences
// @access  Private
export const getPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT budget_preference, trip_pace, travel_type, interests FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return empty defaults if not set
      return res.status(200).json({
        success: true,
        preferences: {
          budget_preference: '',
          trip_pace: '',
          travel_type: '',
          interests: []
        }
      });
    }

    res.status(200).json({ success: true, preferences: result.rows[0] });
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update or create user travel preferences
// @route   POST /api/preferences (also maps to PUT)
// @access  Private
export const savePreferences = async (req, res) => {
  const userId = req.user.id;
  let { budget_preference, trip_pace, travel_type, interests } = req.body;

  // Validate allowed values (reset to null/empty if invalid)
  if (budget_preference && !ALLOWED_BUDGETS.includes(budget_preference)) budget_preference = null;
  if (trip_pace && !ALLOWED_PACES.includes(trip_pace)) trip_pace = null;
  if (travel_type && !ALLOWED_TRAVEL_TYPES.includes(travel_type)) travel_type = null;
  
  if (Array.isArray(interests)) {
    interests = interests.filter(i => ALLOWED_INTERESTS.includes(i));
  } else {
    interests = [];
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, budget_preference, trip_pace, travel_type, interests, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         budget_preference = EXCLUDED.budget_preference,
         trip_pace = EXCLUDED.trip_pace,
         travel_type = EXCLUDED.travel_type,
         interests = EXCLUDED.interests,
         updated_at = CURRENT_TIMESTAMP
       RETURNING budget_preference, trip_pace, travel_type, interests`,
      [userId, budget_preference, trip_pace, travel_type, interests]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Preferences saved successfully',
      preferences: result.rows[0] 
    });
  } catch (err) {
    console.error('Error saving preferences:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
