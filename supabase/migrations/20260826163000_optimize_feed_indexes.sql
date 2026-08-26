CREATE INDEX IF NOT EXISTS idx_recipes_feed ON public.recipes(status, scheduled_for, created_at DESC) INCLUDE (owner_id, visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_feed ON public.social_posts(status, scheduled_for, created_at DESC) INCLUDE (author_id, visibility);
CREATE INDEX IF NOT EXISTS idx_sessions_feed ON public.cooking_sessions(created_at DESC) INCLUDE (user_id, visibility);
