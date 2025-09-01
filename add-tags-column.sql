-- Add tags column to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
