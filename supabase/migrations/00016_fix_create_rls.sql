-- Clean up and recreate policies for recipes and social_posts

-- RECIPES
DROP POLICY IF EXISTS "Recipes are viewable by everyone if public" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
DROP POLICY IF EXISTS "Recipes visible to followers" ON recipes;

CREATE POLICY "Recipes are viewable by everyone if public" ON recipes FOR SELECT USING (visibility = 'PUBLIC' OR owner_id = auth.uid());
CREATE POLICY "Recipes visible to followers" ON recipes FOR SELECT USING (visibility = 'FOLLOWERS' AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = recipes.owner_id AND status = 'ACCEPTED'));

CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = owner_id);

-- SOCIAL POSTS
DROP POLICY IF EXISTS "Posts visible to public" ON social_posts;
DROP POLICY IF EXISTS "Posts visible to author" ON social_posts;
DROP POLICY IF EXISTS "Posts visible to followers" ON social_posts;
DROP POLICY IF EXISTS "Posts visible to specific people" ON social_posts;
DROP POLICY IF EXISTS "Author can insert posts" ON social_posts;
DROP POLICY IF EXISTS "Author can update posts" ON social_posts;
DROP POLICY IF EXISTS "Author can delete posts" ON social_posts;

CREATE POLICY "Posts visible to public" ON social_posts FOR SELECT USING (visibility = 'PUBLIC');
CREATE POLICY "Posts visible to author" ON social_posts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Posts visible to followers" ON social_posts FOR SELECT USING (visibility = 'FOLLOWERS' AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = social_posts.author_id AND status = 'ACCEPTED'));
CREATE POLICY "Posts visible to specific people" ON social_posts FOR SELECT USING (visibility = 'PRIVATE' AND EXISTS (SELECT 1 FROM resource_access_grants WHERE resource_type = 'POST' AND resource_id = social_posts.id AND granted_to_id = auth.uid()));

CREATE POLICY "Author can insert posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author can update posts" ON social_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Author can delete posts" ON social_posts FOR DELETE USING (auth.uid() = author_id);

-- MEDIA ASSETS
DROP POLICY IF EXISTS "Media assets are viewable by everyone" ON media_assets;
DROP POLICY IF EXISTS "Owner can insert media assets" ON media_assets;
DROP POLICY IF EXISTS "Owner can delete media assets" ON media_assets;

CREATE POLICY "Media assets are viewable by everyone" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Owner can insert media assets" ON media_assets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can delete media assets" ON media_assets FOR DELETE USING (auth.uid() = owner_id);
