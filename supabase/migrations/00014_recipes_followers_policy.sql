-- Add missing policy for recipes with FOLLOWERS visibility

CREATE POLICY "Recipes visible to followers" ON recipes FOR SELECT USING (
  visibility = 'FOLLOWERS' AND EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = auth.uid() 
    AND following_id = recipes.owner_id
    AND status = 'ACCEPTED'
  )
);
