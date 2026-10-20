import pool from '../config/db.js';
import crypto from 'crypto';

// @desc    Get share settings for a trip
// @route   GET /api/trips/:id/share
// @access  Private (Owner only)
export const getShareSettings = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if trip belongs to user
    const tripCheck = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // Get share settings
    const shareResult = await pool.query('SELECT share_token, is_public FROM shared_trips WHERE trip_id = $1', [tripId]);
    
    if (shareResult.rows.length === 0) {
      return res.status(200).json({ success: true, share: { is_public: false, share_token: null } });
    }

    res.status(200).json({ success: true, share: shareResult.rows[0] });
  } catch (err) {
    console.error('Error fetching share settings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update share settings for a trip
// @route   PUT /api/trips/:id/share
// @access  Private (Owner only)
export const updateShareSettings = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;
  const { is_public } = req.body;

  try {
    // Check if trip belongs to user
    const tripCheck = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // Check existing share record
    const shareCheck = await pool.query('SELECT id, share_token FROM shared_trips WHERE trip_id = $1', [tripId]);

    let share_token = null;

    if (shareCheck.rows.length === 0) {
      // Create new share record if turning public
      if (is_public) {
        share_token = crypto.randomBytes(5).toString('hex');
        const insertRes = await pool.query(
          'INSERT INTO shared_trips (trip_id, share_token, is_public) VALUES ($1, $2, $3) RETURNING share_token, is_public',
          [tripId, share_token, is_public]
        );
        return res.status(200).json({ success: true, share: insertRes.rows[0] });
      } else {
        // Nothing to do if it's already private and no record exists
        return res.status(200).json({ success: true, share: { is_public: false, share_token: null } });
      }
    } else {
      // Update existing record
      share_token = shareCheck.rows[0].share_token;
      if (is_public && !share_token) {
        // Generate new token if it was somehow null
        share_token = crypto.randomBytes(5).toString('hex');
      }

      const updateRes = await pool.query(
        'UPDATE shared_trips SET is_public = $1, share_token = COALESCE($2, share_token) WHERE trip_id = $3 RETURNING share_token, is_public',
        [is_public, share_token, tripId]
      );
      
      return res.status(200).json({ success: true, share: updateRes.rows[0] });
    }
  } catch (err) {
    console.error('Error updating share settings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get public trip details via token
// @route   GET /api/shared/:token
// @access  Public
export const getPublicTrip = async (req, res) => {
  const { token } = req.params;

  try {
    // 1. Find trip via token and check if public
    const shareCheck = await pool.query(
      'SELECT trip_id, is_public FROM shared_trips WHERE share_token = $1',
      [token]
    );

    if (shareCheck.rows.length === 0 || !shareCheck.rows[0].is_public) {
      return res.status(404).json({ success: false, message: 'Trip not available' });
    }

    const tripId = shareCheck.rows[0].trip_id;

    // 2. Fetch trip details (dropping user checks)
    const tripResult = await pool.query(
      'SELECT id, name, description, start_date, end_date, cover_image, created_at, updated_at, budget_limit FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not available' });
    }

    const trip = tripResult.rows[0];

    // 3. Fetch stops for the trip
    const stopsResult = await pool.query(
      `SELECT ts.id, ts.start_date, ts.end_date, ts.stop_order, 
              c.id as city_id, c.name as city_name, c.country, c.image as city_image
       FROM trip_stops ts
       JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.stop_order ASC`,
      [tripId]
    );
    
    trip.stops = stopsResult.rows.map(stop => ({
      id: stop.id,
      start_date: stop.start_date,
      end_date: stop.end_date,
      stop_order: stop.stop_order,
      city: {
        id: stop.city_id,
        name: stop.city_name,
        country: stop.country,
        image: stop.city_image
      },
      activities: []
    }));

    // 4. Fetch activities for all stops
    if (trip.stops.length > 0) {
      const stopIds = trip.stops.map(s => s.id);
      
      const activitiesResult = await pool.query(
        `SELECT ta.id, ta.trip_stop_id, ta.date, ta.start_time, ta.end_time, ta.custom_cost, ta.notes, ta.activity_order,
                a.id as activity_id, a.name, a.type, a.cost, a.duration, a.image, a.description
         FROM trip_activities ta
         JOIN activities a ON ta.activity_id = a.id
         WHERE ta.trip_stop_id = ANY($1)
         ORDER BY ta.date ASC, ta.start_time ASC, ta.activity_order ASC`,
        [stopIds]
      );

      // Map activities to their respective stops
      activitiesResult.rows.forEach(act => {
        const stop = trip.stops.find(s => s.id === act.trip_stop_id);
        if (stop) {
          stop.activities.push({
            id: act.id,
            date: act.date,
            start_time: act.start_time,
            end_time: act.end_time,
            custom_cost: act.custom_cost,
            notes: act.notes,
            activity_order: act.activity_order,
            activity: {
              id: act.activity_id,
              name: act.name,
              type: act.type,
              cost: act.cost,
              duration: act.duration,
              image: act.image,
              description: act.description
            }
          });
        }
      });
    }
    // 5. Fetch budget/expense summary (public safe)
    const budgetResult = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE trip_id = $1
       GROUP BY category`,
      [tripId]
    );
    
    trip.budget_summary = budgetResult.rows.map(row => ({
      category: row.category,
      total: parseFloat(row.total)
    }));

    res.status(200).json({ success: true, trip });
  } catch (err) {
    console.error('Error fetching public trip:', err);
    res.status(500).json({ success: false, message: 'Server error fetching public trip' });
  }
};

// @desc    Copy a public trip to the logged-in user's account
// @route   POST /api/shared/:token/copy
// @access  Private
export const copyPublicTrip = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    // 1. Find trip via token and check if public
    const shareCheck = await pool.query(
      'SELECT trip_id, is_public FROM shared_trips WHERE share_token = $1',
      [token]
    );

    if (shareCheck.rows.length === 0 || !shareCheck.rows[0].is_public) {
      return res.status(404).json({ success: false, message: 'This shared trip is no longer available.' });
    }

    const sourceTripId = shareCheck.rows[0].trip_id;

    // Begin transaction for safety
    await pool.query('BEGIN');

    // 2. Read source trip
    const tripResult = await pool.query(
      'SELECT name, description, start_date, end_date, cover_image, budget_limit, status FROM trips WHERE id = $1',
      [sourceTripId]
    );

    if (tripResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'This shared trip is no longer available.' });
    }

    const sourceTrip = tripResult.rows[0];

    // 3. Create new trip for the authenticated user
    const newTripName = `${sourceTrip.name} (Copy)`;
    const newTripResult = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget_limit, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        userId,
        newTripName,
        sourceTrip.description,
        sourceTrip.start_date,
        sourceTrip.end_date,
        sourceTrip.cover_image,
        sourceTrip.budget_limit,
        sourceTrip.status
      ]
    );
    const newTripId = newTripResult.rows[0].id;

    // 4. Copy stops
    const stopsResult = await pool.query(
      'SELECT id, city_id, start_date, end_date, stop_order FROM trip_stops WHERE trip_id = $1 ORDER BY stop_order ASC',
      [sourceTripId]
    );

    const stopIdMapping = {}; // Maps old stop ID to new stop ID

    for (const stop of stopsResult.rows) {
      const newStopResult = await pool.query(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [newTripId, stop.city_id, stop.start_date, stop.end_date, stop.stop_order]
      );
      stopIdMapping[stop.id] = newStopResult.rows[0].id;
    }

    // 5. Copy activities
    if (Object.keys(stopIdMapping).length > 0) {
      const oldStopIds = Object.keys(stopIdMapping);
      
      const activitiesResult = await pool.query(
        `SELECT trip_stop_id, activity_id, date, start_time, end_time, custom_cost, notes, activity_order
         FROM trip_activities WHERE trip_stop_id = ANY($1)`,
        [oldStopIds]
      );

      for (const act of activitiesResult.rows) {
        const newStopId = stopIdMapping[act.trip_stop_id];
        if (newStopId) {
          await pool.query(
            `INSERT INTO trip_activities (trip_stop_id, activity_id, date, start_time, end_time, custom_cost, notes, activity_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              newStopId,
              act.activity_id,
              act.date,
              act.start_time,
              act.end_time,
              act.custom_cost,
              act.notes,
              act.activity_order
            ]
          );
        }
      }
    }

    // 6. Copy trip-level expenses
    const expensesResult = await pool.query(
      'SELECT category, amount, description, date FROM expenses WHERE trip_id = $1',
      [sourceTripId]
    );

    for (const exp of expensesResult.rows) {
      await pool.query(
        `INSERT INTO expenses (trip_id, category, amount, description, date)
         VALUES ($1, $2, $3, $4, $5)`,
        [newTripId, exp.category, exp.amount, exp.description, exp.date]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Trip copied successfully',
      trip: {
        id: newTripId,
        name: newTripName
      }
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error copying public trip:', err);
    res.status(500).json({ success: false, message: 'Server error while copying trip' });
  }
};

