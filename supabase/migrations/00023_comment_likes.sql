CREATE TABLE IF NOT EXISTS recipe_comment_likes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, comment_id)
);
ALTER TABLE recipe_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe comment likes" ON recipe_comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own recipe comment likes" ON recipe_comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own recipe comment likes" ON recipe_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS session_comment_likes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES session_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, comment_id)
);
ALTER TABLE session_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view session comment likes" ON session_comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own session comment likes" ON session_comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own session comment likes" ON session_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS post_comment_likes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, comment_id)
);
ALTER TABLE post_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post comment likes" ON post_comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own post comment likes" ON post_comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own post comment likes" ON post_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());