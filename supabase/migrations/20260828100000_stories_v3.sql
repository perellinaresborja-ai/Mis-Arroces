-- STORIES V3 MIGRATION

-- 1. STORY HIGHLIGHTS
CREATE TABLE IF NOT EXISTS story_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying user highlights
CREATE INDEX IF NOT EXISTS idx_story_highlights_user ON story_highlights(user_id);

CREATE TABLE IF NOT EXISTS highlight_stories (
    highlight_id UUID NOT NULL REFERENCES story_highlights(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (highlight_id, story_id)
);

-- 2. POLLS
CREATE TABLE IF NOT EXISTS story_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_poll_votes (
    poll_id UUID NOT NULL REFERENCES story_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (poll_id, user_id)
);

-- 3. RLS POLICIES FOR HIGHLIGHTS
ALTER TABLE story_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlight_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights visible to everyone" ON story_highlights FOR SELECT USING (true);
CREATE POLICY "Owner can insert highlights" ON story_highlights FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can update highlights" ON story_highlights FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Owner can delete highlights" ON story_highlights FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Highlight stories visible to everyone" ON highlight_stories FOR SELECT USING (true);
CREATE POLICY "Owner can insert highlight stories" ON highlight_stories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM story_highlights WHERE id = highlight_stories.highlight_id AND user_id = auth.uid())
);
CREATE POLICY "Owner can update highlight stories" ON highlight_stories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM story_highlights WHERE id = highlight_stories.highlight_id AND user_id = auth.uid())
);
CREATE POLICY "Owner can delete highlight stories" ON highlight_stories FOR DELETE USING (
    EXISTS (SELECT 1 FROM story_highlights WHERE id = highlight_stories.highlight_id AND user_id = auth.uid())
);

-- 4. RLS POLICIES FOR POLLS
ALTER TABLE story_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Polls visible to everyone" ON story_polls FOR SELECT USING (true);
CREATE POLICY "Owner can insert polls" ON story_polls FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stories WHERE id = story_polls.story_id AND owner_id = auth.uid())
);

CREATE POLICY "Votes visible to poll owner" ON story_poll_votes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM story_polls 
        JOIN stories ON stories.id = story_polls.story_id 
        WHERE story_polls.id = story_poll_votes.poll_id AND stories.owner_id = auth.uid()
    )
    OR user_id = auth.uid()
);
CREATE POLICY "Authenticated users can vote" ON story_poll_votes FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Update stories table with privacy fields (already might have some, but let's ensure)
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS allow_replies BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS allow_reactions BOOLEAN NOT NULL DEFAULT true;

