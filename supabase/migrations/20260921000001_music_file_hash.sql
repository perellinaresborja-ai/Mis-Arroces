ALTER TABLE public.story_music_tracks ADD COLUMN IF NOT EXISTS file_hash text UNIQUE;
