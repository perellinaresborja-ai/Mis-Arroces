-- Migration: Comments V2 Media (Photos and GIFs)
-- Allows adding a single photo or GIF to comments and replies across posts, recipes, sessions, and shorts.

-- 1. POST COMMENTS
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('IMAGE', 'GIF'));
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS media_metadata JSONB;

ALTER TABLE public.post_comments ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.post_comments ALTER COLUMN content SET DEFAULT '';

ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_content_check;
ALTER TABLE public.post_comments ADD CONSTRAINT post_comments_content_check
  CHECK (
    (content IS NOT NULL AND char_length(trim(content)) > 0 AND char_length(content) <= 1000)
    OR (media_url IS NOT NULL)
  );

-- 2. RECIPE COMMENTS
ALTER TABLE public.recipe_comments ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('IMAGE', 'GIF'));
ALTER TABLE public.recipe_comments ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.recipe_comments ADD COLUMN IF NOT EXISTS media_metadata JSONB;

ALTER TABLE public.recipe_comments ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.recipe_comments ALTER COLUMN content SET DEFAULT '';

ALTER TABLE public.recipe_comments DROP CONSTRAINT IF EXISTS recipe_comments_content_check;
ALTER TABLE public.recipe_comments ADD CONSTRAINT recipe_comments_content_check
  CHECK (
    (content IS NOT NULL AND char_length(trim(content)) > 0 AND char_length(content) <= 1000)
    OR (media_url IS NOT NULL)
  );

-- 3. SESSION COMMENTS
ALTER TABLE public.session_comments ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('IMAGE', 'GIF'));
ALTER TABLE public.session_comments ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.session_comments ADD COLUMN IF NOT EXISTS media_metadata JSONB;

ALTER TABLE public.session_comments ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.session_comments ALTER COLUMN content SET DEFAULT '';

ALTER TABLE public.session_comments DROP CONSTRAINT IF EXISTS session_comments_content_check;
ALTER TABLE public.session_comments ADD CONSTRAINT session_comments_content_check
  CHECK (
    (content IS NOT NULL AND char_length(trim(content)) > 0 AND char_length(content) <= 1000)
    OR (media_url IS NOT NULL)
  );

-- 4. SHORT COMMENTS
ALTER TABLE public.short_comments ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('IMAGE', 'GIF'));
ALTER TABLE public.short_comments ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.short_comments ADD COLUMN IF NOT EXISTS media_metadata JSONB;

ALTER TABLE public.short_comments ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.short_comments ALTER COLUMN content SET DEFAULT '';

ALTER TABLE public.short_comments DROP CONSTRAINT IF EXISTS short_comments_content_check;
ALTER TABLE public.short_comments ADD CONSTRAINT short_comments_content_check
  CHECK (
    (content IS NOT NULL AND char_length(trim(content)) > 0 AND char_length(content) <= 1000)
    OR (media_url IS NOT NULL)
  );
