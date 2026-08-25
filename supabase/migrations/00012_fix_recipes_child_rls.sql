-- Fix FOR ALL policies to explicit SELECT, INSERT, UPDATE, DELETE to avoid WITH CHECK ambiguity

-- RECIPE MEDIA
DROP POLICY IF EXISTS "Owner manage recipe_media" ON recipe_media;
CREATE POLICY "Owner insert recipe_media" ON recipe_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner update recipe_media" ON recipe_media FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner delete recipe_media" ON recipe_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);

-- RECIPE STEPS
DROP POLICY IF EXISTS "Owner manage recipe_steps" ON recipe_steps;
CREATE POLICY "Owner insert recipe_steps" ON recipe_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner update recipe_steps" ON recipe_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner delete recipe_steps" ON recipe_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);

-- RECIPE INGREDIENTS
DROP POLICY IF EXISTS "Owner manage recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "Owner insert recipe_ingredients" ON recipe_ingredients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner update recipe_ingredients" ON recipe_ingredients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner delete recipe_ingredients" ON recipe_ingredients FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);

-- RECIPE VESSELS
DROP POLICY IF EXISTS "Owner manage recipe_vessels" ON recipe_vessels;
CREATE POLICY "Owner insert recipe_vessels" ON recipe_vessels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner update recipe_vessels" ON recipe_vessels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner delete recipe_vessels" ON recipe_vessels FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);

-- RECIPE TAGS
DROP POLICY IF EXISTS "Owner manage recipe_tags" ON recipe_tags;
CREATE POLICY "Owner insert recipe_tags" ON recipe_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner update recipe_tags" ON recipe_tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
CREATE POLICY "Owner delete recipe_tags" ON recipe_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_id AND recipes.owner_id = auth.uid())
);
