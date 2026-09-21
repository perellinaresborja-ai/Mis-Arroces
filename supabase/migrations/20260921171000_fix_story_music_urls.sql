-- The files were actually uploaded to music_assets bucket in a previous step,
-- but insert_music.sql hardcoded public/story_music in the URLs.
-- We fix the URLs to point to the real existing bucket.

UPDATE public.story_music_tracks
SET audio_url = REPLACE(audio_url, '/story_music/', '/music_assets/')
WHERE audio_url LIKE '%/story_music/%';