-- Add user_id column to approved_courses table
ALTER TABLE approved_courses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_approved_courses_user ON approved_courses(user_id);
