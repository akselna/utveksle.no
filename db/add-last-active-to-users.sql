-- Add last_active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index for fast sorting
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
