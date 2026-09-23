-- Catarman Civic Portal — seed data
-- Run after schema.sql: mysql -u root -p your_db_name < seed.sql
--
-- Sources: Catarman's 55 barangays and poblacion/urban classification are
-- from Wikipedia ("Catarman, Northern Samar") and PhilAtlas, cross-checked
-- Sept 2026. All evacuation centers now have real pin-dropped coordinates
-- except Catarman Cathedral and PAGCOR (Brgy. Polangi), which use real
-- but building-imprecise coordinates from earlier research. All barangay
-- centroids (used for reference/dropdowns and the Uwan-scenario report
-- pins) are still deterministically jittered around the town center —
-- swap in real GPS pins post-hackathon if time allows.
--
-- ⚠️ Named evacuation centers total 8 here, per tonight's-prep research.
-- Still need to confirm with MDRRMO how PAGCOR counts against the
-- documented "ten designated centers" shortfall — don't state a hard
-- number to the DRRMO judge until that's confirmed.

TRUNCATE TABLE barangays;
TRUNCATE TABLE evacuation_centers;
TRUNCATE TABLE reports;

-- ---------------------------------------------------------------------------
-- Barangays (55) — reference list for dropdowns / map fallback pins.
-- ---------------------------------------------------------------------------
INSERT INTO barangays (name, lat, lng) VALUES
('Acacia', 12.510155, 124.640138),
('Aguinaldo', 12.510737, 124.629206),
('Airport Village', 12.526883, 124.63061),
('Bangkerohan', 12.488565, 124.665814),
('Baybay', 12.483992, 124.662382),
('Bocsol', 12.485362, 124.649529),
('Cabayhan', 12.534424, 124.676729),
('Cag-abaca', 12.461152, 124.666359),
('Cal-igang', 12.519797, 124.650056),
('Calachuchi', 12.500692, 124.631931),
('Casoy', 12.505873, 124.636417),
('Cawayan', 12.456169, 124.622744),
('Cervantes', 12.475523, 124.608573),
('Cularima', 12.466048, 124.633708),
('Daganas', 12.520645, 124.661249),
('Dalakit', 12.5051, 124.62509),
('Doña Pulqueria', 12.480964, 124.590679),
('Galutan', 12.481083, 124.664426),
('Gebalagnan', 12.544105, 124.65423),
('Gibulwangan', 12.458189, 124.630223),
('Guba', 12.54301, 124.653015),
('Hinatad', 12.495223, 124.638338),
('Imelda', 12.539626, 124.641023),
('Ipil-ipil', 12.492938, 124.645924),
('Jose Abad Santos', 12.500032, 124.647737),
('Jose P. Rizal', 12.487392, 124.627295),
('Lapu-lapu', 12.505889, 124.640721),
('Liberty', 12.517973, 124.612483),
('Libjo', 12.504103, 124.643231),
('Mabini', 12.468989, 124.656506),
('Mabolo', 12.49707, 124.627779),
('Macagtas', 12.456792, 124.625373),
('Malvar', 12.484955, 124.664886),
('McKinley', 12.510917, 124.679129),
('Molave', 12.500264, 124.641122),
('Narra', 12.49759, 124.627539),
('New Rizal', 12.469573, 124.619019),
('Old Rizal', 12.502914, 124.613822),
('Paticua', 12.487617, 124.601188),
('Polangi', 12.3971, 124.6298),
('Quezon', 12.485764, 124.648535),
('Salvacion', 12.512534, 124.626138),
('Sampaguita', 12.494896, 124.637336),
('San Julian', 12.502647, 124.609129),
('San Pascual', 12.532257, 124.628191),
('Santol', 12.493211, 124.633832),
('Somoge', 12.514528, 124.615606),
('Talisay', 12.509835, 124.626421),
('Tinowaran', 12.483904, 124.628772),
('Trangue', 12.46442, 124.608202),
('UEP Zone I', 12.487094, 124.672487),
('UEP Zone II', 12.542497, 124.668077),
('UEP Zone III', 12.47636, 124.659619),
('Washington', 12.493869, 124.643062),
('Yakal', 12.490191, 124.645432);

-- ---------------------------------------------------------------------------
-- Evacuation centers (8) — capacity/occupancy staged for the live demo:
-- Catarman Cathedral (dead-center Poblacion) and St. Michael Academy are
-- FULL/over capacity, Capitol Gym and Catarman National High School are
-- AMBER (near capacity), the rest are GREEN/open. This guarantees the
-- nearest-open-center locator has to visibly skip a full center when the
-- demo location pin is dropped in the Poblacion.
-- Color thresholds assumed: <70% green, 70-99% amber, >=100% red.
-- ---------------------------------------------------------------------------
INSERT INTO evacuation_centers (name, barangay, lat, lng, capacity, current_occupancy) VALUES
('Municipal Evacuation Center', 'Yakal', 12.498970963543236, 124.63810923059673, 800, 420),
('Catarman Cathedral', 'Jose P. Rizal', 12.498694, 124.6365, 1200, 1200),
('St. Michael Academy', 'Casoy', 12.498731618595883, 124.6360851456436, 600, 610),
('Liga ng mga Barangay Building', 'Yakal', 12.499884470818577, 124.63719195787243, 300, 150),
('Capitol Gym', 'Dalakit', 12.503987369810867, 124.63346392543018, 2500, 1800),
('Catarman National High School', 'Dalakit', 12.503129362269114, 124.62425960592061, 1500, 1400),
('Northern Samar Colleges', 'Ipil-ipil', 12.498785663544979, 124.63851616235634, 1000, 300),
('PAGCOR Multi-Purpose Evacuation Center', 'Polangi', 12.3971, 124.6298, 6000, 3200);

-- ---------------------------------------------------------------------------
-- Uwan-scenario reports (8) — barangays preemptively evacuated for Super
-- Typhoon Uwan (Nov 2025), for the admin dashboard map/table demo.
-- ---------------------------------------------------------------------------
INSERT INTO reports (category, barangay, lat, lng, photo_url, status, created_at) VALUES
('flood_landslide', 'Airport Village', 12.527883, 124.63161, NULL, 'resolved', '2025-11-08 06:40:00'),  -- Storm surge flooding near runway perimeter, families preemptively evacuated
('flood_landslide', 'Bangkerohan', 12.487065, 124.664314, NULL, 'in_progress', '2025-11-08 07:05:00'),  -- Riverside flooding rising, road to barangay hall impassable
('flood_landslide', 'Baybay', 12.484792, 124.663182, NULL, 'new', '2025-11-08 07:20:00'),  -- Coastal flooding reported, waves reaching first row of houses
('flood_landslide', 'Cawayan', 12.455169, 124.621744, NULL, 'in_progress', '2025-11-08 08:10:00'),  -- Landslide risk on hillside road after continuous rain
('infrastructure', 'Dalakit', 12.5063, 124.62629, NULL, 'new', '2025-11-08 09:05:00'),  -- Downed electric post and fallen trees blocking JP Rizal highway
('flood_landslide', 'Old Rizal', 12.502114, 124.613022, NULL, 'resolved', '2025-11-08 05:55:00'),  -- Flash flooding subsided, residents cleared to return
('flood_landslide', 'UEP Zone I', 12.488594, 124.673987, NULL, 'new', '2025-11-08 10:30:00'),  -- Flooding around UEP dormitories, students moved to gym
('infrastructure', 'UEP Zone II', 12.541297, 124.666877, NULL, 'in_progress', '2025-11-08 11:15:00');  -- Roof damage to covered court used as staging area
