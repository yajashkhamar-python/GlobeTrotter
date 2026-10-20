import pool from '../config/db.js';

// @desc    Get user's full calendar data
// @route   GET /api/calendar
// @access  Private
export const getCalendarData = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch all trips for the user
    const tripsResult = await pool.query(
      'SELECT id, name, start_date, end_date FROM trips WHERE user_id = $1 ORDER BY start_date ASC',
      [userId]
    );

    if (tripsResult.rows.length === 0) {
      return res.status(200).json({ success: true, trips: [] });
    }

    const trips = tripsResult.rows;
    const tripIds = trips.map(t => t.id);

    // 2. Fetch all stops for these trips
    const stopsResult = await pool.query(
      `SELECT ts.id, ts.trip_id, ts.start_date, ts.end_date, ts.stop_order, 
              c.name as city_name, c.country
       FROM trip_stops ts
       JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = ANY($1)
       ORDER BY ts.trip_id ASC, ts.start_date ASC, ts.stop_order ASC`,
      [tripIds]
    );
    
    // Group stops by trip
    const stopsByTrip = {};
    stopsResult.rows.forEach(stop => {
      if (!stopsByTrip[stop.trip_id]) stopsByTrip[stop.trip_id] = [];
      stopsByTrip[stop.trip_id].push({
        id: stop.id,
        start_date: stop.start_date,
        end_date: stop.end_date,
        stop_order: stop.stop_order,
        city_name: stop.city_name,
        country: stop.country,
        activities: []
      });
    });

    // 3. Fetch all activities for these stops
    const stopIds = stopsResult.rows.map(s => s.id);
    let activitiesResult = { rows: [] };
    
    if (stopIds.length > 0) {
      activitiesResult = await pool.query(
        `SELECT ta.id, ta.trip_stop_id, ta.date, ta.start_time, ta.end_time, 
                a.name as activity_name, a.type
         FROM trip_activities ta
         JOIN activities a ON ta.activity_id = a.id
         WHERE ta.trip_stop_id = ANY($1)
         ORDER BY ta.date ASC, ta.start_time ASC`,
        [stopIds]
      );
    }

    // Attach activities to their respective stops
    activitiesResult.rows.forEach(act => {
      // Find the stop in stopsByTrip
      for (const tId in stopsByTrip) {
        const stop = stopsByTrip[tId].find(s => s.id === act.trip_stop_id);
        if (stop) {
          stop.activities.push({
            id: act.id,
            date: act.date,
            start_time: act.start_time,
            end_time: act.end_time,
            activity_name: act.activity_name,
            type: act.type
          });
          break;
        }
      }
    });

    // Assemble final response
    const completeTrips = trips.map(trip => ({
      ...trip,
      stops: stopsByTrip[trip.id] || []
    }));

    res.status(200).json({ success: true, trips: completeTrips });
  } catch (err) {
    console.error('Error fetching calendar data:', err);
    res.status(500).json({ success: false, message: 'Server error fetching calendar data' });
  }
};
