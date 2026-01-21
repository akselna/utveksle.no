-- Migration: Add image_url field to universities table
-- This allows each university to have a display image

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN universities.image_url IS 'URL to university display image, shown in experiences and reviews';

-- Create index for faster queries when filtering by universities with images
CREATE INDEX IF NOT EXISTS idx_universities_image_url ON universities(image_url) WHERE image_url IS NOT NULL;
