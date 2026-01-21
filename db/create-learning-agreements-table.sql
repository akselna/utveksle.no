-- Create learning_agreements table
CREATE TABLE IF NOT EXISTS learning_agreements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  behandlet BOOLEAN DEFAULT FALSE,
  behandlet_av INTEGER REFERENCES users(id) ON DELETE SET NULL,
  behandlet_dato TIMESTAMP,
  CONSTRAINT unique_user_upload UNIQUE (user_id, uploaded_at)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_learning_agreements_user_id ON learning_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_agreements_behandlet ON learning_agreements(behandlet);
CREATE INDEX IF NOT EXISTS idx_learning_agreements_uploaded_at ON learning_agreements(uploaded_at DESC);

-- Add comment to table
COMMENT ON TABLE learning_agreements IS 'Stores uploaded Learning Agreement PDFs from users for admin review';
