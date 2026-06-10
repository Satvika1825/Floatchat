CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    platform_number TEXT NOT NULL,
    cycle_number INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    profile_date TIMESTAMP NOT NULL,
    data_mode TEXT,
    ocean_region TEXT,
    data_quality_flag INTEGER DEFAULT 1,
    summary_text TEXT NOT NULL,
    embedding VECTOR(768),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(platform_number, cycle_number),
    CHECK(latitude >= -90 AND latitude <= 90),
    CHECK(longitude >= -180 AND longitude <= 180)
);


CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(profile_id) ON DELETE CASCADE,
    depth FLOAT NOT NULL,
    pressure FLOAT,
    temperature FLOAT,
    salinity FLOAT,
    oxygen FLOAT,       
    chlorophyll FLOAT,  
    ph FLOAT,           
    quality_flag INTEGER DEFAULT 1
);


CREATE TABLE platforms (
    platform_number TEXT PRIMARY KEY,
    wmo_inst_type TEXT,
    project_name TEXT,
    deployment_date DATE,
    last_location_date TIMESTAMP,
    platform_status TEXT DEFAULT 'ACTIVE',
    data_center TEXT
);

-- Vector similarity index for AI search
CREATE INDEX idx_profiles_embedding ON profiles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Basic indexes for common queries
CREATE INDEX idx_profiles_platform ON profiles(platform_number);
CREATE INDEX idx_measurements_profile ON measurements(profile_id);

-- Sample data insertion (for testing)
-- Uncomment and modify as needed

/*
INSERT INTO profiles (
    platform_number, cycle_number, latitude, longitude, profile_date, 
    data_mode, ocean_region, summary_text
) VALUES 
    ('1901393', 1, 10.5, 60.2, '2023-01-15 12:00:00', 'R', 'Indian Ocean', 
     'ARGO Float 1901393, Cycle 1, Location: 10.50�N, 60.20�E, Date: 2023-01-15, Depth range: 0.0m to 2000.0m, Temperature: 15.20�C to 28.50�C (mean: 22.10�C), Salinity: 34.50 to 36.80 PSU (mean: 35.60 PSU)'),
    ('1901393', 2, 10.8, 60.5, '2023-01-25 12:00:00', 'R', 'Indian Ocean',
     'ARGO Float 1901393, Cycle 2, Location: 10.80�N, 60.50�E, Date: 2023-01-25, Depth range: 0.0m to 2000.0m, Temperature: 14.80�C to 28.20�C (mean: 21.90�C), Salinity: 34.60 to 36.90 PSU (mean: 35.70 PSU)');

INSERT INTO measurements (profile_id, depth, pressure, temperature, salinity) VALUES 
    (1, 0, 0, 28.5, 34.5),
    (1, 10, 10, 28.2, 34.6),
    (1, 50, 50, 26.8, 35.1),
    (1, 100, 100, 22.5, 35.8),
    (1, 200, 200, 18.2, 36.2),
    (1, 500, 500, 12.8, 35.9),
    (1, 1000, 1000, 8.5, 35.2),
    (1, 2000, 2000, 4.2, 34.8),
    (2, 0, 0, 28.2, 34.6),
    (2, 10, 10, 27.9, 34.7),
    (2, 50, 50, 26.5, 35.2),
    (2, 100, 100, 22.1, 35.9),
    (2, 200, 200, 17.9, 36.3),
    (2, 500, 500, 12.5, 36.0),
    (2, 1000, 1000, 8.2, 35.3),
    (2, 2000, 2000, 4.0, 34.9);
*/

-- Verify tables created
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';