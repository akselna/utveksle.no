-- Database schema for utveksling_app

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  country VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for geographical searches
CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_continent ON universities(continent);
CREATE INDEX IF NOT EXISTS idx_universities_coordinates ON universities(latitude, longitude);

-- Reviews table (for user-generated reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id VARCHAR(255), -- Will be linked to auth system later
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  social_rating INTEGER CHECK (social_rating >= 1 AND social_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comment TEXT,
  semester VARCHAR(20), -- e.g., "Fall 2024", "Spring 2023"
  year INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_university ON reviews(university_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  course_code VARCHAR(50) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  ects_points DECIMAL(4, 2),
  institute VARCHAR(255),
  semester VARCHAR(20), -- "Fall", "Spring", "Both"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(university_id, course_code)
);

CREATE INDEX IF NOT EXISTS idx_courses_university ON courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

-- Exchange agreements table
CREATE TABLE IF NOT EXISTS exchange_agreements (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  study_program VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  study_year VARCHAR(10),
  num_semesters INTEGER,
  year VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agreements_university ON exchange_agreements(university_id);
CREATE INDEX IF NOT EXISTS idx_agreements_study ON exchange_agreements(study_program);

-- Course mappings (which courses replace NTNU courses)
CREATE TABLE IF NOT EXISTS course_mappings (
  id SERIAL PRIMARY KEY,
  exchange_agreement_id INTEGER NOT NULL REFERENCES exchange_agreements(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  replaced_course_code VARCHAR(50),
  replaced_course_name VARCHAR(255),
  course_type VARCHAR(100),
  semester VARCHAR(20), -- "Fall", "Spring"
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mappings_agreement ON course_mappings(exchange_agreement_id);
CREATE INDEX IF NOT EXISTS idx_mappings_course ON course_mappings(course_id);

-- University statistics (aggregated from reviews)
CREATE TABLE IF NOT EXISTS university_stats (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL UNIQUE REFERENCES universities(id) ON DELETE CASCADE,
  avg_difficulty_rating DECIMAL(3, 2),
  avg_price_rating DECIMAL(3, 2),
  avg_social_rating DECIMAL(3, 2),
  avg_overall_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stats_university ON university_stats(university_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_universities_updated_at ON universities;
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
