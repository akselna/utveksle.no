-- Add sender_seen column to track if sender has noticed the acceptance
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS sender_seen BOOLEAN DEFAULT FALSE;
