-- server/db/schema-safe.sql
-- Safe schema initialization for GlobeTrotter PostgreSQL database
-- Contains NO DROP, TRUNCATE, or DELETE commands.
-- All table creations use CREATE TABLE IF NOT EXISTS to prevent accidental data loss.

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    cover_image TEXT,
    budget_limit DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    description TEXT,
    image TEXT,
    cost_index INTEGER, -- e.g., 1 to 4 scale
    popularity INTEGER, -- e.g., 1 to 100 scale
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- 4. Create trip_stops table
CREATE TABLE IF NOT EXISTS trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    stop_order INTEGER NOT NULL
);

-- 5. Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100), -- e.g., 'Sightseeing', 'Culture'
    cost DECIMAL(10, 2),
    duration VARCHAR(50), -- e.g., '2h', 'Half day'
    image TEXT,
    rating NUMERIC(3, 1)
);

-- 6. Create trip_activities table
CREATE TABLE IF NOT EXISTS trip_activities (
    id SERIAL PRIMARY KEY,
    trip_stop_id INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    date DATE,
    start_time TIME,
    end_time TIME,
    custom_cost DECIMAL(10, 2),
    notes TEXT,
    activity_order INTEGER
);

-- 7. Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- e.g., 'transport', 'accommodation', 'activities', 'meals', 'other'
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE
);

-- 8. Create saved_destinations table
CREATE TABLE IF NOT EXISTS saved_destinations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, city_id)
);

-- 9. Create shared_trips table
CREATE TABLE IF NOT EXISTS shared_trips (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_preference VARCHAR(50),
    trip_pace VARCHAR(50),
    travel_type VARCHAR(50),
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_city_id ON trip_stops(city_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_id ON trip_activities(trip_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_activity_id ON trip_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_user_id ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_trips_trip_id ON shared_trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_shared_trips_token ON shared_trips(share_token);
