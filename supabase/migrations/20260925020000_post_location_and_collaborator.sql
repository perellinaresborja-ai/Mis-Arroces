-- Migration: Add location and collaborator_id to social_posts
-- Enables enriched post metadata: location tagging and co-authorship / collaboration.

ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS collaborator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_social_posts_collaborator_id 
ON public.social_posts(collaborator_id);
