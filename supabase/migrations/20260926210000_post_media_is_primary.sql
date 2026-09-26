-- Add is_primary column to post_media to support selecting a cover photo independently of display_order
ALTER TABLE post_media ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;
