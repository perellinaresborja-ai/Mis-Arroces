-- Stories
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visibility visibility_level_enum NOT NULL DEFAULT 'PUBLIC',
    caption TEXT CHECK (char_length(caption) <= 300),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES cooking_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    CONSTRAINT single_link CHECK (
        (recipe_id IS NULL AND session_id IS NULL) OR
        (recipe_id IS NOT NULL AND session_id IS NULL) OR
        (recipe_id IS NULL AND session_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS story_media (
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (story_id, media_id)
);

-- Shorts
CREATE TABLE IF NOT EXISTS shorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visibility visibility_level_enum NOT NULL DEFAULT 'PUBLIC',
    caption TEXT CHECK (char_length(caption) <= 500),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES cooking_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_link_short CHECK (
        (recipe_id IS NULL AND session_id IS NULL) OR
        (recipe_id IS NOT NULL AND session_id IS NULL) OR
        (recipe_id IS NULL AND session_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS short_media (
    short_id UUID NOT NULL REFERENCES shorts(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (short_id, media_id)
);

CREATE TABLE IF NOT EXISTS short_likes (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    short_id UUID NOT NULL REFERENCES shorts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, short_id)
);

CREATE TABLE IF NOT EXISTS short_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id UUID NOT NULL REFERENCES shorts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES short_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 1000),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS short_comment_likes (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES short_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, comment_id)
);

-- RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public/followers stories" ON stories FOR SELECT USING (
    visibility = 'PUBLIC' OR 
    owner_id = auth.uid() OR 
    (visibility = 'FOLLOWERS' AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = stories.owner_id AND status = 'ACCEPTED'))
);
CREATE POLICY "Insert own stories" ON stories FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own stories" ON stories FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Delete own stories" ON stories FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "View story media" ON story_media FOR SELECT USING (true);
CREATE POLICY "Insert story media" ON story_media FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stories WHERE id = story_id AND owner_id = auth.uid()));

CREATE POLICY "View public/followers shorts" ON shorts FOR SELECT USING (
    visibility = 'PUBLIC' OR 
    owner_id = auth.uid() OR 
    (visibility = 'FOLLOWERS' AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = shorts.owner_id AND status = 'ACCEPTED'))
);
CREATE POLICY "Insert own shorts" ON shorts FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own shorts" ON shorts FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Delete own shorts" ON shorts FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "View short media" ON short_media FOR SELECT USING (true);
CREATE POLICY "Insert short media" ON short_media FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM shorts WHERE id = short_id AND owner_id = auth.uid()));

CREATE POLICY "View short likes" ON short_likes FOR SELECT USING (true);
CREATE POLICY "Insert own short likes" ON short_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own short likes" ON short_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "View short comments" ON short_comments FOR SELECT USING (true);
CREATE POLICY "Insert own short comments" ON short_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Update own short comments" ON short_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());

CREATE POLICY "View short comment likes" ON short_comment_likes FOR SELECT USING (true);
CREATE POLICY "Insert own short comment likes" ON short_comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own short comment likes" ON short_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());