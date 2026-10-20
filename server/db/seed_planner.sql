-- GlobeTrotter Planner Expansion Seed
-- Adds major international cities and activities for the Smart Trip Planner
-- IDEMPOTENT: Uses INSERT WHERE NOT EXISTS pattern to prevent duplicates

-- ============================================================
-- CITIES
-- ============================================================

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Bangkok', 'Thailand', 'Asia',
  'A dazzling city of ornate temples, street food, and vibrant nightlife along the Chao Phraya river.',
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
  2, 92, 13.75398, 100.50144
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Bangkok' AND country='Thailand');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Phuket', 'Thailand', 'Asia',
  'Thailand''s largest island featuring stunning beaches, turquoise waters, and a lively nightlife scene.',
  'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
  2, 88, 7.88481, 98.39381
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Phuket' AND country='Thailand');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Mumbai', 'India', 'Asia',
  'India''s financial capital — a city of contrasts, Bollywood glamour and colonial-era architecture.',
  'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80',
  1, 87, 19.07283, 72.88261
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Mumbai' AND country='India');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Delhi', 'India', 'Asia',
  'India''s historic capital encompassing Old Delhi''s Mughal splendour and New Delhi''s grand boulevards.',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  1, 85, 28.65195, 77.23149
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Delhi' AND country='India');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Jaipur', 'India', 'Asia',
  'The Pink City of Rajasthan — majestic palaces, vibrant bazaars and desert culture.',
  'https://images.unsplash.com/photo-1477587458883-47145ed68a5d?w=800&q=80',
  1, 81, 26.91245, 75.78727
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Jaipur' AND country='India');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Goa', 'India', 'Asia',
  'India''s party capital — pristine beaches, Portuguese heritage, and vibrant beach shacks.',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  1, 84, 15.29901, 74.12396
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Goa' AND country='India');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Singapore', 'Singapore', 'Asia',
  'A gleaming city-state blending futuristic architecture, multicultural cuisine, and lush greenery.',
  'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  4, 94, 1.35208, 103.81983
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Singapore' AND country='Singapore');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Bali', 'Indonesia', 'Asia',
  'A paradise island with terraced rice paddies, sacred temples, stunning beaches and vibrant arts scene.',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  1, 93, -8.34053, 115.09195
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Bali' AND country='Indonesia');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Kuala Lumpur', 'Malaysia', 'Asia',
  'A cosmopolitan capital famous for the iconic Petronas Twin Towers and incredible street food.',
  'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  2, 86, 3.14120, 101.68653
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Kuala Lumpur' AND country='Malaysia');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Kathmandu', 'Nepal', 'Asia',
  'The gateway to the Himalayas — a city of ancient temples, monastery courtyards and trekking culture.',
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80',
  1, 78, 27.70169, 85.31420
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Kathmandu' AND country='Nepal');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Istanbul', 'Turkey', 'Europe',
  'Where East meets West — a stunning city straddling two continents with mosques, bazaars and Bosphorus views.',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  2, 90, 41.01384, 28.94966
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Istanbul' AND country='Turkey');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Amsterdam', 'Netherlands', 'Europe',
  'The City of Canals — charming gabled houses, world-class museums and a bicycle-friendly culture.',
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  3, 88, 52.37403, 4.88969
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Amsterdam' AND country='Netherlands');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Athens', 'Greece', 'Europe',
  'The birthplace of democracy — ancient ruins including the Acropolis rise above a vibrant modern city.',
  'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
  2, 87, 37.97945, 23.71622
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Athens' AND country='Greece');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Lisbon', 'Portugal', 'Europe',
  'Europe''s westernmost capital — hilly streets, pastel tiles, Fado music and stunning Atlantic views.',
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  2, 86, 38.71667, -9.13333
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Lisbon' AND country='Portugal');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Santorini', 'Greece', 'Europe',
  'Iconic Aegean island with whitewashed buildings, blue-domed churches and magnificent caldera sunsets.',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  3, 91, 36.39310, 25.46190
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Santorini' AND country='Greece');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'New York', 'United States', 'Americas',
  'The city that never sleeps — Times Square, Central Park, iconic skyline and world-class arts.',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  4, 97, 40.71427, -74.00597
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='New York' AND country='United States');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Sydney', 'Australia', 'Oceania',
  'Australia''s harbour city — the iconic Opera House, Bondi Beach and Blue Mountains nearby.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  4, 91, -33.86785, 151.20732
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Sydney' AND country='Australia');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Cairo', 'Egypt', 'Africa',
  'Home to the ancient Pyramids of Giza, the Sphinx, and thousands of years of pharaonic history.',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
  1, 85, 30.06263, 31.24967
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Cairo' AND country='Egypt');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Abu Dhabi', 'United Arab Emirates', 'Asia',
  'The UAE capital — Sheikh Zayed Grand Mosque, Yas Island and a blend of heritage and modernity.',
  'https://images.unsplash.com/photo-1626850877203-35ee08da26de?w=800&q=80',
  4, 83, 24.46667, 54.36667
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Abu Dhabi' AND country='United Arab Emirates');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Colombo', 'Sri Lanka', 'Asia',
  'The vibrant capital of Sri Lanka — colonial architecture, spice bazaars and golden beaches nearby.',
  'https://images.unsplash.com/photo-1573946435680-ae0b48bc07be?w=800&q=80',
  1, 72, 6.93194, 79.84778
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Colombo' AND country='Sri Lanka');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Maldives', 'Maldives', 'Asia',
  'A tropical paradise of pristine atolls, crystal-clear lagoons and overwater bungalows.',
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  4, 90, 4.17521, 73.50916
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Maldives' AND country='Maldives');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Zurich', 'Switzerland', 'Europe',
  'Switzerland''s financial hub nestled between the Alps and Lake Zurich — clean, efficient and beautiful.',
  'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=80',
  4, 82, 47.37689, 8.54169
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Zurich' AND country='Switzerland');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Rio de Janeiro', 'Brazil', 'Americas',
  'The Marvellous City — Christ the Redeemer, Copacabana Beach, carnival culture and samba rhythms.',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  2, 88, -22.90278, -43.17167
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Rio de Janeiro' AND country='Brazil');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Cape Town', 'South Africa', 'Africa',
  'Where Table Mountain meets the ocean — diverse culture, stunning landscapes and fine wines.',
  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  2, 86, -33.92584, 18.42322
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Cape Town' AND country='South Africa');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Osaka', 'Japan', 'Asia',
  'Japan''s kitchen capital — street food paradise, Dotonbori neon lights and Osaka Castle.',
  'https://images.unsplash.com/photo-1589530359549-a9b1c6e49c57?w=800&q=80',
  3, 87, 34.69374, 135.50218
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Osaka' AND country='Japan');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Kyoto', 'Japan', 'Asia',
  'Japan''s ancient imperial capital — thousands of temples, geisha districts and bamboo forests.',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
  3, 91, 35.01116, 135.76801
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Kyoto' AND country='Japan');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Vienna', 'Austria', 'Europe',
  'The City of Music — Imperial palaces, coffee houses, Mozart and world-class opera.',
  'https://images.unsplash.com/photo-1516550893885-985c836c18c4?w=800&q=80',
  3, 84, 48.20849, 16.37208
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Vienna' AND country='Austria');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Prague', 'Czech Republic', 'Europe',
  'The City of a Hundred Spires — fairytale architecture, medieval old town and vibrant culture.',
  'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
  2, 88, 50.08804, 14.42076
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Prague' AND country='Czech Republic');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Marrakech', 'Morocco', 'Africa',
  'The Red City — maze-like medinas, spice souks, riads and the vibrant Djemaa el-Fna square.',
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
  1, 83, 31.63417, -7.99994
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Marrakech' AND country='Morocco');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Mexico City', 'Mexico', 'Americas',
  'One of the world''s largest cities — Aztec ruins, colonial baroque, world-class cuisine and art.',
  'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  1, 83, 19.42847, -99.12766
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Mexico City' AND country='Mexico');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Toronto', 'Canada', 'Americas',
  'Canada''s most diverse city — CN Tower, multicultural neighbourhoods, and Niagara Falls nearby.',
  'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
  3, 82, 43.70011, -79.41630
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Toronto' AND country='Canada');

INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
SELECT 'Colombo', 'Sri Lanka', 'Asia',
  'A cosmopolitan port city that serves as the gateway to Sri Lanka''s treasures.',
  'https://images.unsplash.com/photo-1589812308675-2a029461b97c?w=800&q=80',
  1, 72, 6.93194, 79.84778
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name='Colombo' AND country='Sri Lanka');

-- ============================================================
-- ACTIVITIES — Bangkok
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Grand Palace', 'The former royal residence and most visited landmark in Thailand, featuring the sacred Emerald Buddha temple.', 'History', 500.00, '3 hours', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Grand Palace' AND cc.name='Bangkok');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Wat Arun', 'The Temple of Dawn on the Chao Phraya River — its towering spires are encrusted with colourful ceramics.', 'Culture', 100.00, '1-2 hours', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Wat Arun' AND cc.name='Bangkok');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Wat Pho', 'Home to the giant reclining Buddha, Wat Pho is Bangkok''s oldest and largest temple complex.', 'Culture', 200.00, '1-2 hours', 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Wat Pho' AND cc.name='Bangkok');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Chatuchak Weekend Market', 'One of the world''s largest weekend markets with over 15,000 stalls selling everything imaginable.', 'Shopping', 0.00, 'Half day', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Chatuchak Weekend Market' AND cc.name='Bangkok');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Bangkok Street Food Tour', 'Explore Bangkok''s legendary street food scene — pad thai, mango sticky rice, and fragrant curries.', 'Food', 800.00, '3 hours', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Bangkok Street Food Tour' AND cc.name='Bangkok');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Chao Phraya River Cruise', 'Scenic evening cruise along the Chao Phraya discovering riverside temples and city skyline.', 'Experience', 400.00, '2 hours', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80'
FROM cities c WHERE c.name='Bangkok' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Chao Phraya River Cruise' AND cc.name='Bangkok');

