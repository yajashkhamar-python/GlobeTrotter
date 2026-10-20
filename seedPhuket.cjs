const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    const res = await pool.query("SELECT id FROM cities WHERE name ILIKE '%phuket%'");
    if (res.rows.length === 0) {
      console.log('Phuket not found');
      return;
    }
    const cityId = res.rows[0].id;
    console.log('Phuket ID:', cityId);

    const activities = [
      { name: 'James Bond Island Tour', description: 'Explore iconic limestone cliffs.', type: 'Sightseeing', cost: 120, duration: '6 h' },
      { name: 'Scuba Diving at Racha Yai', description: 'Dive in clear waters with coral reefs.', type: 'Adventure', cost: 250, duration: '5 h' },
      { name: 'Patong Beach Nightlife', description: 'Vibrant nightlife and clubs on Bangla Road.', type: 'Experience', cost: 0, duration: '4 h' },
      { name: 'Simon Cabaret Show', description: 'Famous ladyboy cabaret show.', type: 'Culture', cost: 50, duration: '2 h' },
      { name: 'Phang Nga Bay Cruise', description: 'Relaxing cruise through emerald waters.', type: 'Sightseeing', cost: 100, duration: '4 h' },
      { name: 'Wat Chalong', description: 'Most important Buddhist temple in Phuket.', type: 'Culture', cost: 0, duration: '1 h' },
      { name: 'Phuket Elephant Sanctuary', description: 'Ethical elephant observation.', type: 'Nature', cost: 200, duration: '4 h' },
      { name: 'Karon Viewpoint', description: 'Panoramic views of three beaches.', type: 'Sightseeing', cost: 0, duration: '1 h' },
      { name: 'Kata Noi Beach', description: 'Quiet and beautiful sandy beach.', type: 'Nature', cost: 0, duration: '3 h' },
      { name: 'Phuket FantaSea', description: 'Cultural theme park and show.', type: 'Entertainment', cost: 150, duration: '3 h' },
    ];

    for (const act of activities) {
      await pool.query(
        'INSERT INTO activities (city_id, name, description, type, cost, duration, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [cityId, act.name, act.description, act.type, act.cost, act.duration, '']
      );
    }
    console.log('Seeded Phuket activities');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

seed();
