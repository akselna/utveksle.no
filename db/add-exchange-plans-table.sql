-- Exchange plans table - stores user's planned exchanges
CREATE TABLE IF NOT EXISTS exchange_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,

  -- Basic info
  university_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  semester VARCHAR(50), -- e.g., "Fall 2024", "Spring 2025"
  duration INTEGER, -- number of semesters

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'completed'
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Plan data (JSON)
  selected_courses JSONB, -- Array of selected courses with mappings
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, university_name, semester)
);

CREATE INDEX IF NOT EXISTS idx_exchange_plans_user ON exchange_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_plans_university ON exchange_plans(university_id);
CREATE INDEX IF NOT EXISTS idx_exchange_plans_status ON exchange_plans(status);

-- Trigger for exchange_plans table
DROP TRIGGER IF EXISTS update_exchange_plans_updated_at ON exchange_plans;
CREATE TRIGGER update_exchange_plans_updated_at BEFORE UPDATE ON exchange_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Saved courses table - stores individual course selections
CREATE TABLE IF NOT EXISTS saved_courses (
  id SERIAL PRIMARY KEY,
  exchange_plan_id INTEGER NOT NULL REFERENCES exchange_plans(id) ON DELETE CASCADE,

  -- Course info from exchange university
  course_code VARCHAR(50) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  ects_points DECIMAL(4, 2),
  semester VARCHAR(20), -- "Fall", "Spring"

  -- Mapping to NTNU course
  replaces_course_code VARCHAR(50),
  replaces_course_name VARCHAR(255),

  -- Additional info
  notes TEXT,
  approved BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_courses_plan ON saved_courses(exchange_plan_id);
