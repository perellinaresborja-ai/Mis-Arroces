-- Migration for Story Media Bucket (Private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story_media', 'story_media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Allow authenticated users to upload to story_media
CREATE POLICY "Users can upload story media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story_media' AND auth.uid() = owner);

-- Allow users to update their own story media
CREATE POLICY "Users can update own story media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'story_media' AND auth.uid() = owner);

-- Allow users to delete their own story media
CREATE POLICY "Users can delete own story media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'story_media' AND auth.uid() = owner);

-- Allow viewing if you have a signed URL (Supabase handles this automatically for private buckets when using signed URLs, but we need to ensure no public access)
-- Note: Signed URLs bypass RLS for SELECT if they are valid.
