-- Fix reports table: Add missing columns
-- This migration adds columns that are in the code but missing from the database

-- Add missing columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS verdict VARCHAR(64);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_data JSONB DEFAULT '{}';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(2048);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(1024);

-- Make upload_id nullable if it isn't already
ALTER TABLE reports ALTER COLUMN upload_id DROP NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);