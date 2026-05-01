-- Create Database
CREATE DATABASE IF NOT EXISTS mei_drive_africa;
\c mei_drive_africa;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    id_number VARCHAR(50),
    license_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NTSA Questions Table (1000+ questions)
CREATE TABLE ntsa_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES ntsa_questions(id),
    is_correct BOOLEAN,
    answer_chosen CHAR(1),
    time_taken INTEGER,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
);

-- Quiz Sessions
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE,
    questions_ids INTEGER[],
    answers TEXT[],
    score INTEGER,
    total_questions INTEGER,
    percentage DECIMAL(5,2),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress'
);

-- Vehicles Table (for AutoValue)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    price_min INTEGER,
    price_max INTEGER,
    average_price INTEGER,
    body_type VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Vehicles
CREATE TABLE fleet_vehicles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    registration VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    purchase_date DATE,
    purchase_price INTEGER,
    current_value INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Drivers
CREATE TABLE fleet_drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(255),
    assigned_vehicle_id INTEGER REFERENCES fleet_vehicles(id),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Records
CREATE TABLE fuel_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES fleet_vehicles(id),
    driver_id INTEGER REFERENCES fleet_drivers(id),
    liters DECIMAL(10,2),
    cost_per_liter DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    odometer_reading INTEGER,
    receipt_image TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Policies
CREATE TABLE insurance_policies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    vehicle_id INTEGER REFERENCES fleet_vehicles(id),
    policy_number VARCHAR(100) UNIQUE,
    provider VARCHAR(255),
    type VARCHAR(50),
    coverage_amount INTEGER,
    premium_amount INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    documents TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Claims
CREATE TABLE insurance_claims (
    id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES insurance_policies(id),
    claim_number VARCHAR(100) UNIQUE,
    incident_date DATE,
    description TEXT,
    claimed_amount INTEGER,
    approved_amount INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    documents TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver Courses
CREATE TABLE driver_courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    duration_hours INTEGER,
    modules JSONB,
    certificate_template TEXT,
    price INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Enrollments
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES driver_courses(id),
    progress DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url TEXT
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_questions_category ON ntsa_questions(category);
CREATE INDEX idx_fleet_vehicles_user ON fleet_vehicles(user_id);
CREATE INDEX idx_fleet_drivers_user ON fleet_drivers(user_id);
CREATE INDEX idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX idx_insurance_policies_dates ON insurance_policies(start_date, end_date);

-- Insert Sample Vehicle Data for AutoValue
INSERT INTO vehicles (make, model, year, price_min, price_max, average_price) VALUES
('Toyota', 'Fortuner', 2023, 4500000, 5500000, 5000000),
('Toyota', 'Hilux', 2023, 3500000, 4500000, 4000000),
('Toyota', 'Corolla', 2023, 2000000, 2800000, 2400000),
('Toyota', 'Land Cruiser Prado', 2023, 8000000, 12000000, 10000000),
('Subaru', 'Forester', 2023, 3200000, 4200000, 3700000),
('Isuzu', 'D-Max', 2023, 3500000, 4800000, 4150000);

-- Insert 1000+ NTSA Questions (Sample - actual would have 1000+)
INSERT INTO ntsa_questions (question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, category, difficulty) VALUES
('What is the maximum speed limit in built-up areas in Kenya?', '50 km/h', '60 km/h', '80 km/h', '100 km/h', 'A', 'The speed limit in built-up areas is 50 km/h unless otherwise signposted.', 'Speed Limits', 'easy'),
('What does a STOP sign require you to do?', 'Slow down and proceed', 'Come to a complete stop', 'Yield to pedestrians only', 'Honk and proceed', 'B', 'A STOP sign requires you to come to a complete stop, check for traffic, then proceed when safe.', 'Road Signs', 'easy'),
('What is the legal blood alcohol limit for professional drivers?', '0.08%', '0.05%', '0.00%', '0.02%', 'C', 'Professional drivers must have 0.00% blood alcohol content.', 'Safety', 'medium'),
('What documents must you carry while driving?', 'Driving license only', 'License and insurance only', 'License, insurance, and logbook', 'ID card only', 'C', 'You must carry your driving license, insurance certificate, and vehicle logbook.', 'Legal Requirements', 'easy'),
('What does a yellow traffic light indicate?', 'Speed up to beat the light', 'Stop if safe to do so', 'Proceed with caution', 'Turn around', 'B', 'A yellow light means prepare to stop. Stop if you can do so safely.', 'Traffic Rules', 'easy');

-- Continue inserting to reach 1000+ questions...

-- Insert Driver Courses
INSERT INTO driver_courses (title, description, duration_hours, modules, price) VALUES
('Defensive Driving', 'Master defensive driving techniques including scanning, hazard perception, and space management', 8, '{"module1": "Introduction to Defensive Driving", "module2": "Hazard Perception", "module3": "Space Management"}', 5000),
('Eco-Driving', 'Fuel-efficient driving techniques to save fuel and reduce emissions', 4, '{"module1": "Fuel efficiency basics", "module2": "Driving techniques", "module3": "Vehicle maintenance"}', 3000);
