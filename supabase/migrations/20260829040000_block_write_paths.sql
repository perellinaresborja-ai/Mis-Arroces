-- 20260829040000_block_write_paths.sql

-- ==============================================================================
-- 1. COMMENTS
-- ==============================================================================

-- POST COMMENTS
DROP POLICY IF EXISTS "Users can insert own post comments" ON post_comments;
CREATE POLICY "Users can insert own post comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT author_id FROM social_posts WHERE id = post_comments.post_id))
);

-- RECIPE COMMENTS
DROP POLICY IF EXISTS "Users can insert own recipe comments" ON recipe_comments;
CREATE POLICY "Users can insert own recipe comments" ON recipe_comments FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM recipes WHERE id = recipe_comments.recipe_id))
);

-- SESSION COMMENTS
DROP POLICY IF EXISTS "Users can insert own session comments" ON session_comments;
CREATE POLICY "Users can insert own session comments" ON session_comments FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT user_id FROM cooking_sessions WHERE id = session_comments.session_id))
);

-- ==============================================================================
-- 2. LIKES & REACTIONS
-- ==============================================================================

-- POST LIKES
DROP POLICY IF EXISTS "Users can insert their own post likes" ON post_likes;
CREATE POLICY "Users can insert their own post likes" ON post_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT author_id FROM social_posts WHERE id = post_likes.post_id))
);

-- RECIPE LIKES
DROP POLICY IF EXISTS "Users can insert their own recipe likes" ON recipe_likes;
CREATE POLICY "Users can insert their own recipe likes" ON recipe_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM recipes WHERE id = recipe_likes.recipe_id))
);

-- SESSION LIKES
DROP POLICY IF EXISTS "Users can insert their own session likes" ON session_likes;
CREATE POLICY "Users can insert their own session likes" ON session_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT user_id FROM cooking_sessions WHERE id = session_likes.session_id))
);

-- COMMENT LIKES
DROP POLICY IF EXISTS "Users can insert own post comment likes" ON post_comment_likes;
CREATE POLICY "Users can insert own post comment likes" ON post_comment_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT author_id FROM post_comments WHERE id = post_comment_likes.comment_id))
);

DROP POLICY IF EXISTS "Users can insert own recipe comment likes" ON recipe_comment_likes;
CREATE POLICY "Users can insert own recipe comment likes" ON recipe_comment_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT author_id FROM recipe_comments WHERE id = recipe_comment_likes.comment_id))
);

DROP POLICY IF EXISTS "Users can insert own session comment likes" ON session_comment_likes;
CREATE POLICY "Users can insert own session comment likes" ON session_comment_likes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT author_id FROM session_comments WHERE id = session_comment_likes.comment_id))
);

-- ==============================================================================
-- 3. STORIES
-- ==============================================================================

-- STORY REACTIONS
DROP POLICY IF EXISTS "Users can create their own reactions" ON story_reactions;
CREATE POLICY "Users can create their own reactions" ON story_reactions FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM stories WHERE id = story_reactions.story_id))
);

DROP POLICY IF EXISTS "Users can update their own reactions" ON story_reactions;
CREATE POLICY "Users can update their own reactions" ON story_reactions FOR UPDATE TO authenticated USING (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM stories WHERE id = story_reactions.story_id))
);

-- STORY POLL VOTES
DROP POLICY IF EXISTS "Authenticated users can vote" ON story_poll_votes;
CREATE POLICY "Authenticated users can vote" ON story_poll_votes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT stories.owner_id FROM stories JOIN story_polls ON stories.id = story_polls.story_id WHERE story_polls.id = story_poll_votes.poll_id))
);

-- ==============================================================================
-- 4. FOLLOWS
-- ==============================================================================
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = follower_id AND
  NOT public.is_blocked(auth.uid(), following_id)
);

DROP POLICY IF EXISTS "Users can manage follows" ON public.follows;
CREATE POLICY "Users can manage follows" ON public.follows FOR UPDATE TO authenticated USING (
  (auth.uid() = follower_id OR auth.uid() = following_id) AND
  NOT public.is_blocked(follower_id, following_id)
);

-- ==============================================================================
-- 5. MENTIONS
-- ==============================================================================
DROP POLICY IF EXISTS "Users can insert their own mentions" ON public.mentions;
CREATE POLICY "Users can insert their own mentions" ON public.mentions FOR INSERT TO authenticated WITH CHECK (
  actor_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), mentioned_id)
);

-- ==============================================================================
-- 6. SAVES
-- ==============================================================================
DROP POLICY IF EXISTS "Users can manage their own saves" ON saves;
CREATE POLICY "Users can manage their own saves" ON saves FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM recipes WHERE id = saves.recipe_id))
);

DROP POLICY IF EXISTS "Users can manage their own want_to_cook" ON want_to_cook;
CREATE POLICY "Users can manage their own want_to_cook" ON want_to_cook FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  NOT public.is_blocked(auth.uid(), (SELECT owner_id FROM recipes WHERE id = want_to_cook.recipe_id))
);