// @desc    Discover all public shared trips
// @route   GET /api/shared/discover
// @access  Public
export const discoverPublicTrips = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id as trip_id, t.name, t.start_date, t.end_date, t.cover_image, st.share_token, u.name as creator_name,
              (SELECT COUNT(*) FROM trip_stops ts WHERE ts.trip_id = t.id) as destination_count,
              (SELECT COUNT(*) FROM trip_activities ta JOIN trip_stops ts2 ON ta.trip_stop_id = ts2.id WHERE ts2.trip_id = t.id) as activity_count,
              (SELECT string_agg(c.name, ', ') FROM trip_stops ts3 JOIN cities c ON ts3.city_id = c.id WHERE ts3.trip_id = t.id) as destination_names
       FROM shared_trips st
       JOIN trips t ON st.trip_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE st.is_public = true
       ORDER BY st.created_at DESC`
    );

    // Map rows to a clean format
    const publicTrips = result.rows.map(row => ({
      trip_id: row.trip_id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      cover_image: row.cover_image,
      share_token: row.share_token,
      creator_name: row.creator_name ? row.creator_name.split(' ')[0] : 'Traveler',
      destination_count: parseInt(row.destination_count, 10),
      activity_count: parseInt(row.activity_count, 10),
      destination_names: row.destination_names || ''
    }));

    res.status(200).json({ success: true, count: publicTrips.length, publicTrips });
  } catch (err) {
    console.error('Error fetching public trips:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching public trips' });
  }
};
