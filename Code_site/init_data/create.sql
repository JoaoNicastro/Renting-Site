CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL CHECK (char_length(first_name) >= 3),
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password CHAR(60) NOT NULL
);
