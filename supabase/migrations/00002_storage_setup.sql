-- 00002_storage_setup.sql

-- Enable storage extension if not present (usually on by default in Supabase)
-- We need to create a bucket for recipe media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe_media', 'recipe_media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public read access to all files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'recipe_media');

-- Allow authenticated users to upload files
CREATE POLICY "Auth Users Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated'
);

-- Allow users to update and delete their own files
CREATE POLICY "Auth Users Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'recipe_media' AND 
    auth.uid() = owner
);

CREATE POLICY "Auth Users Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'recipe_media' AND 
    auth.uid() = owner
);
