import pool from '../config/db.js';
import { generateItinerary } from '../services/itineraryPlanner.js';

/**
 * POST /api/planner/generate
 * Generate a personalized itinerary based on user preferences.
 * Does NOT save to DB — returns draft for user to review.
 */
export const generatePlan = async (req, res) => {
  const userId = req.user.id;
  const { cityId, startDate, endDate, travelStyle, interests, travelers, budget } = req.body;

  // ─── Validation ───────────────────────────────────────────────────────────

  if (!cityId) {
    return res.status(400).json({ success: false, message: 'cityId is required' });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ success: false, message: 'endDate must be after startDate' });
  }
  if (!travelStyle) {
    return res.status(400).json({ success: false, message: 'travelStyle is required' });
  }

  try {
    // ─── 1. Fetch city ──────────────────────────────────────────────────────
    const cityResult = await pool.query(
      'SELECT id, name, country, image, description FROM cities WHERE id = $1',
      [cityId]
    );
    if (cityResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    const city = cityResult.rows[0];

    // ─── 2. Fetch activities for the city ──────────────────────────────────
    const activitiesResult = await pool.query(
      `SELECT id, city_id, name, description, type, cost, duration, image, rating
       FROM activities
       WHERE city_id = $1
       ORDER BY name ASC`,
      [cityId]
    );
    const activities = activitiesResult.rows;

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        isActivityError: true,
        message: `We don't have enough activity data for this destination yet.`,
      });
    }

    // ─── 3. Run recommendation engine ──────────────────────────────────────
    const itinerary = generateItinerary({
      activities,
      city,
      startDate,
      endDate,
      travelStyle,
      interests: interests || [],
      travelers: parseInt(travelers) || 1,
      budget: parseFloat(budget) || 0,
    });

    res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (err) {
    console.error('Error generating itinerary:', err);
    res.status(500).json({ success: false, message: 'Server error generating itinerary' });
  }
};

/**
 * POST /api/planner/save
 * Save a generated itinerary to the database.
 * Creates trip → stop → activities using existing tables.
 */
export const savePlan = async (req, res) => {
  const userId = req.user.id;
  const { tripName, cityId, startDate, endDate, description, days, coverImage } = req.body;

  if (!tripName || !tripName.trim()) {
    return res.status(400).json({ success: false, message: 'tripName is required' });
  }
  if (!cityId || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'cityId, startDate, and endDate are required' });
  }
  if (!Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ success: false, message: 'days array is required' });
  }

  // Validate city exists
  const cityCheck = await pool.query('SELECT id FROM cities WHERE id = $1', [cityId]);
  if (cityCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'City not found' });
  }

  // Collect all activity IDs from the plan
  const allActivityIds = days.flatMap(d => (d.activities || []).map(a => a.id)).filter(Boolean);

  // Validate all activities belong to this city
  if (allActivityIds.length > 0) {
    const actCheck = await pool.query(
      'SELECT id FROM activities WHERE id = ANY($1) AND city_id = $2',
      [allActivityIds, cityId]
    );
    if (actCheck.rows.length !== allActivityIds.length) {
      return res.status(400).json({ success: false, message: 'Some activities do not belong to the selected city' });
    }
  }

  const client = await pool.pool.connect();
  try {
    await client.query('BEGIN');

    // ─── 1. Create trip ────────────────────────────────────────────────────
    const tripResult = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, tripName.trim(), description || '', startDate, endDate, coverImage || null]
    );
    const tripId = tripResult.rows[0].id;

    // ─── 2. Create stop ────────────────────────────────────────────────────
    const stopResult = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order)
       VALUES ($1, $2, $3, $4, 1) RETURNING id`,
      [tripId, cityId, startDate, endDate]
    );
    const stopId = stopResult.rows[0].id;

    // ─── 3. Insert trip activities ─────────────────────────────────────────
    let activityOrder = 1;
    const seenActivities = new Set();

    for (const day of days) {
      const dayDate = day.date;
      let dayHour = 10; // Start first activity at 10:00 AM
      for (const act of (day.activities || [])) {
        if (!act.id) continue;
        
        const timeStr = `${dayHour.toString().padStart(2, '0')}:00`;
        dayHour = Math.min(20, dayHour + 3); // increment by 3 hours, cap at 8 PM

        await client.query(
          `INSERT INTO trip_activities (trip_stop_id, activity_id, date, start_time, activity_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [stopId, act.id, dayDate, timeStr, activityOrder++]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      tripId,
      message: 'Trip created successfully!',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving plan:', err);
    res.status(500).json({ success: false, message: 'Server error saving trip plan' });
  } finally {
    client.release();
  }
};
