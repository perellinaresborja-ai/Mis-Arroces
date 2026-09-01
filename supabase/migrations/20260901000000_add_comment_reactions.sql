-- Add emoji column to all comment likes tables
ALTER TABLE public.recipe_comment_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.session_comment_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.post_comment_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.short_comment_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
