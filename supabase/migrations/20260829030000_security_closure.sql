-- 017_security_closure.sql

-- ============================================================================
-- 1. MAKE FEED_ITEMS SECURE
-- ============================================================================
-- We add security_invoker = true so that queries to the feed_items view
-- automatically apply the RLS policies of the underlying tables (recipes, posts, sessions).
DROP VIEW IF EXISTS feed_items;

CREATE VIEW feed_items WITH (security_invoker = true) AS
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
WHERE p.scheduled_for IS NULL OR p.scheduled_for <= NOW()

UNION ALL

SELECT 
  'session' as entity_type,
  s.id as entity_id,
  s.user_id as user_id,
  s.created_at,
  s.visibility
FROM cooking_sessions s;

-- ============================================================================
-- 2. ABSOLUTE BIDIRECTIONAL BLOCKS IN RLS
-- ============================================================================

-- POSTS
DROP POLICY IF EXISTS "Posts visible to public" ON social_posts;
CREATE POLICY "Posts visible to public" ON social_posts FOR SELECT USING (visibility = 'PUBLIC' AND NOT public.is_blocked(auth.uid(), author_id));

DROP POLICY IF EXISTS "Posts visible to followers" ON social_posts;
CREATE POLICY "Posts visible to followers" ON social_posts FOR SELECT USING (
  visibility = 'FOLLOWERS' 
  AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = social_posts.author_id AND status = 'ACCEPTED')
  AND NOT public.is_blocked(auth.uid(), author_id)
);

-- RECIPES
DROP POLICY IF EXISTS "Recipes viewable public" ON recipes;
DROP POLICY IF EXISTS "Recipes visible to public" ON recipes;
CREATE POLICY "Recipes visible to public" ON recipes FOR SELECT USING (visibility = 'PUBLIC' AND NOT public.is_blocked(auth.uid(), owner_id));

DROP POLICY IF EXISTS "Recipes viewable followers" ON recipes;
DROP POLICY IF EXISTS "Recipes visible to followers" ON recipes;
CREATE POLICY "Recipes visible to followers" ON recipes FOR SELECT USING (
  visibility = 'FOLLOWERS' 
  AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = recipes.owner_id AND status = 'ACCEPTED')
  AND NOT public.is_blocked(auth.uid(), owner_id)
);

-- SESSIONS
DROP POLICY IF EXISTS "Sessions visible to public" ON cooking_sessions;
CREATE POLICY "Sessions visible to public" ON cooking_sessions FOR SELECT USING (visibility = 'PUBLIC' AND NOT public.is_blocked(auth.uid(), user_id));

DROP POLICY IF EXISTS "Sessions visible to followers" ON cooking_sessions;
CREATE POLICY "Sessions visible to followers" ON cooking_sessions FOR SELECT USING (
  visibility = 'FOLLOWERS' 
  AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = cooking_sessions.user_id AND status = 'ACCEPTED')
  AND NOT public.is_blocked(auth.uid(), user_id)
);

-- STORIES
DROP POLICY IF EXISTS "View public/followers stories" ON stories;
CREATE POLICY "View public/followers stories" ON stories FOR SELECT USING (
  NOT public.is_blocked(auth.uid(), owner_id) AND (
    visibility = 'PUBLIC' OR 
    owner_id = auth.uid() OR 
    (visibility = 'FOLLOWERS' AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = stories.owner_id AND status = 'ACCEPTED')) OR 
    (visibility = 'PRIVATE' AND EXISTS (SELECT 1 FROM resource_access_grants WHERE resource_type = 'STORY' AND resource_id = stories.id AND granted_to_id = auth.uid()))
  )
);

-- HIGHLIGHTS
DROP POLICY IF EXISTS "Highlights visible to everyone" ON story_highlights;
CREATE POLICY "Highlights visible to everyone" ON story_highlights FOR SELECT USING (NOT public.is_blocked(auth.uid(), user_id));

DROP POLICY IF EXISTS "Highlight stories visible to everyone" ON highlight_stories;
CREATE POLICY "Highlight stories visible to everyone" ON highlight_stories FOR SELECT USING (
  EXISTS (SELECT 1 FROM story_highlights h WHERE h.id = highlight_stories.highlight_id AND NOT public.is_blocked(auth.uid(), h.user_id))
);

-- COMMENTS
DROP POLICY IF EXISTS "Anyone can view post comments" ON post_comments;
DROP POLICY IF EXISTS "Comments viewable by everyone" ON post_comments;
CREATE POLICY "Anyone can view post comments" ON post_comments FOR SELECT USING (NOT public.is_blocked(auth.uid(), author_id));

DROP POLICY IF EXISTS "Anyone can view recipe comments" ON recipe_comments;
DROP POLICY IF EXISTS "Comments viewable by everyone" ON recipe_comments;
CREATE POLICY "Anyone can view recipe comments" ON recipe_comments FOR SELECT USING (NOT public.is_blocked(auth.uid(), author_id));

DROP POLICY IF EXISTS "Anyone can view session comments" ON session_comments;
DROP POLICY IF EXISTS "Comments viewable by everyone" ON session_comments;
CREATE POLICY "Anyone can view session comments" ON session_comments FOR SELECT USING (NOT public.is_blocked(auth.uid(), author_id));

-- PROFILES (Hide profiles entirely if blocked)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (NOT public.is_blocked(auth.uid(), id));

-- ============================================================================
-- 3. MEDIA IDOR
-- ============================================================================

-- STORY MEDIA
DROP POLICY IF EXISTS "Insert story media" ON story_media;
CREATE POLICY "Insert story media" ON story_media FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND owner_id = auth.uid()) AND
  (
    EXISTS (SELECT 1 FROM media_assets WHERE id = media_id AND owner_id = auth.uid()) 
    OR 
    EXISTS (SELECT 1 FROM recipe_media rm JOIN recipes r ON rm.recipe_id = r.id WHERE rm.media_id = story_media.media_id AND (r.visibility = 'PUBLIC' OR r.owner_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM session_media sm JOIN cooking_sessions s ON sm.session_id = s.id WHERE sm.media_id = story_media.media_id AND (s.visibility = 'PUBLIC' OR s.user_id = auth.uid()))
  )
);

-- MESSAGE ATTACHMENTS
DROP POLICY IF EXISTS "Users can insert message attachments for own messages" ON message_attachments;
CREATE POLICY "Users can insert message attachments for own messages" ON message_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
        AND messages.sender_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE name = message_attachments.storage_path 
        AND bucket_id = 'message_media' 
        AND owner = auth.uid()
    )
  );

-- ============================================================================
-- 4. EXISTING DMS (Insert block check)
-- ============================================================================
DROP POLICY IF EXISTS "Insert messages" ON messages;
CREATE POLICY "Insert messages" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid() AND status = 'ACTIVE') AND
  NOT EXISTS (
    SELECT 1 FROM conversation_members cm 
    WHERE cm.conversation_id = messages.conversation_id 
      AND cm.user_id != auth.uid() 
      AND public.is_blocked(auth.uid(), cm.user_id)
  )
);

-- ============================================================================
-- 5. PREVENT BLOCKED NOTIFICATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (
  auth.uid() = actor_id AND
  NOT public.is_blocked(auth.uid(), recipient_id)
);
