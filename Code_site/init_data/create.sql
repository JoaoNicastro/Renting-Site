CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL CHECK (char_length(first_name) >= 3),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password CHAR(60) NOT NULL,
    city VARCHAR(100),
    university_name VARCHAR(100), -- Optional
    location_preference VARCHAR(100), -- 'Radius', 'Neighborhoods', or 'No preference'
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    min_area INT,
    max_area INT,
    furnished BOOLEAN,
    bedrooms VARCHAR(3) -- '1', '2', '3+' to represent the number of bedrooms
);
