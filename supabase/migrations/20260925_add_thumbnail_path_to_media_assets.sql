-- Add thumbnail_path column to media_assets if not exists
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;
