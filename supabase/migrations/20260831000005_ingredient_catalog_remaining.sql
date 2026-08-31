BEGIN;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pez de San Pedro', 'pez de san pedro', 90, 18, 0,
    0, 2, 0.5, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gallo san pedro', 'gallo san pedro')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gall', 'gall')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'martiño', 'martino')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pez Ballesta', 'pez ballesta', 85, 18, 0,
    0, 1.5, 0.3, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gallo cochino', 'gallo cochino')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'peje', 'peje')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Besugo', 'besugo', 95, 17, 0,
    0, 3, 0.7, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'besugos', 'besugos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'goraz', 'goraz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Aligote', 'aligote', 90, 17, 0,
    0, 2, 0.5, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aligotes', 'aligotes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'besugo blanco', 'besugo blanco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Chopa', 'chopa', 95, 17, 0,
    0, 3, 0.7, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chopas', 'chopas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Rubio', 'rubio', 80, 18, 0,
    0, 1, 0.2, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rubios', 'rubios')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aretes', 'aretes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Capellán', 'capellan', 80, 17, 0,
    0, 1.5, 0.3, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'capellanes', 'capellanes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mollera', 'mollera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Palometa', 'palometa', 120, 19, 0,
    0, 5, 1.2, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'palometas', 'palometas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'castañeta', 'castaneta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Morena', 'morena', 130, 18, 0,
    0, 6, 1.5, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'morenas', 'morenas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pez Sapo', 'pez sapo', 65, 14, 0,
    0, 0.9, 0.2, 0, 0.4,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'sapo', 'sapo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Herrera', 'herrera', 90, 18, 0,
    0, 2, 0.5, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'herreras', 'herreras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mabre', 'mabre')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Sargo Picudo', 'sargo picudo', 95, 17, 0,
    0, 3, 0.7, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Corva', 'corva', 100, 18, 0,
    0, 3, 0.8, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'corvas', 'corvas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Dorado', 'dorado', 110, 19, 0,
    0, 3.5, 0.8, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'dorados', 'dorados')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mahi mahi', 'mahi mahi')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'llampuga', 'llampuga')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Peto', 'peto', 130, 21, 0,
    0, 5, 1.2, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'petos', 'petos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Espadín', 'espadin', 140, 18, 0,
    0, 7, 2, 0, 0.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'espadines', 'espadines')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Sardina Ahumada', 'sardina ahumada', 150, 19, 0,
    0, 8, 2.5, 0, 2.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'sardinas ahumadas', 'sardinas ahumadas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Trucha Ahumada', 'trucha ahumada', 150, 20, 0,
    0, 7, 1.5, 0, 2.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'truchas ahumadas', 'truchas ahumadas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Bacalao Fresco', 'bacalao fresco', 77, 17, 0,
    0, 0.8, 0.1, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bacalao skrei', 'bacalao skrei')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Maruca', 'maruca', 80, 18, 0,
    0, 1, 0.2, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'marucas', 'marucas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mújol de Estero', 'mujol de estero', 120, 19, 0,
    0, 4.5, 1, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'lisa de estero', 'lisa de estero')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Esturión', 'esturion', 105, 16, 0,
    0, 4, 1, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cazón en Adobo', 'cazon en adobo', 150, 15, 10,
    0, 5, 1, 0, 1.5,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bienmesabe andaluz', 'bienmesabe andaluz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cazon adobado', 'cazon adobado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pintarroja', 'pintarroja', 85, 18, 0,
    0, 1.5, 0.3, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gatos', 'gatos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bocanegra', 'bocanegra')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Almeja Fina', 'almeja fina', 76, 15.6, 1.5,
    0, 1, 0.1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'almejas finas', 'almejas finas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Almeja Japónica', 'almeja japonica', 75, 15.6, 1.5,
    0, 1, 0.1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'almejas japonicas', 'almejas japonicas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Almeja Babosa', 'almeja babosa', 76, 15, 1.5,
    0, 1, 0.1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'almejas babosas', 'almejas babosas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Chirla', 'chirla', 76, 15, 1.5,
    0, 1, 0.1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chirlas', 'chirlas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pechina', 'pechina', 76, 15, 1.5,
    0, 1, 0.1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pechinas', 'pechinas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Erizo de Mar', 'erizo de mar', 120, 16, 3,
    0, 5, 1, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'erizos de mar', 'erizos de mar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'garotas', 'garotas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Ortiguilla', 'ortiguilla', 90, 10, 10,
    0, 2, 0.5, 0, 1.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'anemona', 'anemona')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ortiguillas de mar', 'ortiguillas de mar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Espardeña', 'espardena', 80, 15, 0,
    0, 2, 0.5, 0, 1.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pepino de mar', 'pepino de mar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'espardenya', 'espardenya')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Santiaguiño', 'santiaguino', 95, 19, 0,
    0, 2, 0.5, 0, 1.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'santiaguiños', 'santiaguinos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cigala de Tronco', 'cigala de tronco', 85, 17.7, 0,
    0, 1.6, 0.3, 0, 1.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cigalas grandes', 'cigalas grandes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Quisquilla de Motril', 'quisquilla de motril', 95, 20, 0,
    0, 1.5, 0.3, 0, 1.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'quisquilla motril', 'quisquilla motril')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Camarón Porrero', 'camaron porrero', 95, 20, 0,
    0, 1.5, 0.3, 0, 1.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'camarones porreros', 'camarones porreros')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Bígaro Cocido', 'bigaro cocido', 90, 18, 1,
    0, 1.5, 0.3, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caracolillos cocidos', 'caracolillos cocidos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cañaílla Cocida', 'canailla cocida', 90, 18, 1,
    0, 1.5, 0.3, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cañaillas cocidas', 'canaillas cocidas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cangrejo Rojo', 'cangrejo rojo', 87, 18, 0,
    0, 1.5, 0.2, 0, 1.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cangrejo de rio', 'cangrejo de rio')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Zamburiña', 'zamburina', 88, 16, 3,
    0, 1, 0.2, 0, 0.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zamburiñas gallegas', 'zamburinas gallegas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pota Voladora', 'pota voladora', 75, 16, 0.7,
    0, 0.9, 0.1, 0, 0.9,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'voladores', 'voladores')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'potas', 'potas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pulpo Seco', 'pulpo seco', 250, 50, 5,
    0, 3, 0.5, 0, 4.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pulpo sec', 'pulpo sec')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'polp sec', 'polp sec')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Vaca Vieja', 'vaca vieja', 250, 20, 0,
    0, 18, 7, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'lomo vaca vieja', 'lomo vaca vieja')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chuleton de vaca', 'chuleton de vaca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Buey', 'buey', 260, 21, 0,
    0, 19, 8, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne de buey', 'carne de buey')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chuleton de buey', 'chuleton de buey')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Lomo Embuchado', 'lomo embuchado', 300, 32, 0,
    0, 18, 6, 0, 3.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'lomo iberico embuchado', 'lomo iberico embuchado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Salchichón Ibérico', 'salchichon iberico', 420, 25, 2,
    1, 35, 13, 0, 3.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Chorizo Ibérico', 'chorizo iberico', 450, 24, 2,
    1, 38, 14, 0, 3.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chorizo cular', 'chorizo cular')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Morcilla Patatera', 'morcilla patatera', 400, 10, 15,
    2, 35, 12, 2, 2.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'patatera', 'patatera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'morcilla de patata', 'morcilla de patata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Botillo', 'botillo', 380, 18, 1,
    0, 34, 12, 0, 2.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'botillo del bierzo', 'botillo del bierzo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Compango', 'compango', 400, 15, 2,
    1, 35, 12, 0, 3.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'compango asturiano', 'compango asturiano')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tocino Ibérico', 'tocino iberico', 750, 4, 0,
    0, 80, 32, 0, 2.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tocino', 'tocino')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tocino salado', 'tocino salado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Papada de Cerdo', 'papada de cerdo', 600, 8, 0,
    0, 65, 25, 0, 1.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'papada', 'papada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'papada iberica', 'papada iberica')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Manteca Colorá', 'manteca colora', 850, 1, 0,
    0, 95, 38, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'manteca colorada', 'manteca colorada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pringá', 'pringa', 350, 15, 2,
    0, 32, 12, 0, 2.0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pringada', 'pringada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Costilla de Ternera', 'costilla de ternera', 250, 18, 0,
    0, 19, 8, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'churrasco de ternera', 'churrasco de ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'asado de tira', 'asado de tira')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Entraña', 'entrana', 210, 19, 0,
    0, 15, 6, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'entraña de ternera', 'entrana de ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Vacío', 'vacio', 190, 21, 0,
    0, 12, 5, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vacio de ternera', 'vacio de ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Matambre', 'matambre', 200, 20, 0,
    0, 13, 5, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'matambre de ternera', 'matambre de ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Picantón', 'picanton', 150, 20, 0,
    0, 7, 2, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pollos picantones', 'pollos picantones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'coquelet', 'coquelet')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pollo de Corral', 'pollo de corral', 160, 21, 0,
    0, 8, 2.5, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pollo campero', 'pollo campero')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pichón', 'pichon', 140, 22, 0,
    0, 5, 1.5, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pichones', 'pichones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'paloma', 'paloma')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Codorniz Salvaje', 'codorniz salvaje', 130, 22, 0,
    0, 4, 1.2, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'codornices salvajes', 'codornices salvajes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Faisán', 'faisan', 135, 23, 0,
    0, 4.5, 1.3, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'faisanes', 'faisanes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Liebre', 'liebre', 114, 22, 0,
    0, 2.5, 0.8, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'liebres', 'liebres')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Jabalí', 'jabali', 122, 21, 0,
    0, 3.5, 1.1, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne de jabali', 'carne de jabali')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Venado', 'venado', 120, 22, 0,
    0, 3, 1.0, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ciervo', 'ciervo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne de ciervo', 'carne de ciervo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tomate Raf', 'tomate raf', 18, 0.9, 3.9,
    2.6, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomates raf', 'tomates raf')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tomate Rosa', 'tomate rosa', 18, 0.9, 3.9,
    2.6, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomate rosa de barbastro', 'tomate rosa de barbastro')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tomate de Colgar', 'tomate de colgar', 18, 0.9, 3.9,
    2.6, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomates de colgar', 'tomates de colgar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomata de penjar', 'tomata de penjar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tomate Corazón de Buey', 'tomate corazon de buey', 18, 0.9, 3.9,
    2.6, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'corazon de buey', 'corazon de buey')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tomate Muchamiel', 'tomate muchamiel', 18, 0.9, 3.9,
    2.6, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomates muchamiel', 'tomates muchamiel')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pimiento Italiano', 'pimiento italiano', 20, 1.0, 4.5,
    2.5, 0.2, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimientos italianos', 'pimientos italianos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pimiento Choricero', 'pimiento choricero', 30, 1.5, 5.5,
    3, 0.3, 0, 2, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimientos choriceros', 'pimientos choriceros')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pulpa de choricero', 'pulpa de choricero')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pimiento Romesco', 'pimiento romesco', 30, 1.5, 5.5,
    3, 0.3, 0, 2, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimientos romesco', 'pimientos romesco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pimiento Trompa de Vaca', 'pimiento trompa de vaca', 25, 1, 5,
    2.5, 0.2, 0, 1.8, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'trompa de vaca', 'trompa de vaca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cebolla de Figueras', 'cebolla de figueras', 40, 1, 9,
    4, 0.1, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cebolla figueras', 'cebolla figueras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cebolla de Fuentes', 'cebolla de fuentes', 35, 1, 8,
    4.5, 0.1, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cebolla fuentes de ebro', 'cebolla fuentes de ebro')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cebolla Dulce', 'cebolla dulce', 35, 1, 8,
    4.5, 0.1, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cebollas dulces', 'cebollas dulces')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Berenjena Blanca', 'berenjena blanca', 25, 1, 6,
    3, 0.2, 0, 3, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'berenjenas blancas', 'berenjenas blancas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Berenjena Listada', 'berenjena listada', 25, 1, 6,
    3, 0.2, 0, 3, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'berenjena rayada', 'berenjena rayada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Calabacín Blanco', 'calabacin blanco', 15, 1, 3,
    2, 0.2, 0, 1, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'calabacines blancos', 'calabacines blancos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Calabacín Luna', 'calabacin luna', 15, 1, 3,
    2, 0.2, 0, 1, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'calabacin redondo', 'calabacin redondo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Calabaza Potimarron', 'calabaza potimarron', 30, 1, 7,
    3, 0.2, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'potimarron', 'potimarron')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Calabaza Cacahuete', 'calabaza cacahuete', 25, 1, 6,
    2.5, 0.2, 0, 1.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'calabaza butternut', 'calabaza butternut')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Calabaza Cabello de Ángel', 'calabaza cabello de angel', 35, 1, 8,
    4, 0.2, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cabello de angel', 'cabello de angel')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Patata Agria', 'patata agria', 80, 2, 18,
    1, 0.1, 0, 2.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'patatas agrias', 'patatas agrias')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Patata Monalisa', 'patata monalisa', 75, 2, 17,
    1, 0.1, 0, 2.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'patatas monalisa', 'patatas monalisa')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Patata Kennebec', 'patata kennebec', 77, 2, 17.5,
    1, 0.1, 0, 2.3, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'patatas kennebec', 'patatas kennebec')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Patata Spunta', 'patata spunta', 75, 2, 17,
    1, 0.1, 0, 2.2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'patatas spunta', 'patatas spunta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Yuca', 'yuca', 160, 1.4, 38,
    1.7, 0.3, 0, 1.8, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mandioca', 'mandioca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'casava', 'casava')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Ñame', 'name', 118, 1.5, 28,
    0.5, 0.2, 0, 4.1, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'yam', 'yam')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Colinabo', 'colinabo', 27, 1.5, 6.2,
    2.6, 0.1, 0, 3.6, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rutabaga', 'rutabaga')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Trompeta de los Muertos', 'trompeta de los muertos', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'trompetas de la muerte', 'trompetas de la muerte')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Senderuela', 'senderuela', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'senderuelas', 'senderuelas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carrerilla', 'carrerilla')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Amanita Cesárea', 'amanita cesarea', 22, 3, 2,
    1, 0.3, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ou de reig', 'ou de reig')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'amanitas', 'amanitas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Perrechico', 'perrechico', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'perretxiko', 'perretxiko')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'seta de san jorge', 'seta de san jorge')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Carbonera', 'carbonera', 22, 3, 2,
    1, 0.3, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carboneras', 'carboneras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Angula de Monte', 'angula de monte', 22, 3, 2,
    1, 0.3, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'angulas de monte', 'angulas de monte')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Colmenilla', 'colmenilla', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'colmenillas', 'colmenillas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'morchella', 'morchella')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Rebozuelo', 'rebozuelo', 22, 3, 2,
    1, 0.3, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rebozuelos', 'rebozuelos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rossinyol', 'rossinyol')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Setas de Cardo', 'setas de cardo', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'seta de cardo', 'seta de cardo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Gírgola', 'girgola', 25, 3, 3,
    1, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'girgolas', 'girgolas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'seta de ostra', 'seta de ostra')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Alubia Tolosana', 'alubia tolosana', 340, 21, 62,
    2, 1.5, 0.2, 15, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'alubias de tolosa', 'alubias de tolosa')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Alubia Canela', 'alubia canela', 345, 21, 63,
    2, 1.5, 0.2, 15, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'alubias canela', 'alubias canela')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Alubia Verdina', 'alubia verdina', 340, 21, 62,
    2, 1.5, 0.2, 15, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'verdinas', 'verdinas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Garbanzo Pedrosillano', 'garbanzo pedrosillano', 364, 19, 60,
    10, 6, 0.6, 17, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'garbanzos pedrosillanos', 'garbanzos pedrosillanos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Garbanzo Lechoso', 'garbanzo lechoso', 360, 19, 59,
    10, 6, 0.6, 17, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'garbanzos lechosos', 'garbanzos lechosos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Harina de Garbanzo', 'harina de garbanzo', 387, 22, 58,
    10, 6, 0.6, 10, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'harina garbanzo', 'harina garbanzo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Harina de Arroz', 'harina de arroz', 366, 6, 80,
    0.1, 1.4, 0.4, 2.4, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'harina arroz', 'harina arroz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Copos de Maíz', 'copos de maiz', 357, 8, 84,
    1, 0.4, 0.1, 3, 0.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'corn flakes', 'corn flakes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'copos maiz', 'copos maiz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Amaranto', 'amaranto', 371, 14, 65,
    1.7, 7, 1.5, 6.7, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Sarraceno', 'sarraceno', 343, 13, 71,
    0, 3.4, 0.7, 10, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'trigo sarraceno', 'trigo sarraceno')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'alforfon', 'alforfon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Espelta', 'espelta', 338, 14, 70,
    6.8, 2.4, 0.4, 10, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'grano de espelta', 'grano de espelta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Centeno', 'centeno', 338, 10, 75,
    1, 1.6, 0.2, 15, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'grano de centeno', 'grano de centeno')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cebada', 'cebada', 354, 12, 73,
    0.8, 2.3, 0.5, 17, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'grano de cebada', 'grano de cebada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Bulgur', 'bulgur', 342, 12, 75,
    0.4, 1.3, 0.2, 18, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Fideos de Arroz', 'fideos de arroz', 364, 3.5, 80,
    0, 0.5, 0, 1, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fideo de arroz', 'fideo de arroz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tallarines de arroz', 'tallarines de arroz')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Gnocchi', 'gnocchi', 150, 3.5, 32,
    0.5, 0.5, 0, 1.5, 0.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ñoquis', 'noquis')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pan de Molde', 'pan de molde', 260, 8, 45,
    4, 3.5, 0.8, 3, 1.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pan ingles', 'pan ingles')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pan de sandwich', 'pan de sandwich')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Panko', 'panko', 395, 13, 75,
    5, 4, 1, 4, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Gluten'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pan rallado japones', 'pan rallado japones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Idiazábal', 'queso idiazabal', 420, 25, 0.5,
    0.5, 35, 23, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'idiazabal', 'idiazabal')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Tetilla', 'queso tetilla', 350, 21, 1,
    1, 28, 18, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tetilla', 'tetilla')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Mahón', 'queso mahon', 390, 25, 0.5,
    0.5, 32, 21, 0, 2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mahon', 'mahon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Cabrales', 'queso cabrales', 390, 21, 1,
    1, 33, 22, 0, 3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cabrales', 'cabrales')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Brie', 'queso brie', 334, 20, 0.5,
    0.5, 27, 17, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'brie', 'brie')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Camembert', 'queso camembert', 300, 19, 0.5,
    0.5, 24, 15, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'camembert', 'camembert')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Feta', 'queso feta', 264, 14, 4,
    4, 21, 15, 0, 2.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'feta', 'feta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Provolone', 'queso provolone', 351, 25, 2,
    0.5, 26, 17, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'provolone', 'provolone')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Gouda', 'queso gouda', 356, 24, 2,
    0, 27, 17, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gouda', 'gouda')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Queso Edam', 'queso edam', 357, 25, 1,
    0, 27, 17, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'edam', 'edam')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'queso de bola', 'queso de bola')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Requesón', 'requeson', 174, 11, 3,
    3, 13, 8, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ricotta', 'ricotta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Yogur Griego', 'yogur griego', 133, 4.5, 4,
    4, 11, 7, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Kéfir', 'kefir', 65, 3.5, 4.5,
    4.5, 3.5, 2, 0, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Leche Evaporada', 'leche evaporada', 134, 6, 10,
    10, 7, 4.5, 0, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'leche ideal', 'leche ideal')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Leche Condensada', 'leche condensada', 321, 8, 54,
    54, 8, 5, 0, 0.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mantequilla Clarificada', 'mantequilla clarificada', 898, 0, 0,
    0, 99.5, 62, 0, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Leche'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ghee', 'ghee')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Huevo de Pato', 'huevo de pato', 185, 12, 1.4,
    0, 13, 3.6, 0, 0.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Huevos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'huevos de pato', 'huevos de pato')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Huevo de Oca', 'huevo de oca', 185, 13.9, 1.3,
    0, 13.2, 3.6, 0, 0.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Huevos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'huevos de oca', 'huevos de oca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Curry en Polvo', 'curry en polvo', 325, 14, 58,
    2, 14, 2, 53, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Mostaza'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'curry', 'curry')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cúrcuma', 'curcuma', 312, 9.6, 67,
    3, 3.2, 1, 22, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Jengibre en Polvo', 'jengibre en polvo', 335, 8.9, 71,
    3, 4.2, 1, 14, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'jengibre molido', 'jengibre molido')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Jengibre Fresco', 'jengibre fresco', 80, 1.8, 17,
    1.7, 0.7, 0.2, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'raiz de jengibre', 'raiz de jengibre')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cardamomo', 'cardamomo', 311, 10, 68,
    0, 6, 0.6, 28, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cardamomo molido', 'cardamomo molido')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pimentón Ahumado', 'pimenton ahumado', 282, 14, 19,
    10, 12, 2, 34, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimenton de la vera', 'pimenton de la vera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cebolla en Polvo', 'cebolla en polvo', 341, 10, 79,
    9, 1, 0.1, 15, 0.2,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cebolla granulada', 'cebolla granulada')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Ajo en Polvo', 'ajo en polvo', 331, 16, 72,
    2, 0.7, 0.1, 9, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ajo granulado', 'ajo granulado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Salsa de Soja', 'salsa de soja', 53, 8, 4.9,
    0.4, 0.5, 0, 0.8, 16,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Soja'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'salsa soja', 'salsa soja')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'shoyu', 'shoyu')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Salsa Teriyaki', 'salsa teriyaki', 89, 5.9, 15,
    14, 0, 0, 0, 3.8,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Soja'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'teriyaki', 'teriyaki')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Salsa Ostra', 'salsa ostra', 51, 1.5, 11,
    8, 0.2, 0, 0.5, 6.8,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'salsa de ostras', 'salsa de ostras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Pasta Miso', 'pasta miso', 198, 11, 25,
    6, 6, 1, 5, 3.7,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Soja'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'miso blanco', 'miso blanco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'miso rojo', 'miso rojo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Aceite de Cacahuete', 'aceite de cacahuete', 884, 0, 0,
    0, 100, 17, 0, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Cacahuetes'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aceite de mani', 'aceite de mani')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Aceite de Aguacate', 'aceite de aguacate', 884, 0, 0,
    0, 100, 11, 0, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aceite aguacate', 'aceite aguacate')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Aceite de Nuez', 'aceite de nuez', 884, 0, 0,
    0, 100, 9, 0, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Frutos de cáscara'
  ON CONFLICT DO NOTHING;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Garam Masala', 'garam masala', 379, 12, 68,
    0, 14, 1, 32, 0.1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Tajín', 'tajin', 150, 2, 35,
    2, 2, 0.5, 5, 19,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Harissa', 'harissa', 280, 4, 15,
    4, 25, 3, 6, 2,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'salsa harissa', 'salsa harissa')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Kimchi', 'kimchi', 15, 1.1, 2.4,
    1, 0.5, 0.1, 1.6, 1.3,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'col fermentada kimchi', 'col fermentada kimchi')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Melocotón', 'melocoton', 39, 0.9, 9.5,
    8.3, 0.2, 0, 1.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'melocotones', 'melocotones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'durazno', 'durazno')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Albaricoque', 'albaricoque', 48, 1.4, 11,
    9, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'albaricoques', 'albaricoques')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Ciruela', 'ciruela', 46, 0.7, 11,
    9, 0.2, 0, 1.4, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ciruelas', 'ciruelas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Cereza', 'cereza', 50, 1, 12,
    8, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cerezas', 'cerezas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'picotas', 'picotas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Fresa', 'fresa', 32, 0.6, 7.6,
    4.9, 0.3, 0, 2, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fresas', 'fresas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fresones', 'fresones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Frambuesa', 'frambuesa', 52, 1.2, 11,
    4.4, 0.6, 0, 6.5, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'frambuesas', 'frambuesas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Arándano', 'arandano', 57, 0.7, 14,
    9, 0.3, 0, 2.4, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'arandanos', 'arandanos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mirtilos', 'mirtilos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mora', 'mora', 43, 1.3, 9,
    4, 0.5, 0, 5.3, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'moras', 'moras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Piña', 'pina', 50, 0.5, 13,
    9, 0.1, 0, 1.4, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'piña fresca', 'pina fresca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ananás', 'ananas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mango', 'mango', 60, 0.8, 15,
    13, 0.3, 0, 1.6, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mangos', 'mangos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Papaya', 'papaya', 43, 0.4, 10,
    7, 0.2, 0, 1.7, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'papayas', 'papayas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Coco', 'coco', 354, 3.3, 15,
    6, 33, 29, 9, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'coco rallado', 'coco rallado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pulpa de coco', 'pulpa de coco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Leche de Coco', 'leche de coco', 197, 2, 2.8,
    1.5, 21, 19, 0, 0,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'crema de coco', 'crema de coco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Anchoas en Salazón', 'anchoas en salazon', 210, 28, 0,
    0, 10, 2, 0, 14,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'anchoas', 'anchoas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'boqueron en salazon', 'boqueron en salazon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Sardinas en Lata', 'sardinas en lata', 208, 24, 0,
    0, 11, 2, 0, 1,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'sardinas lata', 'sardinas lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Atún en Lata', 'atun en lata', 116, 26, 0,
    0, 1, 0.2, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'atun claro', 'atun claro')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'atun lata', 'atun lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Caballa en Lata', 'caballa en lata', 189, 23, 0,
    0, 10, 2.5, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caballa lata', 'caballa lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mejillones en Escabeche', 'mejillones en escabeche', 180, 15, 2,
    1, 12, 2, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mejillones lata', 'mejillones lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'escabeche de mejillon', 'escabeche de mejillon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Berberechos en Lata', 'berberechos en lata', 79, 14, 4,
    0, 0.5, 0, 0, 1.5,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'berberechos lata', 'berberechos lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Zamburiñas en Salsa', 'zamburinas en salsa', 150, 12, 5,
    2, 9, 1.5, 0, 1.5,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Moluscos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zamburiñas lata', 'zamburinas lata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Fumet de Gamba', 'fumet de gamba', 20, 2, 1,
    0.5, 0.5, 0.1, 0, 0.8,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Crustáceos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caldo de gambas', 'caldo de gambas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Fumet Rojo', 'fumet rojo', 25, 2, 2,
    1, 1, 0.2, 0, 1,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Pescado'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fumet de roca', 'fumet de roca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caldo rojo', 'caldo rojo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Caldo de Cocido', 'caldo de cocido', 25, 2.5, 1,
    0.5, 1, 0.4, 0, 1,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caldo de puchero', 'caldo de puchero')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Colorante con Azafrán', 'colorante con azafran', 10, 0, 2,
    0, 0, 0, 0, 1,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'sazonador paella', 'sazonador paella')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'preparado paella', 'preparado paella')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Paellero Carmencita', 'paellero carmencita', 310, 10, 60,
    5, 5, 1, 15, 5,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carmencita', 'carmencita')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'sazonador', 'sazonador')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Bovril', 'bovril', 242, 38, 20,
    2, 1, 0.5, 0, 11,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'extracto de carne', 'extracto de carne')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'concentrado de buey', 'concentrado de buey')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Marmite', 'marmite', 260, 34, 30,
    1, 0.1, 0, 0, 10,
    true, 'USDA / FEN Generics', 'REFERENCE'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'extracto de levadura', 'extracto de levadura')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Salsa Romesco', 'salsa romesco', 400, 5, 15,
    5, 35, 5, 4, 1.5,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id)
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Frutos de cáscara'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'romesco', 'romesco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'salsa calçots', 'salsa calcots')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;


