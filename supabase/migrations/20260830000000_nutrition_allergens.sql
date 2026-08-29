-- 20260830000000_nutrition_allergens.sql

-- 1. Extend Ingredients with Nutrition Data
ALTER TABLE public.ingredients 
ADD COLUMN IF NOT EXISTS kcal_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS protein_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS carbs_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS fat_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS fiber_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS salt_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS nutrition_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_grams_per_unit NUMERIC;

-- 2. Allergens
CREATE TABLE IF NOT EXISTS public.allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS public.ingredient_allergens (
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES public.allergens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (ingredient_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_manual_allergens (
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES public.allergens(id) ON DELETE CASCADE,
    is_excluded BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (recipe_id, allergen_id)
);

-- RLS
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allergens visible to everyone" ON public.allergens FOR SELECT USING (true);

ALTER TABLE public.ingredient_allergens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredient allergens visible to everyone" ON public.ingredient_allergens FOR SELECT USING (true);
CREATE POLICY "Admin can manage ingredient allergens" ON public.ingredient_allergens FOR ALL TO authenticated USING (true); -- V1: simplified auth

ALTER TABLE public.recipe_manual_allergens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manual allergens visible to everyone" ON public.recipe_manual_allergens FOR SELECT USING (true);
CREATE POLICY "Owner can manage manual allergens" ON public.recipe_manual_allergens FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_manual_allergens.recipe_id AND owner_id = auth.uid())
);

-- Populate standard 14 allergens
INSERT INTO public.allergens (name, icon) VALUES
('Gluten', '🌾'),
('Crustáceos', '🦐'),
('Huevos', '🥚'),
('Pescado', '🐟'),
('Cacahuetes', '🥜'),
('Soja', '🫘'),
('Leche', '🥛'),
('Frutos de cáscara', '🌰'),
('Apio', '🥬'),
('Mostaza', '🌭'),
('Sésamo', '🌱'),
('Sulfitos', '🍷'),
('Altramuces', '🌻'),
('Moluscos', '🦑')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;
