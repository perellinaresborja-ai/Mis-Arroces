ALTER TABLE public.recipe_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.session_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.post_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';
ALTER TABLE public.short_likes ADD COLUMN emoji text NOT NULL DEFAULT '🥘';