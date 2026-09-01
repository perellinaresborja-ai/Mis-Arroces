ALTER TABLE public.post_comment_likes ADD COLUMN IF NOT EXISTS emoji text;
ALTER TABLE public.recipe_comment_likes ADD COLUMN IF NOT EXISTS emoji text;
ALTER TABLE public.session_comment_likes ADD COLUMN IF NOT EXISTS emoji text;
ALTER TABLE public.short_comment_likes ADD COLUMN IF NOT EXISTS emoji text;
