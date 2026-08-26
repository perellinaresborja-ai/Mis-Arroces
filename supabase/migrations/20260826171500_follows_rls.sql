CREATE POLICY "Public read access on follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Users can manage follows" ON public.follows FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);
