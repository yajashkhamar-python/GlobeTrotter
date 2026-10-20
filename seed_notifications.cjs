const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const users = await p.query('SELECT id FROM users');
  const userIds = users.rows.map(u => u.id);
  console.log('Seeding notifications for user IDs:', userIds);

  for (const uid of userIds) {
    const existing = await p.query('SELECT COUNT(*) FROM notifications WHERE user_id=$1', [uid]);
    if (parseInt(existing.rows[0].count) === 0) {
      await p.query(
        'INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at) VALUES ' +
        "($1, 'trip_reminder', 'Upcoming Trip: London', 'Your trip starts soon! Review your day-wise itinerary.', '/trips', false, NOW() - INTERVAL '2 hours')," +
        "($1, 'recommendation', 'Explore New Attractions', 'Curated spots and hidden gems are ready for your next adventure.', '/explore', false, NOW() - INTERVAL '1 day')," +
        "($1, 'system', 'Welcome to GlobeTrotter! ✈️', 'Create itineraries, manage budgets, and explore worldwide destinations.', '/dashboard', true, NOW() - INTERVAL '3 days')",
        [uid]
      );
    }
  }
  const total = await p.query('SELECT COUNT(*) FROM notifications');
  console.log('Total notifications in DB now:', total.rows[0].count);
  p.end();
}
seed().catch(e => { console.error(e); p.end(); });
