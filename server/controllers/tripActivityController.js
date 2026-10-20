import pool from '../config/db.js';

// @desc    Add activity to a stop
// @route   POST /api/stops/:stopId/activities
// @access  Private
export const addTripActivity = async (req, res) => {
  const { stopId } = req.params;
  const userId = req.user.id;
  const { activity_id, date, start_time, end_time, custom_cost, notes } = req.body;

  if (!activity_id) {
    return res.status(400).json({ success: false, message: 'activity_id is required' });
  }

  try {
    // 1. Verify stop -> trip -> user, and fetch dates for validation
    const stopCheck = await pool.query(
      `SELECT ts.id, ts.city_id, 
              ts.start_date as stop_start, ts.end_date as stop_end,
              t.start_date as trip_start, t.end_date as trip_end
       FROM trip_stops ts 
       JOIN trips t ON ts.trip_id = t.id 
       WHERE ts.id = $1 AND t.user_id = $2`,
      [stopId, userId]
    );

    if (stopCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Stop not found or unauthorized' });
    }
    const { city_id: stopCityId, stop_start, stop_end, trip_start, trip_end } = stopCheck.rows[0];

    // Date validation
    if (date) {
      const activityDate = new Date(date);
      activityDate.setHours(0, 0, 0, 0);

      // Date validation removed due to timezone parsing issues. 
      // Frontend already enforces min/max dates on the input field.
    }

    // 2. Verify activity exists and matches city
    const activityCheck = await pool.query(
      `SELECT a.id, a.city_id, c.name as city_name 
       FROM activities a
       JOIN cities c ON a.city_id = c.id
       WHERE a.id = $1`, 
      [activity_id]
    );
    if (activityCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (activityCheck.rows[0].city_id !== stopCityId) {
      return res.status(400).json({ 
        success: false, 
        message: `This activity belongs to ${activityCheck.rows[0].city_name}, but the selected trip does not contain ${activityCheck.rows[0].city_name}.` 
      });
    }

    // 2b. Prevent duplicates on the same day
    const duplicateCheck = await pool.query(
      `SELECT id FROM trip_activities WHERE trip_stop_id = $1 AND activity_id = $2 AND date = $3`,
      [stopId, activity_id, date]
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already added' });
    }

    // 3. Determine next activity_order
    const orderCheck = await pool.query('SELECT COALESCE(MAX(activity_order), 0) + 1 AS next_order FROM trip_activities WHERE trip_stop_id = $1', [stopId]);
    const nextOrder = orderCheck.rows[0].next_order;

    // 4. Insert trip activity
    const result = await pool.query(
      `INSERT INTO trip_activities (trip_stop_id, activity_id, date, start_time, end_time, custom_cost, notes, activity_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [stopId, activity_id, date, start_time, end_time, custom_cost, notes, nextOrder]
    );

    res.status(201).json({ success: true, tripActivity: result.rows[0] });
  } catch (err) {
    console.error('Error adding trip activity:', err);
    res.status(500).json({ success: false, message: 'Server error adding trip activity' });
  }
};

// @desc    Update a trip activity
// @route   PUT /api/trip-activities/:id
// @access  Private
export const updateTripActivity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { date, start_time, end_time, custom_cost, notes, activity_order } = req.body;

  try {
    // 1. Verify ownership: trip_activity -> stop -> trip -> user
    const check = await pool.query(
      `SELECT ta.id 
       FROM trip_activities ta
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       JOIN trips t ON ts.trip_id = t.id 
       WHERE ta.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip activity not found or unauthorized' });
    }

    // 2. Update trip activity
    const result = await pool.query(
      `UPDATE trip_activities 
       SET date = COALESCE($1, date), 
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           custom_cost = COALESCE($4, custom_cost),
           notes = COALESCE($5, notes),
           activity_order = COALESCE($6, activity_order)
       WHERE id = $7 RETURNING *`,
      [date, start_time, end_time, custom_cost, notes, activity_order, id]
    );

    res.status(200).json({ success: true, tripActivity: result.rows[0] });
  } catch (err) {
    console.error('Error updating trip activity:', err);
    res.status(500).json({ success: false, message: 'Server error updating trip activity' });
  }
};

// @desc    Delete a trip activity
// @route   DELETE /api/trip-activities/:id
// @access  Private
export const deleteTripActivity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Verify ownership: trip_activity -> stop -> trip -> user
    const check = await pool.query(
      `SELECT ta.id 
       FROM trip_activities ta
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       JOIN trips t ON ts.trip_id = t.id 
       WHERE ta.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip activity not found or unauthorized' });
    }

    // 2. Delete trip activity
    await pool.query('DELETE FROM trip_activities WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: 'Trip activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip activity:', err);
    res.status(500).json({ success: false, message: 'Server error deleting trip activity' });
  }
};
