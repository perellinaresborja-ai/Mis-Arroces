-- 20260831000002_ingredient_master_and_aliases.sql

CREATE TABLE IF NOT EXISTS public.ingredient_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    alias_name TEXT NOT NULL,
    normalized_alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for aliases
ALTER TABLE public.ingredient_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aliases visible to everyone" ON public.ingredient_aliases FOR SELECT USING (true);
-- No insert/update for normal users

-- Clean previous manual seeded allergens (from the test) to avoid duplicate issues on re-seed, 
-- but DO NOT wipe ingredients so we don't break FKs. We will just upsert.
-- But since we used static UUIDs for the 5 ingredients, we can safely upsert them too.

-- We will insert a large catalog using a CTE to safely map allergens and aliases.

-- Let's create a robust catalog.
-- UUIDs generated for this catalog:
-- Bomba: b0000000-0000-0000-0000-000000000001
-- Senia: b0000000-0000-0000-0000-000000000002
-- Redondo: b0000000-0000-0000-0000-000000000003
-- Pollo: b0000000-0000-0000-0000-000000000004
-- Conejo: b0000000-0000-0000-0000-000000000005
-- Costilla: b0000000-0000-0000-0000-000000000006
-- Magro: b0000000-0000-0000-0000-000000000007
-- Pato: b0000000-0000-0000-0000-000000000008
-- Gamba Roja: b0000000-0000-0000-0000-000000000009
-- Gambon: 11111111-1111-1111-1111-111111111111 (Reusing test UUID)
-- Langostino: b0000000-0000-0000-0000-000000000010
-- Calamar: 44444444-4444-4444-4444-444444444444 (Reusing test UUID)
-- Sepia: b0000000-0000-0000-0000-000000000011
-- Mejillon: b0000000-0000-0000-0000-000000000012
-- Almeja: b0000000-0000-0000-0000-000000000013
-- Bajoqueta: b0000000-0000-0000-0000-000000000014
-- Garrofo: b0000000-0000-0000-0000-000000000015
-- Alcachofa: b0000000-0000-0000-0000-000000000016
-- Pimiento: b0000000-0000-0000-0000-000000000017
-- Tomate: b0000000-0000-0000-0000-000000000018
-- Ajo: b0000000-0000-0000-0000-000000000019
-- Garbanzos: b0000000-0000-0000-0000-000000000020
-- AOVE: 33333333-3333-3333-3333-333333333333 (Reusing test UUID)
-- Sal: 22222222-2222-2222-2222-222222222222 (Reusing test UUID)
-- Azafran: b0000000-0000-0000-0000-000000000021
-- Pimenton: b0000000-0000-0000-0000-000000000022
-- Caldo Pescado: b0000000-0000-0000-0000-000000000023
-- Caldo Pollo: b0000000-0000-0000-0000-000000000024
-- Salmorreta: 55555555-5555-5555-5555-555555555555 (Reusing test UUID)
-- Leche: b0000000-0000-0000-0000-000000000025
-- Salsa de soja: b0000000-0000-0000-0000-000000000026

