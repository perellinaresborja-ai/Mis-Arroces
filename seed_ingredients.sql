-- 1. Insert ingredients
INSERT INTO public.ingredients (id, canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, nutrition_complete, default_grams_per_unit) VALUES
('11111111-1111-1111-1111-111111111111', 'Gambón', 'gambon', 95, 20.1, 0, 0, 1.5, 0.3, 0, 1.2, true, 25),
('22222222-2222-2222-2222-222222222222', 'Sal', 'sal', 0, 0, 0, 0, 0, 0, 0, 100, true, 1),
('33333333-3333-3333-3333-333333333333', 'Aceite de Oliva Virgen Extra', 'aceite_de_oliva_virgen_extra', 884, 0, 0, 0, 100, 14, 0, 0, true, 1),
('44444444-4444-4444-4444-444444444444', 'Calamar', 'calamar', 79, 16.2, 0, 0, 1.4, 0.3, 0, 0.4, true, 150),
('55555555-5555-5555-5555-555555555555', 'Salmorreta', 'salmorreta', 150, 2, 8, 3, 12, 1.5, 2, 2.5, true, 1);

-- 2. Map allergens
-- Crustáceos = 647fa0cc-1548-46af-ba07-7fe34b04667a
-- Moluscos = 6e5494f9-a234-46b2-ab59-61a0ceabaef4
INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id) VALUES
('11111111-1111-1111-1111-111111111111', '647fa0cc-1548-46af-ba07-7fe34b04667a'),
('44444444-4444-4444-4444-444444444444', '6e5494f9-a234-46b2-ab59-61a0ceabaef4');

-- 3. Update recipe_ingredients to point to canonical_ingredient_id
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '11111111-1111-1111-1111-111111111111' WHERE recipe_id = 'ba662fc3-a913-48f5-90b7-59423f32688d' AND display_text ILIKE '%gamb%';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '22222222-2222-2222-2222-222222222222' WHERE recipe_id = 'ba662fc3-a913-48f5-90b7-59423f32688d' AND display_text ILIKE '%sal%' AND display_text NOT ILIKE '%salmorreta%';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '33333333-3333-3333-3333-333333333333' WHERE recipe_id = 'ba662fc3-a913-48f5-90b7-59423f32688d' AND display_text ILIKE '%aceite%';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '44444444-4444-4444-4444-444444444444' WHERE recipe_id = 'ba662fc3-a913-48f5-90b7-59423f32688d' AND display_text ILIKE '%calamar%';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '55555555-5555-5555-5555-555555555555' WHERE recipe_id = 'ba662fc3-a913-48f5-90b7-59423f32688d' AND display_text ILIKE '%salmorreta%';
