-- MIS ARROCES — BLOCK 4 MIGRATION

-- 1. SOCIAL POSTS
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2200),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  visibility visibility_level_enum NOT NULL DEFAULT 'PUBLIC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);

-- 2. POST MEDIA
CREATE TABLE IF NOT EXISTS post_media (
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, media_id)
);

-- 3. SPECIFIC PEOPLE ACCESS (DEFERRED FEATURE, SCHEMA READY)
CREATE TABLE IF NOT EXISTS resource_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('RECIPE', 'POST', 'SESSION')),
  resource_id UUID NOT NULL,
  granted_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_type, resource_id, granted_to_id)
);

-- 4. PRIVATE SHARE LINKS (DEFERRED FEATURE, SCHEMA READY)
CREATE TABLE IF NOT EXISTS private_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('RECIPE', 'POST', 'SESSION', 'COOKBOOK')),
  resource_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ==============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ==============================================================================

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_share_links ENABLE ROW LEVEL SECURITY;

-- SOCIAL POSTS POLICIES
CREATE POLICY "Posts visible to public" ON social_posts FOR SELECT USING (visibility = 'PUBLIC');
CREATE POLICY "Posts visible to author" ON social_posts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Posts visible to followers" ON social_posts FOR SELECT USING (
  visibility = 'FOLLOWERS' AND EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = social_posts.author_id AND status = 'ACCEPTED'
  )
);
-- We use PRIVATE to denote Specific People for now (deferred complex SPECIFIC ENUM support).
CREATE POLICY "Posts visible to specific people" ON social_posts FOR SELECT USING (
  visibility = 'PRIVATE' AND EXISTS (
    SELECT 1 FROM resource_access_grants
    WHERE resource_type = 'POST' AND resource_id = social_posts.id AND granted_to_id = auth.uid()
  )
);
CREATE POLICY "Author can insert posts" ON social_posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Author can update posts" ON social_posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Author can delete posts" ON social_posts FOR DELETE USING (author_id = auth.uid());

-- POST MEDIA POLICIES
CREATE POLICY "Post media visible if post is visible" ON post_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM social_posts WHERE id = post_media.post_id)
);
CREATE POLICY "Author can insert post media" ON post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM social_posts WHERE id = post_media.post_id AND author_id = auth.uid())
);
CREATE POLICY "Author can delete post media" ON post_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM social_posts WHERE id = post_media.post_id AND author_id = auth.uid())
);
