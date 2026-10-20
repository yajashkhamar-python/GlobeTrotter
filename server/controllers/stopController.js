import pool from '../config/db.js';

// @desc    Add a city stop to a trip
// @route   POST /api/trips/:tripId/stops
// @access  Private
export const addStop = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { city_id, start_date, end_date } = req.body;

  if (!city_id) {
    return res.status(400).json({ success: false, message: 'city_id is required' });
  }

  try {
    // 1. Verify trip belongs to user
    const tripCheck = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // 2. Verify city exists
    const cityCheck = await pool.query('SELECT id FROM cities WHERE id = $1', [city_id]);
    if (cityCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    // 3. Determine next stop_order
    const orderCheck = await pool.query('SELECT COALESCE(MAX(stop_order), 0) + 1 AS next_order FROM trip_stops WHERE trip_id = $1', [tripId]);
    const nextOrder = orderCheck.rows[0].next_order;

    // 4. Insert stop
    const result = await pool.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tripId, city_id, start_date, end_date, nextOrder]
    );

    res.status(201).json({ success: true, stop: result.rows[0] });
  } catch (err) {
    console.error('Error adding stop:', err);
    res.status(500).json({ success: false, message: 'Server error adding stop' });
  }
};

// @desc    Update a stop
// @route   PUT /api/stops/:stopId
// @access  Private
export const updateStop = async (req, res) => {
  const { stopId } = req.params;
  const userId = req.user.id;
  const { start_date, end_date } = req.body;

  try {
    // 1. Verify stop -> trip -> user
    const check = await pool.query(
      `SELECT ts.id 
       FROM trip_stops ts 
       JOIN trips t ON ts.trip_id = t.id 
       WHERE ts.id = $1 AND t.user_id = $2`,
      [stopId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Stop not found or unauthorized' });
    }

    // 2. Update stop
    const result = await pool.query(
      `UPDATE trip_stops 
       SET start_date = COALESCE($1, start_date), 
           end_date = COALESCE($2, end_date)
       WHERE id = $3 RETURNING *`,
      [start_date, end_date, stopId]
    );

    res.status(200).json({ success: true, stop: result.rows[0] });
  } catch (err) {
    console.error('Error updating stop:', err);
    res.status(500).json({ success: false, message: 'Server error updating stop' });
  }
};

// @desc    Delete a stop
// @route   DELETE /api/stops/:stopId
// @access  Private
export const deleteStop = async (req, res) => {
  const { stopId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Verify stop -> trip -> user
    const check = await pool.query(
      `SELECT ts.id 
       FROM trip_stops ts 
       JOIN trips t ON ts.trip_id = t.id 
       WHERE ts.id = $1 AND t.user_id = $2`,
      [stopId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Stop not found or unauthorized' });
    }

    // 2. Delete stop
    await pool.query('DELETE FROM trip_stops WHERE id = $1', [stopId]);

    res.status(200).json({ success: true, message: 'Stop deleted successfully' });
  } catch (err) {
    console.error('Error deleting stop:', err);
    res.status(500).json({ success: false, message: 'Server error deleting stop' });
  }
};

// @desc    Reorder stops
// @route   PUT /api/trips/:tripId/stops/reorder
// @access  Private
export const reorderStops = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { stopIds } = req.body; // Array of stop IDs in new order

  if (!Array.isArray(stopIds)) {
    return res.status(400).json({ success: false, message: 'stopIds must be an array' });
  }

  try {
    // 1. Verify trip belongs to user
    const tripCheck = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // 2. Begin transaction
    await pool.query('BEGIN');

    // 3. Update order for each stop (verify it belongs to the trip)
    for (let i = 0; i < stopIds.length; i++) {
      const stopId = stopIds[i];
      const result = await pool.query(
        'UPDATE trip_stops SET stop_order = $1 WHERE id = $2 AND trip_id = $3 RETURNING id',
        [i + 1, stopId, tripId]
      );
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Stop ID ${stopId} is invalid for this trip` });
      }
    }

    await pool.query('COMMIT');
    res.status(200).json({ success: true, message: 'Stops reordered successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error reordering stops:', err);
    res.status(500).json({ success: false, message: 'Server error reordering stops' });
  }
};
