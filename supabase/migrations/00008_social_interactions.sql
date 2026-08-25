-- MIS ARROCES — BLOCK 6
-- SOCIAL INTERACTIONS & FEED FOUNDATION

-- 1. ADD ALLOW_COMMENTS TO POSTS AND SESSIONS (Recipes already has it)
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE cooking_sessions ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT true;

-- 2. LIKES TABLES
CREATE TABLE IF NOT EXISTS recipe_likes (
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (recipe_id, user_id)
);

CREATE TABLE IF NOT EXISTS session_likes (
    session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- 3. COMMENTS TABLES
CREATE TABLE IF NOT EXISTS recipe_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 1000),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES session_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 1000),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 1000),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INDEXES
CREATE INDEX idx_recipe_likes_user ON recipe_likes(user_id);
CREATE INDEX idx_session_likes_user ON session_likes(user_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

CREATE INDEX idx_recipe_comments_recipe_created ON recipe_comments(recipe_id, created_at);
CREATE INDEX idx_recipe_comments_parent ON recipe_comments(parent_id);

CREATE INDEX idx_session_comments_session_created ON session_comments(session_id, created_at);
CREATE INDEX idx_session_comments_parent ON session_comments(parent_id);

CREATE INDEX idx_post_comments_post_created ON post_comments(post_id, created_at);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_id);

CREATE INDEX idx_social_posts_author_created ON social_posts(author_id, created_at DESC);
CREATE INDEX idx_cooking_sessions_user_created ON cooking_sessions(user_id, date DESC);

-- 5. RLS
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- SIMPLE RLS FOR MVP (In real production we would strictly check parent visibility, 
-- but we rely heavily on UI not rendering for unauthorized users and standard authenticated access)
-- Note: A more complex `check_visibility` RPC could be written, but for V1 we keep policies simple and rely on auth.

-- Anyone authenticated can manage their own likes
CREATE POLICY "Users can insert their own recipe likes" ON recipe_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own recipe likes" ON recipe_likes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can view recipe likes" ON recipe_likes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own session likes" ON session_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own session likes" ON session_likes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can view session likes" ON session_likes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post likes" ON post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own post likes" ON post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can view post likes" ON post_likes FOR SELECT USING (true);

-- Comments
CREATE POLICY "Anyone can view recipe comments" ON recipe_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own recipe comments" ON recipe_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own recipe comments" ON recipe_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());

CREATE POLICY "Anyone can view session comments" ON session_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own session comments" ON session_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own session comments" ON session_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());

CREATE POLICY "Anyone can view post comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own post comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own post comments" ON post_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());
