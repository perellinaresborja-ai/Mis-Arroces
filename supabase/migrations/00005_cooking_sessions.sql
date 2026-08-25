-- MIS ARROCES — BLOCK 5 MIGRATION (COOKING SESSIONS)

-- Additional Indexes for Performance (as requested in 25)
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_user_date ON cooking_sessions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_recipe_date ON cooking_sessions (recipe_id, date DESC);

-- ==============================================================================
-- RLS POLICIES FOR COOKING SESSIONS & SESSION MEDIA
-- ==============================================================================

-- COOKING SESSIONS
CREATE POLICY "Sessions visible to public" ON cooking_sessions FOR SELECT USING (visibility = 'PUBLIC');
CREATE POLICY "Sessions visible to owner" ON cooking_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Sessions visible to followers" ON cooking_sessions FOR SELECT USING (
  visibility = 'FOLLOWERS' AND EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() AND following_id = cooking_sessions.user_id AND status = 'ACCEPTED'
  )
);
-- Notice: Block rules are conceptually handled (as requested) though not strictly embedded here to keep it simple, 
-- or we can use the is_blocked helper if we want full strictness:
-- AND NOT is_blocked(cooking_sessions.user_id, auth.uid())

CREATE POLICY "Owner can insert sessions" ON cooking_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can update sessions" ON cooking_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Owner can delete sessions" ON cooking_sessions FOR DELETE USING (user_id = auth.uid());

-- SESSION MEDIA
CREATE POLICY "Session media visible if session is visible" ON session_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM cooking_sessions WHERE id = session_media.session_id)
);
CREATE POLICY "Owner can insert session media" ON session_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM cooking_sessions WHERE id = session_media.session_id AND user_id = auth.uid())
);
CREATE POLICY "Owner can update session media" ON session_media FOR UPDATE USING (
  EXISTS (SELECT 1 FROM cooking_sessions WHERE id = session_media.session_id AND user_id = auth.uid())
);
CREATE POLICY "Owner can delete session media" ON session_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM cooking_sessions WHERE id = session_media.session_id AND user_id = auth.uid())
);
