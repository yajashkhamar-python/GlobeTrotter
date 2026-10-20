const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const phuketImage = 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80';

const activityImages = {
  'James Bond Island Tour': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
  'Scuba Diving at Racha Yai': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'Patong Beach Nightlife': 'https://images.unsplash.com/photo-1538356111053-748a48e1acb8?w=800&q=80',
  'Simon Cabaret Show': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'Phang Nga Bay Cruise': 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80',
  'Wat Chalong': 'https://images.unsplash.com/photo-1574706561339-38378eaeb1d4?w=800&q=80',
  'Phuket Elephant Sanctuary': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
  'Karon Viewpoint': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'Kata Noi Beach': 'https://images.unsplash.com/photo-1515404929826-76fff9fef6fe?w=800&q=80',
  'Phuket FantaSea': 'https://images.unsplash.com/photo-1606775196395-515437887e14?w=800&q=80',
};

async function run() {
  try {
    await pool.query("UPDATE trips SET cover_image = $1 WHERE name ILIKE '%phuket%' AND (cover_image IS NULL OR cover_image = '')", [phuketImage]);
    
    for (const [name, img] of Object.entries(activityImages)) {
      await pool.query("UPDATE activities SET image = $1 WHERE name = $2", [img, name]);
    }
    
    console.log("Images updated!");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
