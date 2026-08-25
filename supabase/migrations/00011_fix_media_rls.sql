-- Drop old policies to be absolutely sure
DROP POLICY IF EXISTS "Media assets visible to everyone" ON media_assets;
DROP POLICY IF EXISTS "Owner can insert media assets" ON media_assets;
DROP POLICY IF EXISTS "Owner can update media assets" ON media_assets;
DROP POLICY IF EXISTS "Owner can delete media assets" ON media_assets;

-- Recreate policies for media_assets
CREATE POLICY "Media assets visible to everyone" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Owner can insert media assets" ON media_assets FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update media assets" ON media_assets FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete media assets" ON media_assets FOR DELETE USING (owner_id = auth.uid());

-- Recreate storage policies just in case
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
CREATE POLICY "Auth Users Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Auth Users Update" ON storage.objects;
CREATE POLICY "Auth Users Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'recipe_media' AND 
    auth.uid() = owner AND
    (storage.foldername(name))[1] = auth.uid()::text
);