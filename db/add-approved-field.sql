-- Add approved field to distinguish between admin-verified courses and admin-approved user submissions
-- verified = true: Course was added by an admin (shows "Verifisert" badge)
-- approved = true: Course has been approved by admin and is visible to all users

ALTER TABLE approved_courses
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- Set approved = true for all existing courses with verified = true (backwards compatibility)
UPDATE approved_courses
SET approved = TRUE
WHERE verified = TRUE;

-- Set approved = true for all existing courses (assuming current courses are approved)
UPDATE approved_courses
SET approved = TRUE
WHERE approved = FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_approved_courses_approved ON approved_courses(approved);
