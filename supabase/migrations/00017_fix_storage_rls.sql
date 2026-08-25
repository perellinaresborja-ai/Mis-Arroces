-- Drop old storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Delete" ON storage.objects;

-- Recreate bulletproof storage policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'recipe_media');

CREATE POLICY "Auth Users Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Auth Users Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Auth Users Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'recipe_media' AND 
    auth.role() = 'authenticated'
);