-- ============================================================
-- ACTIVITIES — Phuket
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Phi Phi Islands Day Trip', 'Crystal-clear waters, dramatic limestone cliffs and vibrant coral reefs around the stunning Phi Phi islands.', 'Adventure', 1200.00, 'Full day', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80'
FROM cities c WHERE c.name='Phuket' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Phi Phi Islands Day Trip' AND cc.name='Phuket');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Patong Beach', 'Phuket''s most famous beach — golden sands, warm Andaman waters and beachside restaurants.', 'Experience', 0.00, 'Half day', 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80'
FROM cities c WHERE c.name='Phuket' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Patong Beach' AND cc.name='Phuket');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Big Buddha Phuket', 'A 45-metre marble statue atop Nakkerd Hill with panoramic views over the island and surrounding sea.', 'Sightseeing', 0.00, '1-2 hours', 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=600&q=80'
FROM cities c WHERE c.name='Phuket' AND c.country='Thailand'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Big Buddha Phuket' AND cc.name='Phuket');

-- ============================================================
-- ACTIVITIES — Mumbai
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Gateway of India', 'Iconic 26-metre arch monument overlooking the Arabian Sea, built in 1924 to commemorate King George V''s visit.', 'History', 0.00, '1 hour', 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80'
FROM cities c WHERE c.name='Mumbai' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Gateway of India' AND cc.name='Mumbai');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Elephanta Caves', 'UNESCO World Heritage rock-cut cave temples dedicated to Lord Shiva, on an island in Mumbai harbour.', 'History', 600.00, 'Half day', 'https://images.unsplash.com/photo-1474812890-5e1fec62af59?w=600&q=80'
FROM cities c WHERE c.name='Mumbai' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Elephanta Caves' AND cc.name='Mumbai');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Dharavi & Street Food Walk', 'Discover authentic Mumbai street food — vada pav, pav bhaji, and Mumbai-style chaat in local neighbourhoods.', 'Food', 500.00, '3 hours', 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600&q=80'
FROM cities c WHERE c.name='Mumbai' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Dharavi & Street Food Walk' AND cc.name='Mumbai');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Marine Drive', 'Mumbai''s iconic 3.6km promenade along the Arabian Sea, best at sunset and known as the Queen''s Necklace.', 'Sightseeing', 0.00, '1-2 hours', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
FROM cities c WHERE c.name='Mumbai' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Marine Drive' AND cc.name='Mumbai');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Chhatrapati Shivaji Maharaj Terminus', 'A UNESCO-listed Victorian Gothic railway station and one of India''s finest examples of colonial architecture.', 'Architecture', 0.00, '1 hour', 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80'
FROM cities c WHERE c.name='Mumbai' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Chhatrapati Shivaji Maharaj Terminus' AND cc.name='Mumbai');

