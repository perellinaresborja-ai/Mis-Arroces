-- 00003_rls_policies.sql

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes
CREATE POLICY "Recipes are viewable by everyone if public" ON recipes FOR SELECT USING (visibility = 'PUBLIC' OR owner_id = auth.uid());
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = owner_id);

-- Recipe child tables (dependent on recipe owner)
-- Since we can't easily JOIN in the USING clause without performance hits, 
-- we use a subquery to check if the user owns the parent recipe.

-- Recipe Media
CREATE POLICY "Public read recipe_media" ON recipe_media FOR SELECT USING (true);
CREATE POLICY "Owner manage recipe_media" ON recipe_media FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_media.recipe_id AND recipes.owner_id = auth.uid())
);

-- Recipe Steps
CREATE POLICY "Public read recipe_steps" ON recipe_steps FOR SELECT USING (true);
CREATE POLICY "Owner manage recipe_steps" ON recipe_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_steps.recipe_id AND recipes.owner_id = auth.uid())
);

-- Recipe Ingredients
CREATE POLICY "Public read recipe_ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Owner manage recipe_ingredients" ON recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.owner_id = auth.uid())
);

-- Recipe Vessels
CREATE POLICY "Public read recipe_vessels" ON recipe_vessels FOR SELECT USING (true);
CREATE POLICY "Owner manage recipe_vessels" ON recipe_vessels FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_vessels.recipe_id AND recipes.owner_id = auth.uid())
);

-- Recipe Tags
CREATE POLICY "Public read recipe_tags" ON recipe_tags FOR SELECT USING (true);
CREATE POLICY "Owner manage recipe_tags" ON recipe_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_tags.recipe_id AND recipes.owner_id = auth.uid())
);
