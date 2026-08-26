-- Stories V2 Database Migration

-- Add new columns for advanced composition
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_transform JSONB DEFAULT NULL;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS overlays JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS background JSONB DEFAULT NULL;

-- Validate the JSONB structure (at least basic type checking, deeper validation is in the application layer)
-- We enforce that overlays is an array.
ALTER TABLE public.stories ADD CONSTRAINT stories_overlays_is_array CHECK (jsonb_typeof(overlays) = 'array');

