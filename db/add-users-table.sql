-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255), -- NULL for OAuth users
  name VARCHAR(255) NOT NULL,

  -- Student information
  study_program VARCHAR(255),
  specialization VARCHAR(255),
  study_year VARCHAR(10),
  university VARCHAR(255) DEFAULT 'NTNU',

  -- OAuth fields
  google_id VARCHAR(255) UNIQUE,
  provider VARCHAR(50), -- 'credentials', 'google', etc.

  -- Verification
  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update reviews table to use user_id as foreign key
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Change user_id to integer if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'user_id' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN user_id TYPE INTEGER USING user_id::integer;
  END IF;
END $$;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
