import pool from '../config/db.js';

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  const { name, description, start_date, end_date, cover_image } = req.body;
  const userId = req.user.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Trip name is required' });
  }
  if (!start_date) {
    return res.status(400).json({ success: false, message: 'Start date is required' });
  }
  if (!end_date) {
    return res.status(400).json({ success: false, message: 'End date is required' });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tripStartDate = new Date(start_date);
  tripStartDate.setHours(0, 0, 0, 0);
  
  if (tripStartDate < today) {
    return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, name.trim(), description, start_date, end_date, cover_image]
    );

    const newTrip = result.rows[0];

    // Create a notification for the user
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
        [
          userId,
          'trip_reminder',
          `Trip Created: ${newTrip.name}`,
          `Your trip is set for ${new Date(start_date).toLocaleDateString()}. Start building your day-by-day itinerary!`,
          `/trips/${newTrip.id}`
        ]
      );
    } catch (notifErr) {
      console.error('Failed to create trip notification:', notifErr);
    }

    res.status(201).json({ success: true, trip: newTrip });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ success: false, message: 'Server error creating trip' });
  }
};

// @desc    Get user trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT id, name, description, start_date, end_date, cover_image, created_at, updated_at FROM trips WHERE user_id = $1 ORDER BY start_date ASC',
      [userId]
    );

    res.status(200).json({ success: true, trips: result.rows });
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ success: false, message: 'Server error fetching trips' });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Fetch trip details
    const tripResult = await pool.query(
      'SELECT id, name, description, start_date, end_date, cover_image, created_at, updated_at FROM trips WHERE id = $1 AND user_id = $2',
      [tripId, userId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    const trip = tripResult.rows[0];

    // 2. Fetch stops for the trip
    const stopsResult = await pool.query(
      `SELECT ts.id, ts.start_date, ts.end_date, ts.stop_order, 
              c.id as city_id, c.name as city_name, c.country, c.image as city_image, c.latitude, c.longitude
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
        image: stop.city_image,
        latitude: stop.latitude,
        longitude: stop.longitude
      },
      activities: []
    }));

    // 3. Fetch activities for all stops
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

    res.status(200).json({ success: true, trip });
  } catch (err) {
    console.error('Error fetching trip details:', err);
    res.status(500).json({ success: false, message: 'Server error fetching trip details' });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;
  const { name, description, start_date, end_date, cover_image, budget_limit } = req.body;

  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
  }

  try {
    // Check if trip exists and belongs to user
    const check = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE trips 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           start_date = COALESCE($3, start_date), 
           end_date = COALESCE($4, end_date), 
           cover_image = COALESCE($5, cover_image),
           budget_limit = COALESCE($6, budget_limit),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [name, description, start_date, end_date, cover_image, budget_limit, tripId, userId]
    );

    res.status(200).json({ success: true, trip: result.rows[0] });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({ success: false, message: 'Server error updating trip' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [tripId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ success: false, message: 'Server error deleting trip' });
  }
};