-- ============================================================
-- ACTIVITIES — Delhi
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Red Fort', 'Magnificent Mughal fortress built by Emperor Shah Jahan in 1648, a UNESCO World Heritage Site.', 'History', 600.00, '2-3 hours', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80'
FROM cities c WHERE c.name='Delhi' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Red Fort' AND cc.name='Delhi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Qutub Minar', 'The world''s tallest brick minaret at 72.5 metres, surrounded by ancient ruins and a UNESCO World Heritage Site.', 'History', 600.00, '2 hours', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80'
FROM cities c WHERE c.name='Delhi' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Qutub Minar' AND cc.name='Delhi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'India Gate', 'War memorial and Delhi''s most iconic landmark — a 42-metre archway amid wide lawns, perfect for evening walks.', 'Sightseeing', 0.00, '1 hour', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
FROM cities c WHERE c.name='Delhi' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='India Gate' AND cc.name='Delhi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Old Delhi Food Walk', 'Explore Chandni Chowk''s legendary street food — paranthas, jalebis, chaat and biryani in historic lanes.', 'Food', 800.00, '3 hours', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80'
FROM cities c WHERE c.name='Delhi' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Old Delhi Food Walk' AND cc.name='Delhi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Humayun''s Tomb', 'A magnificent Mughal garden-tomb and precursor to the Taj Mahal, a UNESCO World Heritage Site.', 'History', 600.00, '2 hours', 'https://images.unsplash.com/photo-1610213803974-e9e5fc60f032?w=600&q=80'
FROM cities c WHERE c.name='Delhi' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Humayun''s Tomb' AND cc.name='Delhi');

-- ============================================================
-- ACTIVITIES — Jaipur
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Amber Palace', 'A stunning hilltop fort-palace overlooking Maota Lake — ride an elephant up or walk through its ornate halls.', 'History', 500.00, '3-4 hours', 'https://images.unsplash.com/photo-1477587458883-47145ed68a5d?w=600&q=80'
FROM cities c WHERE c.name='Jaipur' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Amber Palace' AND cc.name='Jaipur');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Hawa Mahal', 'The Palace of Winds — a five-storey honeycomb facade of 953 windows built so royal ladies could observe street life.', 'Architecture', 200.00, '1 hour', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80'
FROM cities c WHERE c.name='Jaipur' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Hawa Mahal' AND cc.name='Jaipur');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'City Palace', 'The former Maharaja''s palace complex housing a museum with royal artefacts and art.', 'History', 700.00, '2 hours', 'https://images.unsplash.com/photo-1602301367037-1bb3d41bdb80?w=600&q=80'
FROM cities c WHERE c.name='Jaipur' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='City Palace' AND cc.name='Jaipur');

-- ============================================================
-- ACTIVITIES — Goa
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Baga Beach', 'Goa''s most famous beach — golden sand, water sports, beach shacks and vibrant nightlife.', 'Experience', 0.00, 'Half day', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80'
FROM cities c WHERE c.name='Goa' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Baga Beach' AND cc.name='Goa');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Basilica of Bom Jesus', 'A UNESCO-listed Baroque church housing the mortal remains of St. Francis Xavier — a stunning Portuguese gem.', 'Culture', 0.00, '1 hour', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80'
FROM cities c WHERE c.name='Goa' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Basilica of Bom Jesus' AND cc.name='Goa');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Dudhsagar Falls', 'One of India''s tallest waterfalls at 310 metres — a spectacular four-tiered cascade amidst lush jungle.', 'Nature', 600.00, 'Full day', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80'
FROM cities c WHERE c.name='Goa' AND c.country='India'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Dudhsagar Falls' AND cc.name='Goa');

-- ============================================================
-- ACTIVITIES — Singapore
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Gardens by the Bay', 'Futuristic park with giant Supertree structures, two cooled conservatories and a spectacular light show.', 'Nature', 50.00, '3-4 hours', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80'
FROM cities c WHERE c.name='Singapore' AND c.country='Singapore'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Gardens by the Bay' AND cc.name='Singapore');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Marina Bay Sands SkyPark', 'Observation deck atop the iconic hotel offering 360° panoramic views of Singapore''s stunning skyline.', 'Sightseeing', 32.00, '1-2 hours', 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=600&q=80'
FROM cities c WHERE c.name='Singapore' AND c.country='Singapore'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Marina Bay Sands SkyPark' AND cc.name='Singapore');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sentosa Island', 'A resort island with Universal Studios, beaches, cable car rides and numerous family attractions.', 'Experience', 38.00, 'Full day', 'https://images.unsplash.com/photo-1493707623765-2e6d6ef5d5b9?w=600&q=80'
FROM cities c WHERE c.name='Singapore' AND c.country='Singapore'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Sentosa Island' AND cc.name='Singapore');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Hawker Centre Food Tour', 'Explore Singapore''s legendary hawker centres — laksa, chicken rice, char kway teow and chilli crab.', 'Food', 25.00, '2 hours', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80'
FROM cities c WHERE c.name='Singapore' AND c.country='Singapore'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Hawker Centre Food Tour' AND cc.name='Singapore');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Chinatown & Little India', 'Explore Singapore''s vibrant ethnic enclaves — colourful temples, spice shops and authentic cuisine.', 'Culture', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1585851169036-a93b9dc25de3?w=600&q=80'
FROM cities c WHERE c.name='Singapore' AND c.country='Singapore'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Chinatown & Little India' AND cc.name='Singapore');

