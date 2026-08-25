-- MIS ARROCES — BLOCK 5.1 (UNIFIED MEDIA)

-- 1. RLS FOR MEDIA ASSETS
CREATE POLICY "Media assets visible to everyone" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Owner can insert media assets" ON media_assets FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update media assets" ON media_assets FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete media assets" ON media_assets FOR DELETE USING (owner_id = auth.uid());

-- 2. SECURE ATTACHMENTS (PREVENT ATTACHING OTHER USER'S MEDIA)
-- Recipe Media
DROP POLICY IF EXISTS "Owner manage recipe_media" ON recipe_media;
CREATE POLICY "Owner manage recipe_media" ON recipe_media FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_media.recipe_id AND recipes.owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_media.recipe_id AND recipes.owner_id = auth.uid())
  AND
  EXISTS (SELECT 1 FROM media_assets WHERE media_assets.id = recipe_media.media_id AND media_assets.owner_id = auth.uid())
);

-- Post Media
DROP POLICY IF EXISTS "Author can insert post media" ON post_media;
CREATE POLICY "Author can insert post media" ON post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM social_posts WHERE id = post_media.post_id AND author_id = auth.uid())
  AND
  EXISTS (SELECT 1 FROM media_assets WHERE media_assets.id = post_media.media_id AND media_assets.owner_id = auth.uid())
);

-- Session Media
DROP POLICY IF EXISTS "Owner can insert session media" ON session_media;
CREATE POLICY "Owner can insert session media" ON session_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM cooking_sessions WHERE id = session_media.session_id AND user_id = auth.uid())
  AND
  EXISTS (SELECT 1 FROM media_assets WHERE media_assets.id = session_media.media_id AND media_assets.owner_id = auth.uid())
);

-- 3. STORAGE PATH SECURITY
-- The recipe_media bucket is configured in 00002_storage_setup.sql with basic policies.
-- We must ensure users can only upload to their own path: {user_id}/*
-- Drop the overly permissive insert policy from 00002:
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
CREATE POLICY "Auth Users Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Drop the overly permissive update policy:
DROP POLICY IF EXISTS "Auth Users Update" ON storage.objects;
CREATE POLICY "Auth Users Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'recipe_media' AND 
    auth.uid() = owner AND
    (storage.foldername(name))[1] = auth.uid()::text
);