INSERT INTO public.ingredients (id, canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, nutrition_complete, default_grams_per_unit) VALUES
('b0000000-0000-0000-0000-000000000001', 'Arroz Bomba', 'arroz bomba', 350, 7.5, 78, 0.2, 0.9, 0.2, 1.4, 0.01, true, 100),
('b0000000-0000-0000-0000-000000000002', 'Arroz Sénia', 'arroz senia', 348, 7.2, 77.5, 0.2, 1.0, 0.2, 1.3, 0.01, true, 100),
('b0000000-0000-0000-0000-000000000003', 'Arroz Redondo', 'arroz redondo', 349, 7.0, 78, 0.2, 0.9, 0.2, 1.3, 0.01, true, 100),
('b0000000-0000-0000-0000-000000000004', 'Pollo', 'pollo', 165, 31, 0, 0, 3.6, 1.0, 0, 0.18, true, 250),
('b0000000-0000-0000-0000-000000000005', 'Conejo', 'conejo', 136, 20.1, 0, 0, 6.2, 2.5, 0, 0.12, true, 200),
('b0000000-0000-0000-0000-000000000006', 'Costilla de Cerdo', 'costilla de cerdo', 277, 14.5, 0, 0, 24.3, 8.8, 0, 0.2, true, 150),
('b0000000-0000-0000-0000-000000000007', 'Magro de Cerdo', 'magro de cerdo', 143, 21.0, 0, 0, 6.0, 2.1, 0, 0.15, true, 150),
('b0000000-0000-0000-0000-000000000008', 'Pato', 'pato', 337, 19.0, 0, 0, 28.4, 9.7, 0, 0.16, true, 250),
('b0000000-0000-0000-0000-000000000009', 'Gamba Roja', 'gamba roja', 95, 20.1, 0, 0, 1.5, 0.3, 0, 1.2, true, 25),
('11111111-1111-1111-1111-111111111111', 'Gambón', 'gambon', 95, 20.1, 0, 0, 1.5, 0.3, 0, 1.2, true, 30),
('b0000000-0000-0000-0000-000000000010', 'Langostino', 'langostino', 90, 20.0, 0.5, 0, 0.8, 0.1, 0, 1.1, true, 25),
('44444444-4444-4444-4444-444444444444', 'Calamar', 'calamar', 79, 16.2, 0, 0, 1.4, 0.3, 0, 0.4, true, 150),
('b0000000-0000-0000-0000-000000000011', 'Sepia', 'sepia', 75, 16.1, 0.7, 0, 0.9, 0.1, 0, 0.9, true, 200),
('b0000000-0000-0000-0000-000000000012', 'Mejillón', 'mejillon', 86, 11.9, 3.7, 0, 2.7, 0.5, 0, 1.2, true, 20),
('b0000000-0000-0000-0000-000000000013', 'Almeja', 'almeja', 76, 15.6, 1.5, 0, 1.0, 0.1, 0, 1.5, true, 15),
('b0000000-0000-0000-0000-000000000014', 'Bajoqueta (Judía Verde)', 'bajoqueta', 31, 1.8, 4.3, 1.4, 0.2, 0.05, 2.7, 0.01, true, 10),
('b0000000-0000-0000-0000-000000000015', 'Garrofó', 'garrofo', 106, 7.3, 17.5, 1.0, 0.5, 0.1, 4.3, 0.01, true, 5),
('b0000000-0000-0000-0000-000000000016', 'Alcachofa', 'alcachofa', 47, 3.3, 10.5, 1.0, 0.15, 0.04, 5.4, 0.05, true, 100),
('b0000000-0000-0000-0000-000000000017', 'Pimiento', 'pimiento', 20, 0.9, 4.6, 2.4, 0.2, 0.05, 1.7, 0.01, true, 150),
('b0000000-0000-0000-0000-000000000018', 'Tomate', 'tomate', 18, 0.9, 3.9, 2.6, 0.2, 0.03, 1.2, 0.01, true, 100),
('b0000000-0000-0000-0000-000000000019', 'Ajo', 'ajo', 149, 6.4, 33.0, 1.0, 0.5, 0.1, 2.1, 0.02, true, 5),
('b0000000-0000-0000-0000-000000000020', 'Garbanzos', 'garbanzos', 364, 19.3, 60.6, 10.7, 6.0, 0.6, 17.4, 0.06, true, 1),
('33333333-3333-3333-3333-333333333333', 'Aceite de Oliva Virgen Extra', 'aceite de oliva virgen extra', 884, 0, 0, 0, 100, 14, 0, 0, true, 1),
('22222222-2222-2222-2222-222222222222', 'Sal', 'sal', 0, 0, 0, 0, 0, 0, 0, 100, true, 1),
('b0000000-0000-0000-0000-000000000021', 'Azafrán', 'azafran', 310, 11.4, 65.4, 0, 5.8, 1.6, 3.9, 0.4, true, 1),
('b0000000-0000-0000-0000-000000000022', 'Pimentón', 'pimenton', 282, 14.1, 53.9, 10.3, 12.9, 2.1, 34.9, 0.17, true, 1),
('b0000000-0000-0000-0000-000000000023', 'Caldo de Pescado', 'caldo de pescado', 15, 1.5, 1.0, 0.5, 0.5, 0.1, 0, 0.8, true, 1),
('b0000000-0000-0000-0000-000000000024', 'Caldo de Pollo', 'caldo de pollo', 12, 1.2, 0.8, 0.4, 0.4, 0.1, 0, 0.9, true, 1),
('55555555-5555-5555-5555-555555555555', 'Salmorreta', 'salmorreta', 150, 2, 8, 3, 12, 1.5, 2, 2.5, true, 1),
('b0000000-0000-0000-0000-000000000025', 'Leche', 'leche', 61, 3.2, 4.8, 4.8, 3.6, 2.4, 0, 0.1, true, 1),
('b0000000-0000-0000-0000-000000000026', 'Salsa de Soja', 'salsa de soja', 53, 8.0, 4.9, 0.4, 0.1, 0, 0.8, 16.4, true, 1)
ON CONFLICT (id) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  normalized_name = EXCLUDED.normalized_name,
  kcal_per_100 = EXCLUDED.kcal_per_100,
  protein_g_per_100 = EXCLUDED.protein_g_per_100,
  carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
  sugar_g_per_100 = EXCLUDED.sugar_g_per_100,
  fat_g_per_100 = EXCLUDED.fat_g_per_100,
  saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100,
  fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
  salt_g_per_100 = EXCLUDED.salt_g_per_100,
  nutrition_complete = EXCLUDED.nutrition_complete;