-- ============================================================
-- ACTIVITIES — Bali
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Tanah Lot Temple', 'Iconic sea temple perched on a rocky outcrop — most spectacular at sunset with crashing waves below.', 'Culture', 60000.00, '2 hours', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80'
FROM cities c WHERE c.name='Bali' AND c.country='Indonesia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Tanah Lot Temple' AND cc.name='Bali');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Ubud Monkey Forest', 'A sacred nature reserve and Hindu temple complex home to over 700 Balinese long-tailed macaques.', 'Nature', 50000.00, '2 hours', 'https://images.unsplash.com/photo-1587459374995-81c7b94a7e54?w=600&q=80'
FROM cities c WHERE c.name='Bali' AND c.country='Indonesia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Ubud Monkey Forest' AND cc.name='Bali');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Tegallalang Rice Terraces', 'Stunning UNESCO-listed subak irrigation rice terraces north of Ubud — a photographer''s paradise.', 'Nature', 15000.00, '2-3 hours', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
FROM cities c WHERE c.name='Bali' AND c.country='Indonesia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Tegallalang Rice Terraces' AND cc.name='Bali');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Kuta Beach Surf Lesson', 'Learn to surf on Bali''s legendary beginner-friendly waves at Kuta Beach with expert local instructors.', 'Adventure', 300000.00, '2 hours', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'
FROM cities c WHERE c.name='Bali' AND c.country='Indonesia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Kuta Beach Surf Lesson' AND cc.name='Bali');

-- ============================================================
-- ACTIVITIES — Istanbul
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Hagia Sophia', 'A breathtaking 6th-century Byzantine cathedral turned mosque — one of the great wonders of world architecture.', 'History', 0.00, '2 hours', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80'
FROM cities c WHERE c.name='Istanbul' AND c.country='Turkey'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Hagia Sophia' AND cc.name='Istanbul');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Topkapi Palace', 'The opulent palace of Ottoman sultans housing treasures including the Topkapi Dagger and Spoonmaker''s Diamond.', 'History', 300.00, '3-4 hours', 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600&q=80'
FROM cities c WHERE c.name='Istanbul' AND c.country='Turkey'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Topkapi Palace' AND cc.name='Istanbul');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Grand Bazaar', 'One of the world''s oldest and largest covered markets with over 4,000 shops — a sensory labyrinth.', 'Shopping', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80'
FROM cities c WHERE c.name='Istanbul' AND c.country='Turkey'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Grand Bazaar' AND cc.name='Istanbul');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Bosphorus Cruise', 'A scenic cruise along the strait separating Europe and Asia, passing palaces and historic fortresses.', 'Experience', 200.00, '2 hours', 'https://images.unsplash.com/photo-1604520268628-6d7fb8b6eb0d?w=600&q=80'
FROM cities c WHERE c.name='Istanbul' AND c.country='Turkey'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Bosphorus Cruise' AND cc.name='Istanbul');

-- ============================================================
-- ACTIVITIES — New York
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Statue of Liberty & Ellis Island', 'Iconic American symbol of freedom on Liberty Island, with fascinating immigration history at Ellis Island.', 'History', 24.00, 'Half day', 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=600&q=80'
FROM cities c WHERE c.name='New York' AND c.country='United States'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Statue of Liberty & Ellis Island' AND cc.name='New York');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Central Park', '840 acres of green space in the heart of Manhattan — row boats, concerts, ice skating and endless lawns.', 'Nature', 0.00, '2-4 hours', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80'
FROM cities c WHERE c.name='New York' AND c.country='United States'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Central Park' AND cc.name='New York');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Metropolitan Museum of Art', 'One of the world''s finest art museums housing over 2 million works spanning 5,000 years of history.', 'Museum', 25.00, 'Half day', 'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=600&q=80'
FROM cities c WHERE c.name='New York' AND c.country='United States'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Metropolitan Museum of Art' AND cc.name='New York');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Times Square & Broadway', 'The dazzling crossroads of the world — neon lights, Broadway shows and the best people-watching in NYC.', 'Entertainment', 15.00, '2-3 hours', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80'
FROM cities c WHERE c.name='New York' AND c.country='United States'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Times Square & Broadway' AND cc.name='New York');

