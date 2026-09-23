-- Catarman Civic Portal — database schema
-- Import this into your local MySQL before starting the backend.
-- mysql -u root -p catarman_civic < schema.sql
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

-- Reports are write-once inserts keyed by the client-generated UUID, so an
-- offline-queued report that gets re-sent is ignored instead of duplicated.
-- Re-running this file resets the report tables (dev/demo data only).
DROP TABLE IF EXISTS report_photos;
DROP TABLE IF EXISTS reports;

CREATE TABLE reports (
    id CHAR(36) PRIMARY KEY,
    category ENUM('flood_landslide', 'garbage', 'crime', 'infrastructure') NOT NULL,
    description TEXT NOT NULL,
    barangay VARCHAR(100),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    location_accuracy FLOAT,
    reporter_contact VARCHAR(100),
    status ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
    created_at DATETIME(3) NOT NULL,   -- when the citizen submitted (client clock)
    received_at DATETIME(3) NOT NULL,  -- when the server stored it
    INDEX idx_reports_received (received_at)
);

-- Photos travel as base64 data URLs so an offline-queued report is plain
-- JSON. One row per photo keeps each insert under MariaDB's default 16MB
-- packet limit.
CREATE TABLE report_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INT NOT NULL,
    data_url MEDIUMTEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
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

-- Official LGU events. `agency` is stamped server-side from the signed-in
-- agency account, so an office can only post and edit its own events.
-- Re-running this file resets the events table (dev/demo data only).
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    agency VARCHAR(20) NOT NULL,
    category ENUM('safety', 'health', 'community', 'environment', 'notice') NOT NULL DEFAULT 'community',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_starts (starts_at)
);