-- Map ALIASES
INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias) VALUES
('b0000000-0000-0000-0000-000000000001', 'Bomba', 'bomba'),
('b0000000-0000-0000-0000-000000000002', 'Senia', 'senia'),
('b0000000-0000-0000-0000-000000000002', 'Sénia', 'senia'),
('b0000000-0000-0000-0000-000000000003', 'Redondo', 'redondo'),
('b0000000-0000-0000-0000-000000000006', 'Costilla', 'costilla'),
('b0000000-0000-0000-0000-000000000007', 'Magro', 'magro'),
('b0000000-0000-0000-0000-000000000009', 'Gamba', 'gamba'),
('b0000000-0000-0000-0000-000000000009', 'Gambas', 'gambas'),
('11111111-1111-1111-1111-111111111111', 'Gambones', 'gambones'),
('44444444-4444-4444-4444-444444444444', 'Calamar mediano', 'calamar mediano'),
('44444444-4444-4444-4444-444444444444', 'Calamares', 'calamares'),
('b0000000-0000-0000-0000-000000000014', 'Judía Verde', 'judia verde'),
('b0000000-0000-0000-0000-000000000014', 'Judías Verdes', 'judias verdes'),
('b0000000-0000-0000-0000-000000000014', 'Ferraura', 'ferraura'),
('b0000000-0000-0000-0000-000000000015', 'Garrofon', 'garrofon'),
('b0000000-0000-0000-0000-000000000015', 'Garrofón', 'garrofon'),
('33333333-3333-3333-3333-333333333333', 'AOVE', 'aove'),
('33333333-3333-3333-3333-333333333333', 'Aceite de Oliva', 'aceite de oliva'),
('33333333-3333-3333-3333-333333333333', 'Aceite Oliva', 'aceite oliva'),
('33333333-3333-3333-3333-333333333333', 'Aceoite de oliva virgen extra', 'aceoite de oliva virgen extra'),
('b0000000-0000-0000-0000-000000000020', 'Garbanzo', 'garbanzo'),
('b0000000-0000-0000-0000-000000000023', 'Fumet', 'fumet')
ON CONFLICT (normalized_alias) DO NOTHING;

-- ALLERGENS (We assume allergens table has names 'Crustáceos', 'Moluscos', 'Leche', 'Soja', 'Gluten', 'Pescado' etc)
DO $$
DECLARE
  crustaceos UUID := (SELECT id FROM allergens WHERE name = 'Crustáceos' LIMIT 1);
  moluscos UUID := (SELECT id FROM allergens WHERE name = 'Moluscos' LIMIT 1);
  leche UUID := (SELECT id FROM allergens WHERE name = 'Leche' LIMIT 1);
  soja UUID := (SELECT id FROM allergens WHERE name = 'Soja' LIMIT 1);
  gluten UUID := (SELECT id FROM allergens WHERE name = 'Gluten' LIMIT 1);
  pescado UUID := (SELECT id FROM allergens WHERE name = 'Pescado' LIMIT 1);
BEGIN
  IF crustaceos IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('b0000000-0000-0000-0000-000000000009', crustaceos), -- Gamba Roja
    ('11111111-1111-1111-1111-111111111111', crustaceos), -- Gambon
    ('b0000000-0000-0000-0000-000000000010', crustaceos)  -- Langostino
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF moluscos IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('44444444-4444-4444-4444-444444444444', moluscos), -- Calamar
    ('b0000000-0000-0000-0000-000000000011', moluscos), -- Sepia
    ('b0000000-0000-0000-0000-000000000012', moluscos), -- Mejillon
    ('b0000000-0000-0000-0000-000000000013', moluscos)  -- Almeja
    ON CONFLICT DO NOTHING;
  END IF;

  IF pescado IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('b0000000-0000-0000-0000-000000000023', pescado) -- Caldo Pescado
    ON CONFLICT DO NOTHING;
  END IF;

  IF leche IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('b0000000-0000-0000-0000-000000000025', leche) -- Leche
    ON CONFLICT DO NOTHING;
  END IF;

  IF soja IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('b0000000-0000-0000-0000-000000000026', soja) -- Salsa de Soja
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF gluten IS NOT NULL THEN
    INSERT INTO ingredient_allergens (ingredient_id, allergen_id) VALUES
    ('b0000000-0000-0000-0000-000000000026', gluten) -- Salsa de soja (usually has wheat)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
