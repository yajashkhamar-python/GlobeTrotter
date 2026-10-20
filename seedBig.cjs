const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  // London Activities
  { city_id: 1, name: 'London Eye', description: 'Giant observation wheel', type: 'Sightseeing', cost: 35, duration: '1.5 h' },
  { city_id: 1, name: 'Tower of London', description: 'Historic castle on the north bank', type: 'History', cost: 33, duration: '3 h' },
  { city_id: 1, name: 'British Museum', description: 'Human history and culture museum', type: 'Museum', cost: 0, duration: '4 h' },
  { city_id: 1, name: 'Natural History Museum', description: 'Vast array of specimens', type: 'Museum', cost: 0, duration: '3 h' },
  { city_id: 1, name: 'Buckingham Palace', description: 'London residence of the monarch', type: 'History', cost: 30, duration: '2.5 h' },
  { city_id: 1, name: 'Hyde Park', description: 'One of the largest parks', type: 'Park', cost: 0, duration: '2 h' },
  { city_id: 1, name: 'Westminster Abbey', description: 'Large gothic abbey church', type: 'History', cost: 27, duration: '2 h' },
  { city_id: 1, name: 'Tower Bridge', description: 'Iconic suspension bridge', type: 'Sightseeing', cost: 12, duration: '1.5 h' },
  { city_id: 1, name: 'Tate Modern', description: 'Modern and contemporary art', type: 'Art', cost: 0, duration: '3 h' },
  { city_id: 1, name: 'The Shard', description: '72-storey skyscraper', type: 'Sightseeing', cost: 32, duration: '2 h' },
  { city_id: 1, name: 'Borough Market', description: 'Historic food market', type: 'Food', cost: 0, duration: '2 h' },
  { city_id: 1, name: 'Camden Market', description: 'Eclectic market for fashion and food', type: 'Shopping', cost: 0, duration: '3 h' },
  { city_id: 1, name: 'Covent Garden', description: 'Shopping and entertainment hub', type: 'Entertainment', cost: 0, duration: '2 h' },
  { city_id: 1, name: 'St Pauls Cathedral', description: 'Anglican cathedral', type: 'Architecture', cost: 21, duration: '2 h' },
  { city_id: 1, name: 'Greenwich Observatory', description: 'Home of the prime meridian', type: 'Museum', cost: 18, duration: '2.5 h' },
  { city_id: 1, name: 'Harry Potter Studio Tour', description: 'Warner Bros. studio tour', type: 'Entertainment', cost: 51, duration: '4 h' },
  { city_id: 1, name: 'Kew Gardens', description: 'Royal botanic gardens', type: 'Nature', cost: 20, duration: '3 h' },
  { city_id: 1, name: 'Victoria and Albert Museum', description: 'Art and design museum', type: 'Museum', cost: 0, duration: '3 h' },
  { city_id: 1, name: 'Shakespeare Globe', description: 'Reconstruction of the Globe Theatre', type: 'Culture', cost: 17, duration: '2 h' },
  { city_id: 1, name: 'Churchill War Rooms', description: 'Underground nerve centre', type: 'History', cost: 27, duration: '2 h' },
  { city_id: 1, name: 'Trafalgar Square', description: 'Public square in Westminster', type: 'Sightseeing', cost: 0, duration: '1 h' },

  // Paris Activities (Assuming Paris city_id is 2)
  { city_id: 2, name: 'Eiffel Tower', description: 'Iconic iron lattice tower', type: 'Sightseeing', cost: 28, duration: '2 h' },
  { city_id: 2, name: 'Louvre Museum', description: 'World largest art museum', type: 'Museum', cost: 22, duration: '4 h' },
  { city_id: 2, name: 'Notre-Dame Cathedral', description: 'Medieval Catholic cathedral', type: 'Architecture', cost: 0, duration: '1.5 h' },
  { city_id: 2, name: 'Arc de Triomphe', description: 'Monument in Paris', type: 'History', cost: 13, duration: '1.5 h' },
  { city_id: 2, name: 'Champs-Élysées', description: 'Avenue for luxury shopping', type: 'Shopping', cost: 0, duration: '2 h' },
  { city_id: 2, name: 'Sacré-Cœur', description: 'Basilica in Montmartre', type: 'Architecture', cost: 0, duration: '2 h' },
  { city_id: 2, name: 'Musée d Orsay', description: 'Museum with impressionist art', type: 'Museum', cost: 16, duration: '3 h' },
  { city_id: 2, name: 'Palace of Versailles', description: 'Royal château in Versailles', type: 'History', cost: 21, duration: '4 h' },
  { city_id: 2, name: 'Sainte-Chapelle', description: 'Royal chapel with stained glass', type: 'Architecture', cost: 11, duration: '1.5 h' },
  { city_id: 2, name: 'Seine River Cruise', description: 'Boat tour along the Seine', type: 'Sightseeing', cost: 15, duration: '1 h' },
  { city_id: 2, name: 'Moulin Rouge', description: 'Cabaret in Paris', type: 'Entertainment', cost: 120, duration: '3 h' },
  { city_id: 2, name: 'Montmartre', description: 'Historic hill district', type: 'Culture', cost: 0, duration: '3 h' },
  { city_id: 2, name: 'Centre Pompidou', description: 'Modern art museum', type: 'Art', cost: 15, duration: '2.5 h' },
  { city_id: 2, name: 'Panthéon', description: 'Mausoleum for notable French citizens', type: 'History', cost: 11, duration: '1.5 h' },
  { city_id: 2, name: 'Luxembourg Gardens', description: 'Beautiful public park', type: 'Park', cost: 0, duration: '2 h' },
  { city_id: 2, name: 'Tuileries Garden', description: 'Public garden near the Louvre', type: 'Park', cost: 0, duration: '1.5 h' },
  { city_id: 2, name: 'Catacombs of Paris', description: 'Underground ossuaries', type: 'History', cost: 29, duration: '2 h' },
  { city_id: 2, name: 'Disneyland Paris', description: 'Theme park resort', type: 'Entertainment', cost: 100, duration: '8 h' },
  { city_id: 2, name: 'Montparnasse Tower', description: 'Skyscraper with observation deck', type: 'Sightseeing', cost: 18, duration: '1.5 h' },
  { city_id: 2, name: 'Palais Garnier', description: 'Opera house', type: 'Culture', cost: 14, duration: '2 h' },

  // Tokyo (city_id: 3)
  { city_id: 3, name: 'Senso-ji', description: 'Ancient Buddhist temple', type: 'History', cost: 0, duration: '2 h' },
  { city_id: 3, name: 'Tokyo Tower', description: 'Communications and observation tower', type: 'Sightseeing', cost: 12, duration: '2 h' },
  { city_id: 3, name: 'Meiji Shrine', description: 'Shinto shrine dedicated to Emperor Meiji', type: 'History', cost: 0, duration: '1.5 h' },
  { city_id: 3, name: 'Shibuya Crossing', description: 'Famous busy intersection', type: 'Sightseeing', cost: 0, duration: '1 h' },
  { city_id: 3, name: 'Tokyo Skytree', description: 'Tallest structure in Japan', type: 'Sightseeing', cost: 25, duration: '2 h' },
  { city_id: 3, name: 'Tsukiji Outer Market', description: 'Market for fresh seafood', type: 'Food', cost: 0, duration: '2 h' },
  { city_id: 3, name: 'Shinjuku Gyoen', description: 'Large park and garden', type: 'Nature', cost: 5, duration: '2.5 h' },
  { city_id: 3, name: 'Akihabara', description: 'Electric town and anime hub', type: 'Shopping', cost: 0, duration: '3 h' },
  { city_id: 3, name: 'Imperial Palace', description: 'Primary residence of the Emperor', type: 'History', cost: 0, duration: '2 h' },
  { city_id: 3, name: 'Odaiba', description: 'Artificial island with entertainment', type: 'Entertainment', cost: 0, duration: '4 h' },
  { city_id: 3, name: 'Ueno Park', description: 'Public park with museums', type: 'Park', cost: 0, duration: '3 h' },
  { city_id: 3, name: 'Tokyo National Museum', description: 'Museum of Japanese art and antiquities', type: 'Museum', cost: 10, duration: '3 h' },
  { city_id: 3, name: 'Harajuku', description: 'Center of youth culture and fashion', type: 'Culture', cost: 0, duration: '2 h' },
  { city_id: 3, name: 'Ghibli Museum', description: 'Museum of Studio Ghibli', type: 'Museum', cost: 10, duration: '2 h' },
  { city_id: 3, name: 'Roppongi Hills', description: 'Urban development with view', type: 'Sightseeing', cost: 18, duration: '2.5 h' },
  { city_id: 3, name: 'TeamLab Planets', description: 'Immersive digital art museum', type: 'Art', cost: 30, duration: '2 h' },
  { city_id: 3, name: 'Asakusa', description: 'Historic district in Tokyo', type: 'Culture', cost: 0, duration: '2.5 h' },
  { city_id: 3, name: 'Takeshita Street', description: 'Busy shopping street', type: 'Shopping', cost: 0, duration: '1.5 h' },
  { city_id: 3, name: 'Ginza', description: 'Upscale shopping district', type: 'Shopping', cost: 0, duration: '3 h' },
  { city_id: 3, name: 'Tokyo Disneyland', description: 'Theme park', type: 'Entertainment', cost: 80, duration: '8 h' },
];

async function seed() {
  for (const act of activities) {
    try {
      await pool.query(
        'INSERT INTO activities (city_id, name, description, type, cost, duration, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [act.city_id, act.name, act.description, act.type, act.cost, act.duration, '']
      );
    } catch (e) {}
  }
  console.log('Seeded 60 activities');
  pool.end();
}
seed();
