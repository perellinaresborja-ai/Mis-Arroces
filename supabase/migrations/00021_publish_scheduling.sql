-- 1. Add 'Leña y sarmiento' to heat_sources
INSERT INTO heat_sources (name) VALUES ('Leña y sarmiento') ON CONFLICT (name) DO NOTHING;

-- 2. Add scheduling support to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- 3. Add status and scheduling support to social_posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS status recipe_status_enum NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- 4. Update Recipes Policies to enforce DRAFT and SCHEDULED isolation
DROP POLICY IF EXISTS "Recipes are viewable by everyone if public" ON recipes;
DROP POLICY IF EXISTS "Followers can view recipes" ON recipes;

CREATE POLICY "Recipes viewable public" ON recipes FOR SELECT USING (
  owner_id = auth.uid() OR 
  (
    status = 'PUBLISHED' AND 
    (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
    visibility = 'PUBLIC'
  )
);

CREATE POLICY "Recipes viewable followers" ON recipes FOR SELECT USING (
  status = 'PUBLISHED' AND 
  (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
  visibility = 'FOLLOWERS' AND 
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = recipes.owner_id AND status = 'ACCEPTED'
  )
);

-- 5. Update Social Posts Policies to enforce DRAFT and SCHEDULED isolation
DROP POLICY IF EXISTS "Posts visible to public" ON social_posts;
DROP POLICY IF EXISTS "Posts visible to followers" ON social_posts;

CREATE POLICY "Posts viewable public" ON social_posts FOR SELECT USING (
  author_id = auth.uid() OR 
  (
    status = 'PUBLISHED' AND 
    (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
    visibility = 'PUBLIC'
  )
);

CREATE POLICY "Posts viewable followers" ON social_posts FOR SELECT USING (
  status = 'PUBLISHED' AND 
  (scheduled_for IS NULL OR scheduled_for <= NOW()) AND 
  visibility = 'FOLLOWERS' AND 
  EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = social_posts.author_id AND status = 'ACCEPTED'
  )
);

-- Note: We recreate or update the feed views if necessary, but the views already filter by `status = 'PUBLISHED'`.
-- We should update them to also check `scheduled_for IS NULL OR scheduled_for <= NOW()`.
CREATE OR REPLACE VIEW feed_items AS
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
WHERE r.status = 'PUBLISHED' AND (r.scheduled_for IS NULL OR r.scheduled_for <= NOW());