-- ============================================================
-- ACTIVITIES — Sydney
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sydney Opera House Tour', 'Guided tour of the iconic UNESCO-listed architectural masterpiece and world-class performing arts venue.', 'Culture', 43.00, '1-2 hours', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'
FROM cities c WHERE c.name='Sydney' AND c.country='Australia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Sydney Opera House Tour' AND cc.name='Sydney');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Bondi Beach', 'Australia''s most famous beach — surf lessons, coastal walks and the iconic Bondi to Coogee clifftop path.', 'Experience', 0.00, 'Half day', 'https://images.unsplash.com/photo-1484821582734-6692f9447029?w=600&q=80'
FROM cities c WHERE c.name='Sydney' AND c.country='Australia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Bondi Beach' AND cc.name='Sydney');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sydney Harbour Bridge Climb', 'A thrilling guided climb to the summit of the iconic Harbour Bridge for panoramic views over Sydney.', 'Adventure', 174.00, '3-4 hours', 'https://images.unsplash.com/photo-1523059623039-a9ed027d2f70?w=600&q=80'
FROM cities c WHERE c.name='Sydney' AND c.country='Australia'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Sydney Harbour Bridge Climb' AND cc.name='Sydney');

-- ============================================================
-- ACTIVITIES — Cairo
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Pyramids of Giza', 'The last surviving Wonder of the Ancient World — three magnificent pharaonic pyramids and the Great Sphinx.', 'History', 200.00, 'Half day', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80'
FROM cities c WHERE c.name='Cairo' AND c.country='Egypt'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Pyramids of Giza' AND cc.name='Cairo');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Egyptian Museum', 'The world''s greatest collection of ancient Egyptian antiquities, including Tutankhamun''s golden treasures.', 'Museum', 200.00, '3 hours', 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80'
FROM cities c WHERE c.name='Cairo' AND c.country='Egypt'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Egyptian Museum' AND cc.name='Cairo');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Khan el-Khalili Bazaar', 'Cairo''s famous medieval market district — a labyrinth of spices, jewellery, perfumes and souvenirs.', 'Shopping', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1572163427904-c4e16a9e9ab0?w=600&q=80'
FROM cities c WHERE c.name='Cairo' AND c.country='Egypt'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Khan el-Khalili Bazaar' AND cc.name='Cairo');

-- ============================================================
-- ACTIVITIES — Kathmandu
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Boudhanath Stupa', 'One of the largest Buddhist stupas in the world — a UNESCO World Heritage Site and important Tibetan pilgrimage site.', 'Culture', 400.00, '2 hours', 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80'
FROM cities c WHERE c.name='Kathmandu' AND c.country='Nepal'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Boudhanath Stupa' AND cc.name='Kathmandu');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Pashupatinath Temple', 'Sacred Hindu temple on the Bagmati River — witness ancient cremation ceremonies and wandering sadhus.', 'Culture', 1000.00, '2-3 hours', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80'
FROM cities c WHERE c.name='Kathmandu' AND c.country='Nepal'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Pashupatinath Temple' AND cc.name='Kathmandu');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Swayambhunath (Monkey Temple)', 'An ancient religious complex atop a hill with panoramic views of the Kathmandu Valley and friendly monkeys.', 'Culture', 200.00, '2 hours', 'https://images.unsplash.com/photo-1553521041-da4a2ba0d1e3?w=600&q=80'
FROM cities c WHERE c.name='Kathmandu' AND c.country='Nepal'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Swayambhunath (Monkey Temple)' AND cc.name='Kathmandu');

