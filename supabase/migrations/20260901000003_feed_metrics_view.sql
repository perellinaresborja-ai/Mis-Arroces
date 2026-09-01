CREATE OR REPLACE VIEW public.feed_metrics AS
SELECT 
    id AS entity_id, 
    'post' AS entity_type,
    (SELECT count(*) FROM public.post_likes WHERE post_id = sp.id) AS like_count,
    (SELECT count(*) FROM public.post_comments WHERE post_id = sp.id AND is_deleted = false) AS comment_count
FROM public.social_posts sp
UNION ALL
SELECT 
    id AS entity_id, 
    'recipe' AS entity_type,
    (SELECT count(*) FROM public.recipe_likes WHERE recipe_id = r.id) AS like_count,
    (SELECT count(*) FROM public.recipe_comments WHERE recipe_id = r.id AND is_deleted = false) AS comment_count
FROM public.recipes r
UNION ALL
SELECT 
    id AS entity_id, 
    'session' AS entity_type,
    (SELECT count(*) FROM public.session_likes WHERE session_id = s.id) AS like_count,
FROM public.cooking_sessions s;

-- Index for fast counting
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON public.recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON public.recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_session_likes_session_id ON public.session_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_comments_session_id ON public.session_comments(session_id);

