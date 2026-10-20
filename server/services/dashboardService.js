import pool from '../config/db.js';
import recommendationService from './recommendationService.js';

class DashboardService {
  async getSummary(userId) {
    // 1. Fetch User
    const userRes = await pool.query('SELECT name, email, profile_photo FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // 2. Fetch All User Trips
    const tripsRes = await pool.query(`
      SELECT t.*, 
        (SELECT COUNT(id) FROM trip_stops WHERE trip_id = t.id) as stop_count,
        (SELECT COUNT(ta.id) FROM trip_activities ta JOIN trip_stops ts ON ta.trip_stop_id = ts.id WHERE ts.trip_id = t.id) as activity_count
      FROM trips t
      WHERE user_id = $1
      ORDER BY start_date ASC
    `, [userId]);
    
    let allTrips = tripsRes.rows;
    const now = new Date();
    
    // Categorize trips and sort: upcoming/ongoing first, then past
    const upcomingTripsAll = allTrips.filter(t => new Date(t.end_date) >= now);
    const pastTripsAll = allTrips.filter(t => new Date(t.end_date) < now).sort((a,b) => new Date(b.end_date) - new Date(a.end_date));

    // Combine them for the My Trips section (upcoming first, then past)
    allTrips = [...upcomingTripsAll, ...pastTripsAll];

    const nextTrip = upcomingTripsAll.length > 0 ? upcomingTripsAll[0] : null;

    // 3. Overall Stats
    const totalTrips = allTrips.length;
    
    const destRes = await pool.query(`
      SELECT COUNT(DISTINCT ts.city_id) as count
      FROM trip_stops ts
      JOIN trips t ON ts.trip_id = t.id
      WHERE t.user_id = $1
    `, [userId]);
    const totalDestinations = parseInt(destRes.rows[0].count, 10);

    const activitiesRes = await pool.query(`
      SELECT COUNT(ta.id) as count
      FROM trip_activities ta
      JOIN trip_stops ts ON ta.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE t.user_id = $1
    `, [userId]);
    const totalActivities = parseInt(activitiesRes.rows[0].count, 10);

    const budgetRes = await pool.query(`
      SELECT SUM(budget_limit) as total_budget
      FROM trips
      WHERE user_id = $1
    `, [userId]);
    const totalPlannedBudget = parseFloat(budgetRes.rows[0].total_budget) || 0;

    const stats = {
      totalTrips,
      totalDestinations,
      totalActivities,
      totalPlannedBudget
    };

    // 4. Upcoming Itinerary (For the next trip)
    let upcomingItinerary = [];
    let budgetSummary = null;

    if (nextTrip) {
      const itineraryRes = await pool.query(`
        SELECT ta.id, ta.date, ta.start_time, a.name as activity_name, c.name as city_name, a.type
        FROM trip_activities ta
        JOIN trip_stops ts ON ta.trip_stop_id = ts.id
        JOIN activities a ON ta.activity_id = a.id
        JOIN cities c ON a.city_id = c.id
        WHERE ts.trip_id = $1
        ORDER BY ta.date ASC, ta.start_time ASC
        LIMIT 4
      `, [nextTrip.id]);
      
      upcomingItinerary = itineraryRes.rows;

      const expensesRes = await pool.query(`
        SELECT category, amount FROM expenses WHERE trip_id = $1
      `, [nextTrip.id]);

      const expenses = expensesRes.rows;
      const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const remaining = parseFloat(nextTrip.budget_limit) - totalSpent;
      const spentPercentage = nextTrip.budget_limit > 0 ? Math.min(100, (totalSpent / nextTrip.budget_limit) * 100) : 0;
      
      const categories = expenses.reduce((acc, exp) => {
        const cat = exp.category || 'other';
        acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount);
        return acc;
      }, {});

      budgetSummary = {
        totalBudget: parseFloat(nextTrip.budget_limit),
        totalSpent,
        remaining,
        spentPercentage,
        categories
      };

      const nextTripCities = await pool.query(`
        SELECT c.name FROM trip_stops ts 
        JOIN cities c ON ts.city_id = c.id 
        WHERE ts.trip_id = $1 ORDER BY ts.stop_order
      `, [nextTrip.id]);
      nextTrip.destination_names = nextTripCities.rows.map(r => r.name).join(' • ');
    }

    // Populate destination names for ALL trips
    for (const t of allTrips) {
      const tCities = await pool.query(`
        SELECT c.name FROM trip_stops ts 
        JOIN cities c ON ts.city_id = c.id 
        WHERE ts.trip_id = $1 ORDER BY ts.stop_order
      `, [t.id]);
      t.destination_names = tCities.rows.map(r => r.name).join(' • ');
    }

    // 5. Recommendations
    const recsResult = await recommendationService.getRecommendations(userId);
    const recommendations = {
      status: recsResult.status,
      destinations: recsResult.recommendations.destinations.slice(0, 4),
      activities: recsResult.recommendations.activities.slice(0, 4)
    };

    // 6. Public Trips (Travel Inspiration)
    const publicTripsRes = await pool.query(`
      SELECT st.share_token, t.id as trip_id, t.name, t.cover_image, u.name as creator_name,
        (SELECT COUNT(id) FROM trip_stops WHERE trip_id = t.id) as destination_count
      FROM shared_trips st
      JOIN trips t ON st.trip_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE st.is_public = true AND t.user_id != $1
      ORDER BY st.created_at DESC
      LIMIT 3
    `, [userId]);
    const publicTrips = publicTripsRes.rows;

    return {
      user,
      stats,
      allTrips,
      nextTrip,
      upcomingItinerary,
      budgetSummary,
      recommendations,
      publicTrips
    };
  }
}

export default new DashboardService();
