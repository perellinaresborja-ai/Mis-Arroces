-- Migration: Stories Music V1
-- Creates the music catalog and modifies stories table

-- 1. Create the catalog table
CREATE TABLE IF NOT EXISTS public.story_music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- usually the storage path in the music_assets bucket
    duration_ms INT NOT NULL CHECK (duration_ms > 0),
    category TEXT,
    source_license TEXT NOT NULL,
    source_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Modify stories table to hold music_config
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_config JSONB DEFAULT NULL;

-- 3. RLS Policies for Catalog
ALTER TABLE public.story_music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active music tracks" 
ON public.story_music_tracks 
FOR SELECT 
USING (active = true);

-- 4. Storage Bucket
-- (Assuming we can insert into storage.buckets. If not, user will do it manually)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('music_assets', 'music_assets', true, 10485760, '{"audio/mpeg", "audio/mp3", "audio/aac", "audio/mp4", "audio/m4a"}')
ON CONFLICT (id) DO NOTHING;

-- RLS for bucket
CREATE POLICY "Public read music_assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'music_assets');
