-- GlobeTrotter Enhanced Seed Data
-- Run this to update city images and add rich activities
-- Safe to run multiple times (uses ON CONFLICT / DELETE + INSERT pattern)

-- Update city images
UPDATE cities SET image = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' WHERE name = 'Paris';
UPDATE cities SET image = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' WHERE name = 'Rome';
UPDATE cities SET image = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80' WHERE name = 'Barcelona';
UPDATE cities SET image = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' WHERE name = 'London';
UPDATE cities SET image = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' WHERE name = 'Tokyo';
UPDATE cities SET image = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' WHERE name = 'Dubai';

-- Remove old sparse activities and re-seed rich ones
DELETE FROM trip_activities;
DELETE FROM activities;

-- PARIS activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Eiffel Tower', 'Iconic iron lattice tower with panoramic views of Paris from its summit. Built in 1889, it is the world''s most visited paid monument.', 'Sightseeing', 30.00, '2–3 hours', 'https://images.unsplash.com/photo-1431274172761-fcdab704a0a4?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Louvre Museum', 'World''s largest art museum housing nearly 35,000 works of art, including the Mona Lisa and Venus de Milo.', 'Culture', 22.00, 'Half day', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Notre-Dame Cathedral', 'Medieval Catholic cathedral on the Île de la Cité, a masterpiece of French Gothic architecture.', 'Culture', 0.00, '1–2 hours', 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Montmartre & Sacré-Cœur', 'Explore the artistic hilltop neighbourhood and its gleaming basilica with stunning views over Paris.', 'Sightseeing', 0.00, '3–4 hours', 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Palace of Versailles', 'Opulent royal château and gardens, a UNESCO World Heritage site 20km from Paris.', 'History', 20.00, 'Full day', 'https://images.unsplash.com/photo-1579371879261-60e8a24da4f4?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Seine River Cruise', 'Relaxing 1-hour boat cruise along the Seine, passing iconic Parisian landmarks.', 'Experience', 15.00, '1 hour', 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=600&q=80'
FROM cities c WHERE c.name = 'Paris';

-- ROME activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Colosseum', 'Ancient gladiatorial arena that could hold up to 80,000 spectators, a symbol of Imperial Rome.', 'History', 18.00, '2–3 hours', 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&q=80'
FROM cities c WHERE c.name = 'Rome';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Vatican Museums & Sistine Chapel', 'Vast collection of art accumulated by popes, culminating in Michelangelo''s breathtaking Sistine Chapel ceiling.', 'Culture', 27.00, 'Half day', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'
FROM cities c WHERE c.name = 'Rome';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Trevi Fountain', 'The largest Baroque fountain in Rome and one of the most famous in the world. Toss a coin to ensure your return.', 'Sightseeing', 0.00, '30 min', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80'
FROM cities c WHERE c.name = 'Rome';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Roman Forum', 'Sprawling ruins of the political and commercial heart of ancient Rome, adjacent to the Palatine Hill.', 'History', 12.00, '2 hours', 'https://images.unsplash.com/photo-1568721463170-8a0e6b1db8c4?w=600&q=80'
FROM cities c WHERE c.name = 'Rome';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Borghese Gallery', 'Intimate museum in a 17th-century villa housing masterpieces by Bernini, Caravaggio, and Raphael.', 'Culture', 13.00, '2 hours', 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80'
FROM cities c WHERE c.name = 'Rome';

-- BARCELONA activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sagrada Família', 'Gaudí''s unfinished masterpiece basilica, under construction since 1882 and a UNESCO World Heritage Site.', 'Culture', 26.00, '2–3 hours', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80'
FROM cities c WHERE c.name = 'Barcelona';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Park Güell', 'Colourful mosaic park designed by Gaudí with panoramic views of Barcelona and the Mediterranean.', 'Sightseeing', 10.00, '2 hours', 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=600&q=80'
FROM cities c WHERE c.name = 'Barcelona';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Las Ramblas & Gothic Quarter', 'Stroll the famous tree-lined pedestrian boulevard and explore the labyrinthine medieval Gothic Quarter.', 'Sightseeing', 0.00, '3 hours', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
FROM cities c WHERE c.name = 'Barcelona';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Barceloneta Beach', 'Iconic urban beach on the Mediterranean coast, perfect for swimming, sunbathing, and fresh seafood.', 'Experience', 0.00, 'Half day', 'https://images.unsplash.com/photo-1579453925597-1f44fde5b63c?w=600&q=80'
FROM cities c WHERE c.name = 'Barcelona';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Casa Batlló', 'One of Gaudí''s most celebrated buildings with a breathtaking dragon-scale rooftop.', 'Culture', 35.00, '1–2 hours', 'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=600&q=80'
FROM cities c WHERE c.name = 'Barcelona';

