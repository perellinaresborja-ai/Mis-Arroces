-- 00032_soft_delete_and_session_delete.sql

-- 1. Add deleted_at to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- 2. Add deleted_at to cooking_sessions (why not?) Actually the user said: "borrar exclusivamente esa cooking_session... NO borrar receta". For sessions, hard delete is fine because it has no children that need historical preservation (except maybe comments and likes, which can CASCADE naturally).
-- User: "borrar exclusivamente esa cooking_session; limpiar relaciones/media que correspondan según esquema real". 
-- ON DELETE CASCADE on session_likes, session_comments, session_media is already handling this! So hard delete for sessions is perfect.

-- 3. Update RLS policies for recipes to enforce deleted_at IS NULL for public/owner viewing, but allow viewing if the user has a cooking session.

DROP POLICY IF EXISTS "Recipes viewable public" ON recipes;
CREATE POLICY "Recipes viewable public" ON recipes FOR SELECT USING (
  (owner_id = auth.uid() AND deleted_at IS NULL) OR 
  (
    status = 'PUBLISHED' AND 
    (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
    visibility = 'PUBLIC' AND
    deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Recipes viewable followers" ON recipes;
CREATE POLICY "Recipes viewable followers" ON recipes FOR SELECT USING (
  status = 'PUBLISHED' AND 
  (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
  visibility = 'FOLLOWERS' AND 
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = recipes.owner_id AND status = 'ACCEPTED'
  )
);

-- IMPORTANT: Allow users to view deleted recipes ONLY IF they have cooked them.
DROP POLICY IF EXISTS "Deleted recipes viewable if cooked" ON recipes;
CREATE POLICY "Deleted recipes viewable if cooked" ON recipes FOR SELECT USING (
  deleted_at IS NOT NULL AND EXISTS (
    SELECT 1 FROM cooking_sessions
    WHERE recipe_id = recipes.id AND user_id = auth.uid()
  )
);

-- Prevent updating soft-deleted recipes
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = owner_id AND deleted_at IS NULL);

-- 4. Update views to exclude soft-deleted recipes
CREATE OR REPLACE VIEW feed_items AS
SELECT 
  'recipe' as entity_type,
  r.id as entity_id,
  r.owner_id as user_id,
  r.created_at,
  r.visibility
FROM recipes r
WHERE r.status = 'PUBLISHED' AND (r.scheduled_for IS NULL OR r.scheduled_for <= NOW()) AND r.deleted_at IS NULL

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
WHERE s.visibility IN ('PUBLIC', 'FOLLOWERS');


DROP VIEW IF EXISTS popular_recipes_v1;
CREATE OR REPLACE VIEW popular_recipes_v1 WITH (security_invoker = true) AS
SELECT 
    r.*,
    COALESCE(s.save_count, 0) + COALESCE(w.want_count, 0) * 2 + COALESCE(cs.session_count, 0) * 5 AS popularity_score
FROM recipes r
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as save_count FROM saves GROUP BY recipe_id
) s ON s.recipe_id = r.id
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as want_count FROM want_to_cook GROUP BY recipe_id
) w ON w.recipe_id = r.id
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as session_count FROM cooking_sessions WHERE recipe_id IS NOT NULL GROUP BY recipe_id
) cs ON cs.recipe_id = r.id
WHERE r.status = 'PUBLISHED' AND (r.scheduled_for IS NULL OR r.scheduled_for <= NOW()) AND r.deleted_at IS NULL;