DO $$
DECLARE
  v_ing_id UUID;
BEGIN
  INSERT INTO public.ingredients (
    canonical_name, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, 
    sugar_g_per_100, fat_g_per_100, saturated_fat_g_per_100, fiber_g_per_100, salt_g_per_100, 
    nutrition_complete, nutrition_source, nutrition_quality
  ) VALUES (
    'Mojo Picón', 'mojo picon', 450, 3, 10,
    2, 45, 7, 3, 2,
    true, 'USDA / FEN Generics', 'ESTIMATED'
  )
  ON CONFLICT (normalized_name) DO UPDATE SET
    canonical_name = EXCLUDED.canonical_name, kcal_per_100 = EXCLUDED.kcal_per_100,
    protein_g_per_100 = EXCLUDED.protein_g_per_100, carbs_g_per_100 = EXCLUDED.carbs_g_per_100,
    sugar_g_per_100 = EXCLUDED.sugar_g_per_100, fat_g_per_100 = EXCLUDED.fat_g_per_100,
    saturated_fat_g_per_100 = EXCLUDED.saturated_fat_g_per_100, fiber_g_per_100 = EXCLUDED.fiber_g_per_100,
    salt_g_per_100 = EXCLUDED.salt_g_per_100, nutrition_quality = EXCLUDED.nutrition_quality
  RETURNING id INTO v_ing_id;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mojo rojo', 'mojo rojo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mojo canario', 'mojo canario')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;

COMMIT;
