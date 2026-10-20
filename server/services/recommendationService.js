import pool from '../config/db.js';

// Manually map existing seeded activities to our detailed Travel Interests
const ACTIVITY_INTEREST_MAPPING = {
  'Eiffel Tower': ['Photography', 'Romantic', 'Family', 'History & Culture'],
  'Louvre Museum': ['Art & Museums', 'History & Culture', 'Photography'],
  'Colosseum': ['History & Culture', 'Photography'],
  'Vatican Museums': ['Art & Museums', 'History & Culture'],
  'Sagrada Família': ['Art & Museums', 'History & Culture', 'Photography'],
  'British Museum': ['Art & Museums', 'History & Culture'],
  'Senso-ji Temple': ['History & Culture', 'Photography', 'Relaxation'],
  'Burj Khalifa': ['Adventure', 'Photography', 'Shopping']
};

class RecommendationService {
  /**
   * Retrieves recommendations for a given user.
   * @param {number} userId 
   * @returns {Object} { status: 'success' | 'no_preferences', recommendations: { destinations: [], activities: [] } }
   */
  async getRecommendations(userId) {
    // 1. Get user preferences
    const prefResult = await pool.query(
      'SELECT interests, budget_preference, trip_pace, travel_type FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (prefResult.rows.length === 0 || !prefResult.rows[0].interests || prefResult.rows[0].interests.length === 0) {
      return { status: 'no_preferences', recommendations: { destinations: [], activities: [] } };
    }

    const { interests } = prefResult.rows[0];

    // 2. Fetch all cities and activities
    const citiesResult = await pool.query(`
      SELECT id, name, country, region, description, image, cost_index, popularity 
      FROM cities
    `);
    
    const activitiesResult = await pool.query(`
      SELECT a.id, a.city_id, a.name, a.description, a.type, a.cost, a.duration, a.image,
             c.name as city_name, c.country
      FROM activities a
      JOIN cities c ON a.city_id = c.id
    `);

    const cities = citiesResult.rows;
    const activities = activitiesResult.rows;

    // 3. Score activities based on interests
    const scoredActivities = activities.map(activity => {
      let score = 0;
      const mappedInterests = ACTIVITY_INTEREST_MAPPING[activity.name] || [];
      
      mappedInterests.forEach(interest => {
        if (interests.includes(interest)) {
          score += 10;
        }
      });

      return {
        ...activity,
        score,
        mapped_categories: mappedInterests
      };
    });

    // 4. Score cities based on their scored activities
    const scoredCities = cities.map(city => {
      const cityActivities = scoredActivities.filter(a => a.city_id === city.id);
      const totalActivityScore = cityActivities.reduce((sum, a) => sum + a.score, 0);
      
      let score = totalActivityScore;

      return {
        ...city,
        score
      };
    });

    // 5. Filter and Sort
    const recommendedActivities = scoredActivities
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10

    const recommendedCities = scoredCities
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5

    return {
      status: 'success',
      recommendations: {
        destinations: recommendedCities,
        activities: recommendedActivities
      }
    };
  }
}

export default new RecommendationService();
