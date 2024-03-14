CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL CHECK (char_length(first_name) >= 3),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password CHAR(60) NOT NULL,
    city TEXT[],
    university_name VARCHAR(100), -- Existing, Optional
    location_preference VARCHAR(100), -- 'Radius', 'Neighborhoods', or 'No preference', Existing
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    min_area INT,
    max_area INT,
    furnished BOOLEAN,
    bedrooms VARCHAR(3), -- '1', '2', '3+' to represent the number of bedrooms, Existing
    gender VARCHAR(10),
    budget NUMERIC,
    location TEXT,
    university TEXT,
    pets BOOLEAN,
    language TEXT,
    sleep_time TIME,
    wake_up_time TIME,
    smoking BOOLEAN,
    drinking BOOLEAN,
    relationship_status VARCHAR(10),
    hobbies TEXT, -- Assuming your DB supports array types, else could use TEXT and handle at application level
    language_pref TEXT,
    gender_pref VARCHAR(10),
    sleep_time_pref TIME,
    wake_up_time_pref TIME,
    smoking_pref BOOLEAN,
    drinking_pref BOOLEAN,
    relationship_pref VARCHAR(10)
);


CREATE TABLE compatibility_scores (
    id SERIAL PRIMARY KEY,
    user_id_a VARCHAR(50) REFERENCES users(username),
    user_id_b VARCHAR(50) REFERENCES users(username),
    score DECIMAL(10, 2) NOT NULL CHECK (score >= 0),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);