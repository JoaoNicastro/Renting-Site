CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL CHECK (char_length(first_name) >= 3),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password CHAR(60) NOT NULL,
    city VARCHAR(100),
    university_name VARCHAR(100), -- Existing, Optional
    location_preference VARCHAR(100), -- 'Radius', 'Neighborhoods', or 'No preference', Existing
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    min_area INT,
    max_area INT,
    furnished BOOLEAN,
    bedrooms VARCHAR(3), -- '1', '2', '3+' to represent the number of bedrooms, Existing
    -- New fields added below
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

-- docker exec -it code_site-db-1 psql -U postgres -d users_db
-- \dt
-- SELECT * FROM compatibility_scores;


CREATE TABLE IF NOT EXISTS compatibility_scores (
    id SERIAL PRIMARY KEY,
    user_id_a VARCHAR(50) REFERENCES users(username),
    user_id_b VARCHAR(50) REFERENCES users(username),
    score DECIMAL(10, 2) NOT NULL CHECK (score >= 0),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_pair UNIQUE (user_id_a, user_id_b)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  from_username VARCHAR(255) NOT NULL,
  to_username VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  partner_id VARCHAR(255) NOT NULL,
  last_read_message_id INT,
  FOREIGN KEY (user_id) REFERENCES users (username) ON DELETE CASCADE,
  FOREIGN KEY (partner_id) REFERENCES users (username) ON DELETE CASCADE,
  FOREIGN KEY (last_read_message_id) REFERENCES messages (id) ON DELETE SET NULL,
  UNIQUE (user_id, partner_id)  -- This is the new line to add
);

CREATE TABLE password_resets (
  email VARCHAR(255) PRIMARY KEY,
  code INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matched_apartments (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    bedrooms INTEGER NOT NULL,
    furnished BOOLEAN NOT NULL,
    image_link VARCHAR(255) NOT NULL,
    contact_link VARCHAR(255) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);