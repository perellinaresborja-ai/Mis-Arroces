-- Add emoji column to all comment likes tables
ALTER TABLE public.recipe_comment_likes ADD COLUMN IF NOT EXISTS emoji text NOT NULL DEFAULT '🥘';
