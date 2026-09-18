-- Add sort_order to story_highlights for collection reordering
ALTER TABLE story_highlights ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Create index on user_id and sort_order for efficient deterministic ordering
CREATE INDEX IF NOT EXISTS idx_story_highlights_user_sort ON story_highlights(user_id, sort_order);

