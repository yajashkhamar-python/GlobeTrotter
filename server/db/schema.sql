-- server/db/schema.sql

-- Drop tables if they exist to allow clean recreation (in correct order)
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS shared_trips CASCADE;
DROP TABLE IF EXISTS saved_destinations CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS trip_activities CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE trips (
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

-- Create cities table
CREATE TABLE cities (
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

-- Create trip_stops table
CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    stop_order INTEGER NOT NULL
);

-- Create activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100), -- e.g., 'Sightseeing', 'Culture'
    cost DECIMAL(10, 2),
    duration VARCHAR(50), -- e.g., '2h', 'Half day'
    image TEXT
);

-- Create trip_activities table
CREATE TABLE trip_activities (
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

-- Create expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- e.g., 'transport', 'accommodation', 'activities', 'meals', 'other'
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE
);

-- Create saved_destinations table
CREATE TABLE saved_destinations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, city_id) -- Prevent duplicate saves of the same city by the same user
);

-- Create shared_trips table
CREATE TABLE shared_trips (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_preference VARCHAR(50),
    trip_pace VARCHAR(50),
    travel_type VARCHAR(50),
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