-- LONDON activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'British Museum', 'One of the world''s greatest museums of human history, art and culture. Entry is free.', 'Museum', 0.00, 'Half day', 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?w=600&q=80'
FROM cities c WHERE c.name = 'London';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Tower of London', 'Historic castle on the Thames, home to the Crown Jewels and centuries of royal history.', 'History', 32.00, '3 hours', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80'
FROM cities c WHERE c.name = 'London';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Buckingham Palace', 'Official residence of the British monarch. Catch the Changing of the Guard ceremony.', 'Sightseeing', 0.00, '1–2 hours', 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80'
FROM cities c WHERE c.name = 'London';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'London Eye', 'Giant Ferris wheel on the South Bank offering 360° views of London from 135 metres.', 'Experience', 28.00, '30 min', 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80'
FROM cities c WHERE c.name = 'London';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Tate Modern', 'World-leading museum of modern and contemporary art in a converted power station on the Thames.', 'Culture', 0.00, '3 hours', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80'
FROM cities c WHERE c.name = 'London';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Borough Market', 'London''s oldest and most renowned food market. Sample artisan cheeses, fresh produce, and street food.', 'Food', 0.00, '2 hours', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80'
FROM cities c WHERE c.name = 'London';

-- TOKYO activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Senso-ji Temple', 'Tokyo''s oldest Buddhist temple in Asakusa, featuring the iconic Thunder Gate and vibrant Nakamise shopping street.', 'Culture', 0.00, '2 hours', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Shinjuku Gyoen Garden', 'Beautiful national garden with Japanese, French, and English garden sections — stunning cherry blossoms in spring.', 'Nature', 5.00, '2–3 hours', 'https://images.unsplash.com/photo-1601823984263-b87b59798b70?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Shibuya Crossing', 'Experience the world''s busiest pedestrian crossing, surrounded by neon lights and giant screens.', 'Sightseeing', 0.00, '1 hour', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'teamLab Borderless', 'Immersive digital art museum — a world of wonders without maps, boundaries or fixed rules.', 'Experience', 32.00, '3 hours', 'https://images.unsplash.com/photo-1575516092935-06a85a4dde07?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Tsukiji Outer Market', 'Explore Japan''s most famous fish market district and sample fresh sushi, sashimi, and Japanese street food.', 'Food', 0.00, '2 hours', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Harajuku & Takeshita Street', 'Wander through Tokyo''s fashion capital and the kaleidoscopic Takeshita Street packed with quirky boutiques.', 'Shopping', 0.00, '2–3 hours', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80'
FROM cities c WHERE c.name = 'Tokyo';

-- DUBAI activities
INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Burj Khalifa', 'The world''s tallest building at 828m. Ascend to the observation decks on floors 124 and 148 for breathtaking views.', 'Sightseeing', 45.00, '2 hours', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Dubai Mall', 'One of the world''s largest shopping centres, home to 1,200 stores, an indoor ice rink and the Dubai Aquarium.', 'Shopping', 0.00, 'Half day', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Desert Safari', 'Thrilling dune-bashing adventure followed by camel riding, sandboarding, and a traditional Bedouin dinner.', 'Adventure', 80.00, 'Half day', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Palm Jumeirah', 'Visit the iconic palm-shaped island and enjoy views from the Atlantis resort or a dhow boat cruise.', 'Sightseeing', 20.00, '3 hours', 'https://images.unsplash.com/photo-1534759926643-b34c4d08c40c?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Dubai Creek & Gold Souk', 'Take an abra (traditional wooden boat) across the historic creek and explore the glittering Gold and Spice Souks.', 'Culture', 5.00, '3 hours', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Museum of the Future', 'Futuristic torus-shaped museum exploring visions of tomorrow through immersive experiences.', 'Experience', 55.00, '3 hours', 'https://images.unsplash.com/photo-1626901578832-0c5d30aae6a0?w=600&q=80'
FROM cities c WHERE c.name = 'Dubai';

-- Reset activities sequence
SELECT setval('activities_id_seq', (SELECT MAX(id) FROM activities));
