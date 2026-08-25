-- Align cooking_sessions with the publishing architecture

ALTER TABLE cooking_sessions ADD COLUMN IF NOT EXISTS status recipe_status_enum NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE cooking_sessions ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Update feed_items to enforce status and schedule for sessions
DROP VIEW IF EXISTS feed_items;

CREATE VIEW feed_items AS
SELECT 
  'recipe' as entity_type,
  r.id as entity_id,
  r.owner_id as user_id,
  r.created_at,
  r.visibility
FROM recipes r
WHERE r.status = 'PUBLISHED' AND (r.scheduled_for IS NULL OR r.scheduled_for <= NOW())

UNION ALL

SELECT 
  'post' as entity_type,
  p.id as entity_id,
  p.author_id as user_id,
  p.created_at,
  p.visibility
FROM social_posts p
WHERE p.status = 'PUBLISHED' AND (p.scheduled_for IS NULL OR p.scheduled_for <= NOW())

UNION ALL

SELECT 
  'session' as entity_type,
  s.id as entity_id,
  s.user_id as user_id,
  s.created_at,
  s.visibility
FROM cooking_sessions s
WHERE s.status = 'PUBLISHED' AND (s.scheduled_for IS NULL OR s.scheduled_for <= NOW());