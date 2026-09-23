-- Catarman Civic Portal — database schema
-- Import this into your local MySQL before starting the backend.
-- mysql -u root -p your_db_name < schema.sql
-- Then load seed data: mysql -u root -p your_db_name < seed.sql

-- Reference list of Catarman's 55 barangays with centroid coordinates.
-- Not FK-enforced against reports/evacuation_centers (both keep barangay as
-- free-text VARCHAR so no existing insert breaks) — this is a lookup table
-- for populating dropdowns (reporter form, admin filters, events) with a
-- canonical, correctly-spelled barangay list, and for a map fallback pin
-- when a citizen's device denies geolocation.
CREATE TABLE IF NOT EXISTS barangays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('flood_landslide', 'garbage', 'crime', 'infrastructure') NOT NULL,
    barangay VARCHAR(100),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    photo_url VARCHAR(255),
    status ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evacuation_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    agency VARCHAR(100) NOT NULL,
    event_datetime DATETIME NOT NULL,
    location VARCHAR(150),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);