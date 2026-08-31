-- 20260831000001_nutrition_rls.sql

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Admin can manage ingredient allergens" ON public.ingredient_allergens;

-- Ensure read-only for public/authenticated
CREATE POLICY "Read only for everyone" ON public.ingredient_allergens FOR SELECT USING (true);
-- No insert/update/delete policies for authenticated means they are blocked.

-- Make sure ingredients is read-only
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ingredients visible to everyone" ON public.ingredients;
CREATE POLICY "Ingredients visible to everyone" ON public.ingredients FOR SELECT USING (true);
-- Block write
DROP POLICY IF EXISTS "Anyone can insert ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated can insert ingredients" ON public.ingredients;

-- Same for allergens
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allergens visible to everyone" ON public.allergens;
CREATE POLICY "Allergens visible to everyone" ON public.allergens FOR SELECT USING (true);
