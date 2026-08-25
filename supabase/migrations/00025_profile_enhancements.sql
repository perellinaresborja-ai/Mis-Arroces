-- Add cover_media_id and nickname cooldown to profiles
ALTER TABLE profiles
ADD COLUMN cover_media_id uuid,
ADD COLUMN last_username_update timestamp with time zone;

-- Create constraint alias to force postgREST to recognize it explicitly
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_cover
FOREIGN KEY (cover_media_id)
REFERENCES media_assets(id)
ON DELETE SET NULL;

-- Create table for username history (aliases) to support redirects
CREATE TABLE username_aliases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    username text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookup when a visitor hits /@oldusername
CREATE INDEX idx_username_aliases_username ON username_aliases(username);

-- Enable RLS on username_aliases
ALTER TABLE username_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "username_aliases_read_all" ON username_aliases FOR SELECT USING (true);
CREATE POLICY "username_aliases_insert_owner" ON username_aliases FOR INSERT WITH CHECK (auth.uid() = profile_id);
