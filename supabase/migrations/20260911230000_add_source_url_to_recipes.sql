-- 20260911230000_add_source_url_to_recipes.sql
-- Add source_url to recipes for "Trae tus arroces" (recipe import) feature

ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS source_url TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_owner_source_url 
ON public.recipes (owner_id, source_url) 
WHERE source_url IS NOT NULL;
