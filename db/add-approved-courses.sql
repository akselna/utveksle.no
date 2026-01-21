-- Create approved_courses table to store course mappings between NTNU and exchange universities
CREATE TABLE IF NOT EXISTS approved_courses (
  id SERIAL PRIMARY KEY,

  -- NTNU course information
  ntnu_course_code VARCHAR(50) NOT NULL REFERENCES ntnu_courses(code) ON DELETE CASCADE,
  ntnu_course_name VARCHAR(255) NOT NULL,

  -- Exchange course information
  exchange_university VARCHAR(255) NOT NULL,
  exchange_country VARCHAR(100) NOT NULL,
  exchange_course_code VARCHAR(100) NOT NULL,
  exchange_course_name VARCHAR(255) DEFAULT '',

  -- Course details
  ects DECIMAL(4, 2) NOT NULL,
  semester VARCHAR(20), -- 'Høst', 'Vår', etc.

  -- Verification and metadata
  verified BOOLEAN DEFAULT FALSE,
  wiki_url TEXT,
  approval_date DATE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate entries
  UNIQUE(ntnu_course_code, exchange_university, exchange_course_code)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_approved_courses_ntnu_code ON approved_courses(ntnu_course_code);
CREATE INDEX IF NOT EXISTS idx_approved_courses_university ON approved_courses(exchange_university);
CREATE INDEX IF NOT EXISTS idx_approved_courses_country ON approved_courses(exchange_country);
CREATE INDEX IF NOT EXISTS idx_approved_courses_verified ON approved_courses(verified);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_approved_courses_updated_at ON approved_courses;
CREATE TRIGGER update_approved_courses_updated_at
  BEFORE UPDATE ON approved_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
