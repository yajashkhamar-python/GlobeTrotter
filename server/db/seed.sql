-- server/db/seed.sql

-- Clear existing data
DELETE FROM trip_activities;
DELETE FROM activities;
DELETE FROM trip_stops;
DELETE FROM cities;

-- Insert sample cities
INSERT INTO cities (id, name, country, region, description, cost_index, popularity, latitude, longitude) VALUES
(1, 'Paris', 'France', 'Europe', 'The City of Light, known for its cafe culture and iconic landmarks.', 3, 95, 48.8566, 2.3522),
(2, 'Rome', 'Italy', 'Europe', 'The Eternal City, featuring ancient ruins and rich history.', 3, 90, 41.9028, 12.4964),
(3, 'Barcelona', 'Spain', 'Europe', 'A vibrant coastal city famous for Gaudí architecture.', 3, 88, 41.3851, 2.1734),
(4, 'London', 'UK', 'Europe', 'A bustling metropolis blending historical charm and modern culture.', 4, 92, 51.5074, -0.1278),
(5, 'Tokyo', 'Japan', 'Asia', 'A dynamic city where traditional culture meets neon-lit streets.', 3, 96, 35.6762, 139.6503),
(6, 'Dubai', 'UAE', 'Middle East', 'A futuristic city of skyscrapers, luxury shopping, and desert adventures.', 4, 85, 25.2048, 55.2708);

-- Reset sequence for cities (assuming we hardcoded 1-6)
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));

-- Insert sample activities
INSERT INTO activities (city_id, name, description, type, cost, duration) VALUES
(1, 'Eiffel Tower', 'Iconic iron lattice tower on the Champ de Mars.', 'Sightseeing', 30.00, '2h'),
(1, 'Louvre Museum', 'World''s largest art museum and historic monument.', 'Culture', 20.00, 'Half day'),
(2, 'Colosseum', 'Ancient gladiatorial arena.', 'History', 18.00, '2h'),
(2, 'Vatican Museums', 'Vast collection of art and historical pieces, including the Sistine Chapel.', 'Culture', 25.00, 'Half day'),
(3, 'Sagrada Família', 'Unfinished basilica designed by Antoni Gaudí.', 'Culture', 26.00, '2h'),
(4, 'British Museum', 'Comprehensive museum dedicated to human history.', 'Museum', 0.00, 'Half day'),
(5, 'Senso-ji Temple', 'Ancient Buddhist temple in Asakusa.', 'Culture', 0.00, '1h'),
(6, 'Burj Khalifa', 'The tallest building in the world.', 'Sightseeing', 45.00, '2h');

-- Note: We are not seeding users or trips here to keep it clean and safe for development.
-- Real user accounts and their data should be created through the application logic.