-- ============================================================
-- ACTIVITIES — Kyoto
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Fushimi Inari Shrine', 'Thousands of vermilion torii gates winding up a forested mountain — one of Japan''s most iconic sights.', 'Culture', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80'
FROM cities c WHERE c.name='Kyoto' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Fushimi Inari Shrine' AND cc.name='Kyoto');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Arashiyama Bamboo Grove', 'A magical path through towering bamboo stalks at the foot of the Kyoto mountains — ethereal and unforgettable.', 'Nature', 0.00, '1-2 hours', 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=600&q=80'
FROM cities c WHERE c.name='Kyoto' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Arashiyama Bamboo Grove' AND cc.name='Kyoto');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Kinkaku-ji (Golden Pavilion)', 'A Zen Buddhist temple covered in gold leaf, perfectly reflected in the surrounding pond — a masterpiece.', 'Culture', 500.00, '1-2 hours', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80'
FROM cities c WHERE c.name='Kyoto' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Kinkaku-ji (Golden Pavilion)' AND cc.name='Kyoto');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Geisha District Gion', 'Kyoto''s most famous geisha district — traditional wooden machiya townhouses and teahouses along stone-paved lanes.', 'Culture', 0.00, '2 hours', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'
FROM cities c WHERE c.name='Kyoto' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Geisha District Gion' AND cc.name='Kyoto');

-- ============================================================
-- ACTIVITIES — Osaka
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Osaka Castle', 'Iconic 16th-century castle surrounded by a scenic park — spectacular during cherry blossom season.', 'History', 600.00, '2-3 hours', 'https://images.unsplash.com/photo-1589930173544-e0e3c9f57dce?w=600&q=80'
FROM cities c WHERE c.name='Osaka' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Osaka Castle' AND cc.name='Osaka');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Dotonbori Street Food', 'Osaka''s famous entertainment district — running man neon sign, takoyaki, ramen and street food galore.', 'Food', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1589416704588-eb06c1d2bba1?w=600&q=80'
FROM cities c WHERE c.name='Osaka' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Dotonbori Street Food' AND cc.name='Osaka');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Universal Studios Japan', 'World-class theme park with Harry Potter World, Jurassic Park, and thrilling rides for all ages.', 'Entertainment', 8400.00, 'Full day', 'https://images.unsplash.com/photo-1519420573924-65fcd45245f8?w=600&q=80'
FROM cities c WHERE c.name='Osaka' AND c.country='Japan'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Universal Studios Japan' AND cc.name='Osaka');

-- ============================================================
-- ACTIVITIES — Amsterdam
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Rijksmuseum', 'The Netherlands'' national museum housing Rembrandt, Vermeer and an unparalleled collection of Golden Age masterpieces.', 'Museum', 22.50, 'Half day', 'https://images.unsplash.com/photo-1576531679699-f9d1fdb6ef3c?w=600&q=80'
FROM cities c WHERE c.name='Amsterdam' AND c.country='Netherlands'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Rijksmuseum' AND cc.name='Amsterdam');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Anne Frank House', 'The preserved secret annex where Anne Frank and her family hid for over two years during WWII — deeply moving.', 'History', 16.00, '1-2 hours', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80'
FROM cities c WHERE c.name='Amsterdam' AND c.country='Netherlands'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Anne Frank House' AND cc.name='Amsterdam');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Canal Ring Boat Tour', 'A relaxing boat tour through Amsterdam''s iconic UNESCO-listed 17th-century canal ring.', 'Experience', 18.00, '1 hour', 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&q=80'
FROM cities c WHERE c.name='Amsterdam' AND c.country='Netherlands'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Canal Ring Boat Tour' AND cc.name='Amsterdam');

-- ============================================================
-- ACTIVITIES — Rio de Janeiro
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Christ the Redeemer', 'The iconic 38-metre statue atop Corcovado mountain offering panoramic views over Rio and Guanabara Bay.', 'Sightseeing', 65.00, '2-3 hours', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80'
FROM cities c WHERE c.name='Rio de Janeiro' AND c.country='Brazil'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Christ the Redeemer' AND cc.name='Rio de Janeiro');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Copacabana Beach', 'Rio''s most famous 4km beach — volleyball, caipirinha vendors, and the energy of Brazil''s carnival spirit.', 'Experience', 0.00, 'Half day', 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600&q=80'
FROM cities c WHERE c.name='Rio de Janeiro' AND c.country='Brazil'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Copacabana Beach' AND cc.name='Rio de Janeiro');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sugarloaf Mountain Cable Car', 'Two cable car rides to the summit of Sugarloaf Mountain for breathtaking views over Rio de Janeiro.', 'Adventure', 92.00, '2-3 hours', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80'
FROM cities c WHERE c.name='Rio de Janeiro' AND c.country='Brazil'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Sugarloaf Mountain Cable Car' AND cc.name='Rio de Janeiro');

