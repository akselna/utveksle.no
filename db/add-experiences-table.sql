-- Experiences table - stores user experiences from exchange
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,

  -- University info
  university_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,

  -- Study info
  study_program VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  study_year INTEGER NOT NULL, -- 3, 4, or 5
  semester VARCHAR(50) NOT NULL, -- "Høst", "Vår", "Høst + Vår"
  year INTEGER NOT NULL, -- Year of exchange (e.g., 2024)

  -- Student info
  student_name VARCHAR(255) NOT NULL,

  -- Review content
  review TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Pros and cons (stored as JSON arrays)
  pros JSONB, -- Array of strings
  cons JSONB, -- Array of strings

  -- Price information
  beer_price VARCHAR(50),
  meal_price VARCHAR(50),
  rent_price VARCHAR(50),

  -- Images (to be added later if needed)
  images JSONB, -- Array of image URLs

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_university ON experiences(university_id);
CREATE INDEX IF NOT EXISTS idx_experiences_university_name ON experiences(university_name);
CREATE INDEX IF NOT EXISTS idx_experiences_country ON experiences(country);
CREATE INDEX IF NOT EXISTS idx_experiences_year ON experiences(year);
CREATE INDEX IF NOT EXISTS idx_experiences_study_program ON experiences(study_program);

-- Trigger for experiences table
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
