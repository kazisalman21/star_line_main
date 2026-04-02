-- ============================================================
-- Add saved_passengers JSONB column to profiles table
-- Used for storing user's frequently-booked co-travellers
-- ============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS saved_passengers JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.saved_passengers IS 'JSON array of saved passenger details [{id, name, phone, relation}]';
