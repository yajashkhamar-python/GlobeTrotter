import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const updates = [
  // Cities
  { table: 'cities', name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
  { table: 'cities', name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
  { table: 'cities', name: 'Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
  { table: 'cities', name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
  { table: 'cities', name: 'Barcelona', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80' },
  { table: 'cities', name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
  // Activities
  { table: 'activities', name: 'Eiffel Tower', image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Louvre Museum', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Colosseum', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Vatican Museums', image: 'https://images.unsplash.com/photo-1572251390462-8172c3dffb7b?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Sagrada Família', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'British Museum', image: 'https://images.unsplash.com/photo-1563889163273-df33e3820251?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Senso-ji Temple', image: 'https://images.unsplash.com/photo-1590214815259-25ea8c087dc2?auto=format&fit=crop&w=800&q=80' },
  { table: 'activities', name: 'Burj Khalifa', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' }
];

async function run() {
  try {
    for (let u of updates) {
      await pool.query(`UPDATE ${u.table} SET image = $1 WHERE name = $2`, [u.image, u.name]);
      console.log(`Updated ${u.table} - ${u.name}`);
    }
    console.log('Finished updating DB images');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