-- ============================================================
-- ACTIVITIES — Cape Town
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Table Mountain', 'Take a cable car to the flat-topped summit for unparalleled 360° views over Cape Town and the Atlantic.', 'Nature', 390.00, '2-3 hours', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80'
FROM cities c WHERE c.name='Cape Town' AND c.country='South Africa'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Table Mountain' AND cc.name='Cape Town');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Robben Island', 'UNESCO World Heritage site — tour the prison where Nelson Mandela was held for 18 years.', 'History', 600.00, 'Half day', 'https://images.unsplash.com/photo-1590372257210-1cd82f0e03c8?w=600&q=80'
FROM cities c WHERE c.name='Cape Town' AND c.country='South Africa'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Robben Island' AND cc.name='Cape Town');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Cape of Good Hope', 'The most south-westerly point of Africa — dramatic cliffs, wild ocean and colonies of African penguins nearby.', 'Nature', 353.00, 'Full day', 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&q=80'
FROM cities c WHERE c.name='Cape Town' AND c.country='South Africa'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Cape of Good Hope' AND cc.name='Cape Town');

-- ============================================================
-- ACTIVITIES — Marrakech
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Djemaa el-Fna', 'The legendary main square of Marrakech — snake charmers, acrobats, storytellers and a nightly food festival.', 'Culture', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&q=80'
FROM cities c WHERE c.name='Marrakech' AND c.country='Morocco'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Djemaa el-Fna' AND cc.name='Marrakech');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Bahia Palace', 'A stunning 19th-century palace with elaborately decorated rooms, tranquil courtyards and lush gardens.', 'History', 70.00, '1-2 hours', 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80'
FROM cities c WHERE c.name='Marrakech' AND c.country='Morocco'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Bahia Palace' AND cc.name='Marrakech');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Marrakech Souks', 'Navigate the ancient medina souks — spices, carpets, leather goods and the legendary tanneries.', 'Shopping', 0.00, '2-4 hours', 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80'
FROM cities c WHERE c.name='Marrakech' AND c.country='Morocco'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Marrakech Souks' AND cc.name='Marrakech');

-- ============================================================
-- ACTIVITIES — Athens
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Acropolis & Parthenon', 'The ancient citadel perched above Athens housing the iconic Parthenon temple — the pinnacle of ancient Greek architecture.', 'History', 20.00, '2-3 hours', 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80'
FROM cities c WHERE c.name='Athens' AND c.country='Greece'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Acropolis & Parthenon' AND cc.name='Athens');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'National Archaeological Museum', 'The largest archaeological museum in Greece housing the world''s finest collection of ancient Greek antiquities.', 'Museum', 12.00, '3 hours', 'https://images.unsplash.com/photo-1516550893885-985c836c18c4?w=600&q=80'
FROM cities c WHERE c.name='Athens' AND c.country='Greece'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='National Archaeological Museum' AND cc.name='Athens');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Plaka District', 'The old historic neighbourhood at the foot of the Acropolis — neoclassical architecture, tavernas and open-air cafés.', 'Culture', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80'
FROM cities c WHERE c.name='Athens' AND c.country='Greece'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Plaka District' AND cc.name='Athens');

-- ============================================================
-- ACTIVITIES — Abu Dhabi
-- ============================================================

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Sheikh Zayed Grand Mosque', 'One of the world''s most spectacular mosques — white marble, golden minarets and a massive Persian carpet.', 'Culture', 0.00, '2-3 hours', 'https://images.unsplash.com/photo-1526659666036-a9a86cd96c84?w=600&q=80'
FROM cities c WHERE c.name='Abu Dhabi' AND c.country='United Arab Emirates'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Sheikh Zayed Grand Mosque' AND cc.name='Abu Dhabi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Louvre Abu Dhabi', 'A stunning art and civilisations museum under a spectacular geometric dome designed by Jean Nouvel.', 'Museum', 63.00, '3 hours', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80'
FROM cities c WHERE c.name='Abu Dhabi' AND c.country='United Arab Emirates'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Louvre Abu Dhabi' AND cc.name='Abu Dhabi');

INSERT INTO activities (city_id, name, description, type, cost, duration, image)
SELECT c.id, 'Yas Island & Ferrari World', 'The world''s first Ferrari-branded theme park on Yas Island — Formula Rossa the world''s fastest roller coaster.', 'Entertainment', 295.00, 'Full day', 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&q=80'
FROM cities c WHERE c.name='Abu Dhabi' AND c.country='United Arab Emirates'
AND NOT EXISTS (SELECT 1 FROM activities a JOIN cities cc ON a.city_id=cc.id WHERE a.name='Yas Island & Ferrari World' AND cc.name='Abu Dhabi');
