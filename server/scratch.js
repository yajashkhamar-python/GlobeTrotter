import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/globetrotter'
});

const updates = [
  {
    name: 'Tower Bridge',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    cost: 12,
    rating: 4.7,
    duration: '2-3 hours'
  },
  {
    name: 'Buckingham Palace',
    image: 'https://images.unsplash.com/photo-1549808383-051877478051?auto=format&fit=crop&w=800&q=80',
    cost: 30,
    rating: 4.6,
    duration: '2-3 hours'
  },
  {
    name: 'British Museum',
    image: 'https://images.unsplash.com/photo-1563889163273-df33e3820251?auto=format&fit=crop&w=800&q=80',
    cost: 0,
    rating: 4.8,
    duration: '2-3 hours'
  },
  {
    name: 'London Eye',
    image: 'https://images.unsplash.com/photo-1520626337972-8f92161b9795?auto=format&fit=crop&w=800&q=80',
    cost: 25,
    rating: 4.4,
    duration: '1-2 hours'
  }
];

async function run() {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='rating') THEN
          ALTER TABLE activities ADD COLUMN rating NUMERIC(3,1);
        END IF;
      END $$;
    `);

    for (let u of updates) {
      await pool.query(`
        UPDATE activities 
        SET image = $1, cost = $2, rating = $3, duration = $4 
        WHERE name = $5
      `, [u.image, u.cost, u.rating, u.duration, u.name]);
      console.log(`Updated ${u.name}`);
    }
    console.log('Finished updating London activities');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
