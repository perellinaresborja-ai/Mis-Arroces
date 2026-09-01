CREATE OR REPLACE VIEW public.feed_metrics WITH (security_invoker = on) AS
SELECT 
    id AS entity_id, 
    'post' AS entity_type,
    (SELECT count(*) FROM public.post_likes WHERE post_id = sp.id) AS like_count,
    (SELECT count(*) FROM public.post_comments WHERE post_id = sp.id AND is_deleted = false) AS comment_count,
    COALESCE((SELECT jsonb_object_agg(emoji, cnt) FROM (SELECT emoji, count(*) as cnt FROM public.post_likes WHERE post_id = sp.id GROUP BY emoji) t), '{}'::jsonb) AS grouped_reactions,
    (SELECT emoji FROM public.post_likes WHERE post_id = sp.id AND user_id = auth.uid() LIMIT 1) AS current_user_reaction
FROM public.social_posts sp
UNION ALL
SELECT 
    id AS entity_id, 
    'recipe' AS entity_type,
    (SELECT count(*) FROM public.recipe_likes WHERE recipe_id = r.id) AS like_count,
    (SELECT count(*) FROM public.recipe_comments WHERE recipe_id = r.id AND is_deleted = false) AS comment_count,
    COALESCE((SELECT jsonb_object_agg(emoji, cnt) FROM (SELECT emoji, count(*) as cnt FROM public.recipe_likes WHERE recipe_id = r.id GROUP BY emoji) t), '{}'::jsonb) AS grouped_reactions,
    (SELECT emoji FROM public.recipe_likes WHERE recipe_id = r.id AND user_id = auth.uid() LIMIT 1) AS current_user_reaction
FROM public.recipes r
UNION ALL
SELECT 
    id AS entity_id, 
    'session' AS entity_type,
    (SELECT count(*) FROM public.session_likes WHERE session_id = s.id) AS like_count,
    (SELECT count(*) FROM public.session_comments WHERE session_id = s.id AND is_deleted = false) AS comment_count,
    COALESCE((SELECT jsonb_object_agg(emoji, cnt) FROM (SELECT emoji, count(*) as cnt FROM public.session_likes WHERE session_id = s.id GROUP BY emoji) t), '{}'::jsonb) AS grouped_reactions,
    (SELECT emoji FROM public.session_likes WHERE session_id = s.id AND user_id = auth.uid() LIMIT 1) AS current_user_reaction
FROM public.cooking_sessions s;
