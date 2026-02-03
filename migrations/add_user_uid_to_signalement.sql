-- Migration: Add user_uid column to signalement table
-- This column stores the Firebase UID of the user who created the signalement
-- It is nullable because signalements created from web don't have a Firebase UID

ALTER TABLE signalement 
ADD COLUMN IF NOT EXISTS user_uid VARCHAR(128);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_signalement_user_uid ON signalement(user_uid);

-- Optional: Update existing records from Firebase sync
-- This will be done automatically during the next synchronization
