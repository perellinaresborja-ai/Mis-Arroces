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
    'Dentón', 'denton', 90, 18.5, 0,
    0, 1.7, 0.3, 0, 0.2,
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
  VALUES (v_ing_id, 'dentol', 'dentol')
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
    'Sargo', 'sargo', 95, 17, 0,
    0, 3.0, 0.7, 0, 0.2,
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
  VALUES (v_ing_id, 'sargos', 'sargos')
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
    'Mero', 'mero', 92, 19, 0,
    0, 1.8, 0.4, 0, 0.1,
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
  VALUES (v_ing_id, 'meros', 'meros')
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
    'Corvina', 'corvina', 104, 17.8, 0,
    0, 3.7, 1.0, 0, 0.1,
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
  VALUES (v_ing_id, 'corvinas', 'corvinas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'reig', 'reig')
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
    'Pargo', 'pargo', 90, 18, 0,
    0, 2.0, 0.5, 0, 0.2,
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
  VALUES (v_ing_id, 'pargos', 'pargos')
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
    'Raya', 'raya', 73, 15.5, 0,
    0, 0.9, 0.2, 0, 0.3,
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
  VALUES (v_ing_id, 'rayas', 'rayas')
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
    'Cabracho', 'cabracho', 91, 19, 0,
    0, 1.7, 0.4, 0, 0.1,
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
  VALUES (v_ing_id, 'escórpora', 'escorpora')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'escorpora', 'escorpora')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gallineta', 'gallineta')
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
    'Gallo', 'gallo', 76, 16, 0,
    0, 1.3, 0.3, 0, 0.2,
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
  VALUES (v_ing_id, 'gallos', 'gallos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'llendera', 'llendera')
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
    'Lenguado', 'lenguado', 85, 18.8, 0,
    0, 1.1, 0.2, 0, 0.2,
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
  VALUES (v_ing_id, 'lenguados', 'lenguados')
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
    'Pez Espada', 'pez espada', 121, 19.8, 0,
    0, 4.5, 1.2, 0, 0.2,
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
  VALUES (v_ing_id, 'emperador', 'emperador')
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
    'Salmón', 'salmon', 208, 20, 0,
    0, 13, 3.1, 0, 0.1,
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
  VALUES (v_ing_id, 'salmones', 'salmones')
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
    'Trucha', 'trucha', 141, 19.9, 0,
    0, 6.8, 1.2, 0, 0.1,
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
  VALUES (v_ing_id, 'truchas', 'truchas')
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
    'Anguila', 'anguila', 281, 15, 0,
    0, 24.5, 4.5, 0, 0.2,
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
  VALUES (v_ing_id, 'anguilas', 'anguilas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'all i pebre', 'all i pebre')
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
    'Angula', 'angula', 281, 15, 0,
    0, 24.5, 4.5, 0, 0.2,
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
  VALUES (v_ing_id, 'angulas', 'angulas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gula', 'gula')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gulas', 'gulas')
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
    'Bacaladilla', 'bacaladilla', 79, 17, 0,
    0, 1.2, 0.2, 0, 0.2,
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
  VALUES (v_ing_id, 'bacaladillas', 'bacaladillas')
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
    'Boquerón', 'boqueron', 131, 17, 0,
    0, 7, 2.2, 0, 0.3,
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
  VALUES (v_ing_id, 'boquerones', 'boquerones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aladroc', 'aladroc')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'seitó', 'seito')
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
    'Sardina', 'sardina', 140, 18.1, 0,
    0, 7.5, 2.5, 0, 0.2,
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
  VALUES (v_ing_id, 'sardinas', 'sardinas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'parrocha', 'parrocha')
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
    'Jurel', 'jurel', 118, 16, 0,
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
  VALUES (v_ing_id, 'jureles', 'jureles')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chicharro', 'chicharro')
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
    'Caballa', 'caballa', 139, 19, 0,
    0, 7, 1.7, 0, 0.2,
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
  VALUES (v_ing_id, 'caballas', 'caballas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'verdel', 'verdel')
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
    'Bonito', 'bonito', 153, 21, 0,
    0, 7.7, 2.1, 0, 0.1,
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
  VALUES (v_ing_id, 'bonito del norte', 'bonito del norte')
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
    'Melva', 'melva', 120, 23, 0,
    0, 3.1, 0.9, 0, 0.1,
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
  VALUES (v_ing_id, 'melvas', 'melvas')
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
    'Cazón', 'cazon', 85, 18, 0,
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
  VALUES (v_ing_id, 'bienmesabe', 'bienmesabe')
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
    'Tintorera', 'tintorera', 85, 18, 0,
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
  VALUES (v_ing_id, 'tintoreras', 'tintoreras')
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
    'Congrio', 'congrio', 103, 19, 0,
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
  VALUES (v_ing_id, 'congrios', 'congrios')
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
    'Mújol', 'mujol', 117, 19.4, 0,
    0, 4.4, 1.1, 0, 0.2,
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
  VALUES (v_ing_id, 'llisa', 'llisa')
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
    'Rodaballo', 'rodaballo', 97, 16, 0,
    0, 3.6, 0.8, 0, 0.3,
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
  VALUES (v_ing_id, 'rodaballos', 'rodaballos')
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
    'Salmonete', 'salmonete', 90, 16, 0,
    0, 3.4, 0.9, 0, 0.2,
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
  VALUES (v_ing_id, 'salmonetes', 'salmonetes')
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
    'Pinta Roja', 'pinta roja', 80, 18, 0,
    0, 1.0, 0.2, 0, 0.2,
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
  VALUES (v_ing_id, 'pintarroja', 'pintarroja')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gatet', 'gatet')
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
    'Manta Raya', 'manta raya', 73, 15.5, 0,
    0, 0.9, 0.2, 0, 0.3,
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
  VALUES (v_ing_id, 'manta', 'manta')
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
    'Pargo Rojo', 'pargo rojo', 100, 20, 0,
    0, 1.3, 0.3, 0, 0.2,
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
    'Ostra', 'ostra', 68, 9, 4,
    0, 1.5, 0.3, 0, 1.0,
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
  VALUES (v_ing_id, 'ostras', 'ostras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ostron', 'ostron')
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
    'Vieira', 'vieira', 88, 16, 3,
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
  VALUES (v_ing_id, 'vieiras', 'vieiras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zamburiña', 'zamburina')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zamburiñas', 'zamburinas')
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
    'Coquina', 'coquina', 76, 15.6, 1.5,
    0, 1.0, 0.1, 0, 1.5,
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
  VALUES (v_ing_id, 'coquinas', 'coquinas')
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
    'Cañaílla', 'canailla', 90, 18, 1,
    0, 1.5, 0.3, 0, 1.0,
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
  VALUES (v_ing_id, 'cañaillas', 'canaillas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cargol de mar', 'cargol de mar')
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
    'Bígaro', 'bigaro', 90, 18, 1,
    0, 1.5, 0.3, 0, 1.0,
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
  VALUES (v_ing_id, 'bigaros', 'bigaros')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caracolillos', 'caracolillos')
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
    'Percebe', 'percebe', 66, 15, 0,
    0, 0.5, 0.1, 0, 1.2,
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
  VALUES (v_ing_id, 'percebes', 'percebes')
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
    'Quisquilla', 'quisquilla', 95, 20, 0,
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
  VALUES (v_ing_id, 'quisquillas', 'quisquillas')
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
    'Camarón', 'camaron', 95, 20, 0,
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
  VALUES (v_ing_id, 'camarones', 'camarones')
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
    'Chipirón', 'chipiron', 79, 16.2, 0,
    0, 1.4, 0.3, 0, 0.4,
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
  VALUES (v_ing_id, 'chipirones', 'chipirones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'puntilla', 'puntilla')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'puntillas', 'puntillas')
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
    'Pota', 'pota', 75, 16.1, 0.7,
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
  VALUES (v_ing_id, 'potas', 'potas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'lulilla', 'lulilla')
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
    'Ternera (Guiso)', 'ternera guiso', 135, 21, 0,
    0, 5.5, 2.1, 0, 0.1,
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
  VALUES (v_ing_id, 'ternera para guisar', 'ternera para guisar')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne de ternera', 'carne de ternera')
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
    'Solomillo de Ternera', 'solomillo de ternera', 121, 22, 0,
    0, 3.6, 1.4, 0, 0.1,
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
  VALUES (v_ing_id, 'solomillo ternera', 'solomillo ternera')
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
    'Chuleta de Ternera', 'chuleta de ternera', 140, 21, 0,
    0, 6, 2.5, 0, 0.1,
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
  VALUES (v_ing_id, 'chuleta ternera', 'chuleta ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chuleton', 'chuleton')
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
    'Carne Picada Ternera', 'carne picada ternera', 212, 19, 0,
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
  VALUES (v_ing_id, 'picada de ternera', 'picada de ternera')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne picada', 'carne picada')
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
    'Lomo de Cerdo', 'lomo de cerdo', 152, 20, 0,
    0, 8, 3, 0, 0.1,
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
  VALUES (v_ing_id, 'cinta de lomo', 'cinta de lomo')
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
    'Panceta', 'panceta', 418, 10, 0,
    0, 42, 16, 0, 1.5,
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
  VALUES (v_ing_id, 'pancetas', 'pancetas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bacon', 'bacon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tocino', 'tocino')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'torrezno', 'torrezno')
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
    'Presa Ibérica', 'presa iberica', 280, 15, 0,
    0, 24, 9, 0, 0.1,
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
  VALUES (v_ing_id, 'presa', 'presa')
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
    'Carrillera de Cerdo', 'carrillera de cerdo', 150, 20, 0,
    0, 7, 2.5, 0, 0.2,
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
  VALUES (v_ing_id, 'carrilleras de cerdo', 'carrilleras de cerdo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carrilladas', 'carrilladas')
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
    'Codillo', 'codillo', 170, 18, 0,
    0, 11, 4, 0, 0.3,
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
  VALUES (v_ing_id, 'codillo de cerdo', 'codillo de cerdo')
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
    'Pavo', 'pavo', 114, 24, 0,
    0, 2, 0.5, 0, 0.1,
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
  VALUES (v_ing_id, 'pechuga de pavo', 'pechuga de pavo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carne de pavo', 'carne de pavo')
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
    'Muslo de Pavo', 'muslo de pavo', 144, 20, 0,
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
  VALUES (v_ing_id, 'muslos de pavo', 'muslos de pavo')
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
    'Perdiz', 'perdiz', 106, 22, 0,
    0, 2, 0.5, 0, 0.1,
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
  VALUES (v_ing_id, 'perdices', 'perdices')
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
    'Codorniz', 'codorniz', 134, 22, 0,
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
  VALUES (v_ing_id, 'codornices', 'codornices')
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
    'Cabrito', 'cabrito', 125, 19, 0,
    0, 5.5, 2.5, 0, 0.1,
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
  VALUES (v_ing_id, 'carne de cabrito', 'carne de cabrito')
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
    'Cordero', 'cordero', 294, 17, 0,
    0, 25, 11, 0, 0.2,
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
  VALUES (v_ing_id, 'pierna de cordero', 'pierna de cordero')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chuletas de cordero', 'chuletas de cordero')
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
    'Salchicha', 'salchicha', 300, 12, 2,
    1, 27, 10, 0, 2.0,
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
  VALUES (v_ing_id, 'salchichas', 'salchichas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'salchicha de cerdo', 'salchicha de cerdo')
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
    'Salchichón', 'salchichon', 416, 20, 2,
    1, 36, 13, 0, 3.0,
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
    'Jamón Serrano', 'jamon serrano', 319, 30, 0,
    0, 22, 8, 0, 5.0,
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
  VALUES (v_ing_id, 'jamon', 'jamon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'jamon curado', 'jamon curado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tacos de jamon', 'tacos de jamon')
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
    'Jamón Ibérico', 'jamon iberico', 335, 33, 0,
    0, 22, 7.5, 0, 4.5,
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
  VALUES (v_ing_id, 'paleta iberica', 'paleta iberica')
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
    'Cecina', 'cecina', 250, 39, 0,
    0, 10, 4, 0, 4.0,
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
  VALUES (v_ing_id, 'cecinas', 'cecinas')
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
    'Sobrasada', 'sobrasada', 590, 13, 2,
    1, 59, 23, 0, 2.5,
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
  VALUES (v_ing_id, 'sobrasadas', 'sobrasadas')
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
    'Chistorra', 'chistorra', 480, 14, 2,
    1, 46, 18, 0, 2.5,
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
  VALUES (v_ing_id, 'txistorra', 'txistorra')
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
    'Longaniza', 'longaniza', 350, 15, 2,
    1, 32, 12, 0, 2.5,
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
  VALUES (v_ing_id, 'longanizas', 'longanizas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'llonganissa', 'llonganissa')
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
    'Morro de Cerdo', 'morro de cerdo', 350, 16, 0,
    0, 31, 10, 0, 1.0,
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
  VALUES (v_ing_id, 'morro', 'morro')
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
    'Oreja de Cerdo', 'oreja de cerdo', 211, 22, 0,
    0, 13, 4, 0, 1.0,
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
  VALUES (v_ing_id, 'oreja', 'oreja')
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
    'Manitas de Cerdo', 'manitas de cerdo', 250, 18, 0,
    0, 19, 6, 0, 1.0,
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
  VALUES (v_ing_id, 'manitas', 'manitas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pezuña', 'pezuna')
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
    'Pimiento de Padrón', 'pimiento de padron', 28, 1, 5,
    3, 0.4, 0.1, 2, 0,
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
  VALUES (v_ing_id, 'pimientos de padron', 'pimientos de padron')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'padrones', 'padrones')
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
    'Pimiento del Piquillo', 'pimiento del piquillo', 35, 1, 6,
    4, 0.5, 0.1, 2, 0.5,
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
  VALUES (v_ing_id, 'piquillos', 'piquillos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimientos del piquillo', 'pimientos del piquillo')
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
    'Guindilla', 'guindilla', 40, 2, 9,
    5, 0.4, 0.1, 1.5, 0,
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
  VALUES (v_ing_id, 'guindillas', 'guindillas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chile', 'chile')
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
    'Jalapeño', 'jalapeno', 29, 1, 6,
    4, 0.4, 0.1, 2.8, 0,
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
  VALUES (v_ing_id, 'jalapeños', 'jalapenos')
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
    'Tomate Pera', 'tomate pera', 18, 0.9, 3.9,
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
  VALUES (v_ing_id, 'tomates pera', 'tomates pera')
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
    'Tomate Cherry', 'tomate cherry', 18, 0.9, 3.9,
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
  VALUES (v_ing_id, 'cherrys', 'cherrys')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomates cherry', 'tomates cherry')
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
    'Tomate Seco', 'tomate seco', 258, 14, 55,
    37, 3, 0.4, 12, 1.5,
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
  VALUES (v_ing_id, 'tomates secos', 'tomates secos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pomodoro secco', 'pomodoro secco')
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
    'Cebolla Morada', 'cebolla morada', 40, 1.1, 9.3,
    4.2, 0.1, 0, 1.7, 0,
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
  VALUES (v_ing_id, 'cebollas moradas', 'cebollas moradas')
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
    'Chalota', 'chalota', 72, 2.5, 16,
    7, 0.1, 0, 3.2, 0,
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
  VALUES (v_ing_id, 'chalotas', 'chalotas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'escalonia', 'escalonia')
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
    'Cebolleta', 'cebolleta', 32, 1.8, 7.3,
    2.1, 0.2, 0, 2.6, 0,
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
  VALUES (v_ing_id, 'cebolletas', 'cebolletas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'cebolla tierna', 'cebolla tierna')
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
    'Ajo Tierno', 'ajo tierno', 32, 1.8, 7.3,
    2.1, 0.2, 0, 2.6, 0,
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
  VALUES (v_ing_id, 'ajos tiernos', 'ajos tiernos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ajetes', 'ajetes')
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
    'Ajo Negro', 'ajo negro', 149, 6.4, 33,
    1, 0.5, 0.1, 2.1, 0.1,
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
  VALUES (v_ing_id, 'ajos negros', 'ajos negros')
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
    'Repollo', 'repollo', 25, 1.3, 5.8,
    3.2, 0.1, 0, 2.5, 0,
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
  VALUES (v_ing_id, 'col', 'col')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'coles', 'coles')
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
    'Coliflor', 'coliflor', 25, 1.9, 5,
    1.9, 0.3, 0.1, 2, 0,
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
  VALUES (v_ing_id, 'coliflores', 'coliflores')
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
    'Brócoli', 'brocoli', 34, 2.8, 6.6,
    1.7, 0.4, 0.1, 2.6, 0,
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
    'Romanesco', 'romanesco', 30, 2, 6,
    2, 0.3, 0.1, 2.5, 0,
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
  VALUES (v_ing_id, 'romanescos', 'romanescos')
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
    'Espinaca', 'espinaca', 23, 2.9, 3.6,
    0.4, 0.4, 0, 2.2, 0,
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
  VALUES (v_ing_id, 'espinacas', 'espinacas')
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
    'Acelga', 'acelga', 19, 1.8, 3.7,
    1.1, 0.2, 0, 1.6, 0,
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
  VALUES (v_ing_id, 'acelgas', 'acelgas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bledes', 'bledes')
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
    'Lechuga', 'lechuga', 15, 1.4, 2.9,
    0.8, 0.2, 0, 1.3, 0,
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
  VALUES (v_ing_id, 'lechugas', 'lechugas')
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
    'Patata', 'patata', 77, 2, 17,
    0.8, 0.1, 0, 2.2, 0,
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
  VALUES (v_ing_id, 'patatas', 'patatas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'papas', 'papas')
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
    'Boniato', 'boniato', 86, 1.6, 20,
    4.2, 0.1, 0, 3, 0,
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
  VALUES (v_ing_id, 'batata', 'batata')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'moniato', 'moniato')
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
    'Zanahoria', 'zanahoria', 41, 0.9, 9.6,
    4.7, 0.2, 0, 2.8, 0.1,
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
  VALUES (v_ing_id, 'zanahorias', 'zanahorias')
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
    'Nabo', 'nabo', 28, 0.9, 6.4,
    3.8, 0.1, 0, 1.8, 0,
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
  VALUES (v_ing_id, 'nabos', 'nabos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'nap', 'nap')
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
    'Chirivía', 'chirivia', 75, 1.2, 18,
    4.8, 0.3, 0, 4.9, 0,
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
  VALUES (v_ing_id, 'xirivia', 'xirivia')
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
    'Rábano', 'rabano', 16, 0.7, 3.4,
    1.9, 0.1, 0, 1.6, 0,
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
  VALUES (v_ing_id, 'rabanos', 'rabanos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rabanitos', 'rabanitos')
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
    'Remolacha', 'remolacha', 43, 1.6, 9.6,
    6.8, 0.2, 0, 2.8, 0,
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
  VALUES (v_ing_id, 'remolachas', 'remolachas')
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
    'Champiñón', 'champinon', 22, 3.1, 3.3,
    1.9, 0.3, 0.1, 1, 0,
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
  VALUES (v_ing_id, 'champiñones', 'champinones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'portobello', 'portobello')
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
    'Shiitake', 'shiitake', 34, 2.2, 6.8,
    2.4, 0.5, 0.1, 2.5, 0,
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
  VALUES (v_ing_id, 'seta shiitake', 'seta shiitake')
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
    'Níscalo', 'niscalo', 22, 3.1, 3.3,
    1.9, 0.3, 0.1, 1, 0,
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
  VALUES (v_ing_id, 'niscalos', 'niscalos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rovello', 'rovello')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rovellon', 'rovellon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'rebollón', 'rebollon')
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
    'Trufa', 'trufa', 22, 3.1, 3.3,
    1.9, 0.3, 0.1, 1, 0,
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
  VALUES (v_ing_id, 'trufas', 'trufas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'trufa negra', 'trufa negra')
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
    'Calabaza', 'calabaza', 26, 1, 6.5,
    2.8, 0.1, 0, 0.5, 0,
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
  VALUES (v_ing_id, 'calabazas', 'calabazas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'carabassa', 'carabassa')
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
    'Calabacín', 'calabacin', 17, 1.2, 3.1,
    2.5, 0.3, 0.1, 1, 0,
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
  VALUES (v_ing_id, 'calabacines', 'calabacines')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'courgette', 'courgette')
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
    'Berenjena', 'berenjena', 25, 1, 6,
    3.5, 0.2, 0, 3, 0,
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
  VALUES (v_ing_id, 'berenjenas', 'berenjenas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'alberginia', 'alberginia')
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
    'Pepino', 'pepino', 15, 0.6, 3.6,
    1.7, 0.1, 0, 0.5, 0,
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
  VALUES (v_ing_id, 'pepinos', 'pepinos')
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
    'Apio', 'apio', 14, 0.7, 3,
    1.3, 0.2, 0.1, 1.6, 0.1,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Apio'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'apios', 'apios')
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
    'Puerro', 'puerro', 61, 1.5, 14,
    3.9, 0.3, 0.1, 1.8, 0,
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
  VALUES (v_ing_id, 'puerros', 'puerros')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'porro', 'porro')
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
    'Hinojo', 'hinojo', 31, 1.2, 7,
    3.9, 0.2, 0, 3.1, 0,
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
  VALUES (v_ing_id, 'bulbo de hinojo', 'bulbo de hinojo')
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
    'Bimi', 'bimi', 35, 3.5, 4.5,
    1.5, 0.5, 0.1, 3, 0,
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
  VALUES (v_ing_id, 'bimis', 'bimis')
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
    'Grelos', 'grelos', 32, 3, 4,
    1, 0.3, 0, 3.5, 0,
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
  VALUES (v_ing_id, 'grelo', 'grelo')
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
    'Alcaparra', 'alcaparra', 23, 2, 4,
    0.4, 0.9, 0.2, 3, 2.9,
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
  VALUES (v_ing_id, 'alcaparras', 'alcaparras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'taperas', 'taperas')
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
    'Pimientos del Padrón', 'pimientos del padron', 28, 1, 5,
    3, 0.4, 0.1, 2, 0,
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
  VALUES (v_ing_id, 'pimiento padron', 'pimiento padron')
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
    'Lenteja Pardina', 'lenteja pardina', 353, 24, 63,
    2, 1, 0.1, 11, 0,
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
  VALUES (v_ing_id, 'lentejas pardinas', 'lentejas pardinas')
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
    'Lenteja Beluga', 'lenteja beluga', 353, 24, 63,
    2, 1, 0.1, 11, 0,
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
  VALUES (v_ing_id, 'lenteja negra', 'lenteja negra')
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
    'Lenteja Roja', 'lenteja roja', 353, 24, 63,
    2, 1, 0.1, 11, 0,
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
  VALUES (v_ing_id, 'lentejas rojas', 'lentejas rojas')
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
    'Alubia Blanca', 'alubia blanca', 333, 23, 60,
    2, 0.8, 0.2, 15, 0,
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
  VALUES (v_ing_id, 'alubias blancas', 'alubias blancas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mongetes', 'mongetes')
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
    'Alubia Pinta', 'alubia pinta', 347, 21, 63,
    2, 1.2, 0.2, 16, 0,
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
  VALUES (v_ing_id, 'alubias pintas', 'alubias pintas')
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
    'Alubia Negra', 'alubia negra', 341, 21, 62,
    2, 1.4, 0.3, 15, 0,
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
  VALUES (v_ing_id, 'alubias negras', 'alubias negras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'frijol negro', 'frijol negro')
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
    'Fabes', 'fabes', 333, 23, 60,
    2, 0.8, 0.2, 15, 0,
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
  VALUES (v_ing_id, 'faba', 'faba')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'judion', 'judion')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'judiones', 'judiones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pochas', 'pochas')
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
    'Haba', 'haba', 341, 26, 58,
    5, 1.5, 0.2, 25, 0,
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
  VALUES (v_ing_id, 'habas', 'habas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'faves', 'faves')
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
    'Guisante', 'guisante', 81, 5.4, 14,
    5.7, 0.4, 0.1, 5.1, 0,
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
  VALUES (v_ing_id, 'guisantes', 'guisantes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pesols', 'pesols')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pésols', 'pesols')
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
    'Tirabeque', 'tirabeque', 42, 2.8, 7.5,
    4, 0.2, 0, 2.6, 0,
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
  VALUES (v_ing_id, 'tirabeques', 'tirabeques')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'bisalto', 'bisalto')
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
    'Edamame', 'edamame', 121, 11.9, 9,
    2.7, 5.2, 0.6, 5.2, 0,
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
  VALUES (v_ing_id, 'edamames', 'edamames')
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
    'Altramuz', 'altramuz', 119, 15.6, 9.9,
    0, 4.9, 0.6, 5, 2.5,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Altramuces'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'altramuces', 'altramuces')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'chochos', 'chochos')
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
    'Soja Texturizada', 'soja texturizada', 350, 50, 30,
    1, 1.5, 0, 10, 0,
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
  VALUES (v_ing_id, 'soja gruesa', 'soja gruesa')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'soja fina', 'soja fina')
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
    'Tofu', 'tofu', 76, 8, 1.9,
    0.6, 4.8, 0.7, 0.3, 0,
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
  VALUES (v_ing_id, 'tofu firme', 'tofu firme')
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
    'Trigo', 'trigo', 342, 13, 71,
    0.4, 1.5, 0.3, 12, 0,
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
  VALUES (v_ing_id, 'grano de trigo', 'grano de trigo')
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
    'Harina de Trigo', 'harina de trigo', 364, 10, 76,
    0.3, 1, 0.2, 2.7, 0,
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
  VALUES (v_ing_id, 'harina', 'harina')
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
    'Harina de Maíz', 'harina de maiz', 362, 8.1, 76,
    0.6, 3.6, 0.5, 7.3, 0,
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
  VALUES (v_ing_id, 'maicena', 'maicena')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'maizena', 'maizena')
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
    'Pan', 'pan', 265, 9, 49,
    5, 3, 0.5, 3, 1.5,
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
  VALUES (v_ing_id, 'pan blanco', 'pan blanco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'barra de pan', 'barra de pan')
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
    'Pan Rallado', 'pan rallado', 395, 13, 75,
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
  VALUES (v_ing_id, 'pan molido', 'pan molido')
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
    'Pasta', 'pasta', 371, 13, 74,
    2.6, 1.5, 0.3, 3, 0,
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
  VALUES (v_ing_id, 'fideos', 'fideos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'macarrones', 'macarrones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fideua', 'fideua')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fideuà', 'fideua')
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
    'Maíz', 'maiz', 86, 3.2, 18,
    6, 1.3, 0.2, 2, 0,
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
  VALUES (v_ing_id, 'maiz dulce', 'maiz dulce')
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
    'Avena', 'avena', 389, 16.9, 66,
    0, 6.9, 1.2, 10.6, 0,
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
  VALUES (v_ing_id, 'copos de avena', 'copos de avena')
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
    'Quinoa', 'quinoa', 368, 14, 64,
    0, 6, 0.7, 7, 0,
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
    'Couscous', 'couscous', 112, 3.8, 23,
    0.1, 0.2, 0, 1.4, 0,
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
  VALUES (v_ing_id, 'cuscus', 'cuscus')
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
    'Mijo', 'mijo', 378, 11, 72,
    0, 4, 0.7, 8, 0,
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
    'Tapioca', 'tapioca', 358, 0.2, 88,
    3, 0, 0, 0.9, 0,
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
  VALUES (v_ing_id, 'almidon de yuca', 'almidon de yuca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mandioca', 'mandioca')
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
    'Leche Entera', 'leche entera', 61, 3.2, 4.8,
    4.8, 3.6, 2.4, 0, 0.1,
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
  VALUES (v_ing_id, 'leche de vaca', 'leche de vaca')
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
    'Leche Semi', 'leche semi', 45, 3.3, 4.8,
    4.8, 1.5, 1, 0, 0.1,
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
  VALUES (v_ing_id, 'leche semidesnatada', 'leche semidesnatada')
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
    'Leche Desnatada', 'leche desnatada', 34, 3.4, 5,
    5, 0.1, 0.1, 0, 0.1,
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
  VALUES (v_ing_id, 'leche sin grasa', 'leche sin grasa')
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
    'Nata', 'nata', 340, 2, 3,
    3, 35, 22, 0, 0.1,
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
  VALUES (v_ing_id, 'nata liquida', 'nata liquida')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'crema de leche', 'crema de leche')
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
    'Queso Manchego', 'queso manchego', 395, 25, 0.5,
    0.5, 32, 20, 0, 1.5,
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
  VALUES (v_ing_id, 'manchego', 'manchego')
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
    'Queso Parmesano', 'queso parmesano', 431, 38, 4,
    1, 29, 19, 0, 1.5,
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
  VALUES (v_ing_id, 'parmesano', 'parmesano')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'parmigiano', 'parmigiano')
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
    'Queso Mozzarella', 'queso mozzarella', 280, 28, 3,
    1, 17, 11, 0, 1.5,
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
  VALUES (v_ing_id, 'mozzarella', 'mozzarella')
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
    'Queso Rulo Cabra', 'queso rulo cabra', 300, 15, 2,
    2, 25, 17, 0, 1.5,
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
  VALUES (v_ing_id, 'rulo de cabra', 'rulo de cabra')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'queso de cabra', 'queso de cabra')
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
    'Queso Azul', 'queso azul', 353, 21, 2,
    0.5, 28, 18, 0, 3.5,
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
  VALUES (v_ing_id, 'roquefort', 'roquefort')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'gorgonzola', 'gorgonzola')
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
    'Queso Cheddar', 'queso cheddar', 402, 25, 1.2,
    0.5, 33, 21, 0, 1.5,
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
  VALUES (v_ing_id, 'cheddar', 'cheddar')
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
    'Queso Emmental', 'queso emmental', 380, 28, 5,
    2, 27, 17, 0, 0.8,
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
  VALUES (v_ing_id, 'emmental', 'emmental')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'queso suizo', 'queso suizo')
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
    'Queso Fresco', 'queso fresco', 300, 12, 3,
    3, 25, 15, 0, 1.0,
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
  VALUES (v_ing_id, 'queso de burgos', 'queso de burgos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'queso blanco', 'queso blanco')
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
    'Mascarpone', 'mascarpone', 418, 4, 4,
    4, 42, 29, 0, 0.1,
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
  VALUES (v_ing_id, 'queso mascarpone', 'queso mascarpone')
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
    'Yogur Natural', 'yogur natural', 61, 3.4, 4.6,
    4.6, 3.2, 2, 0, 0.1,
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
  VALUES (v_ing_id, 'yogur', 'yogur')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'yogurt', 'yogurt')
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
    'Huevo', 'huevo', 143, 12.5, 0.7,
    0.3, 9.5, 3.1, 0, 0.3,
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
  VALUES (v_ing_id, 'huevos', 'huevos')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'huevo de gallina', 'huevo de gallina')
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
    'Huevo de Codorniz', 'huevo de codorniz', 158, 13, 0.4,
    0.4, 11, 3.5, 0, 0.3,
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
  VALUES (v_ing_id, 'huevos de codorniz', 'huevos de codorniz')
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
    'Clara de Huevo', 'clara de huevo', 52, 10.9, 0.7,
    0.7, 0.1, 0, 0, 0.3,
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
  VALUES (v_ing_id, 'claras', 'claras')
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
    'Yema de Huevo', 'yema de huevo', 322, 15.8, 3.5,
    0, 26.5, 9.5, 0, 0.1,
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
  VALUES (v_ing_id, 'yemas', 'yemas')
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
    'Almendra', 'almendra', 579, 21, 21,
    4.3, 49, 3.8, 12, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'almendras', 'almendras')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'almendra marcona', 'almendra marcona')
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
    'Nuez', 'nuez', 654, 15, 13,
    2.6, 65, 6, 6.7, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'nueces', 'nueces')
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
    'Avellana', 'avellana', 628, 15, 16,
    4, 60, 4.4, 9.7, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'avellanas', 'avellanas')
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
    'Piñón', 'pinon', 673, 13, 13,
    3.5, 68, 4.9, 3.7, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'piñones', 'pinones')
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
    'Pistacho', 'pistacho', 562, 20, 27,
    7.6, 45, 5.9, 10, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pistachos', 'pistachos')
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
    'Anacardo', 'anacardo', 553, 18, 30,
    5.9, 43, 7.7, 3.3, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'anacardos', 'anacardos')
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
    'Macadamia', 'macadamia', 718, 7.9, 13,
    4.5, 75, 12, 8.6, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'macadamias', 'macadamias')
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
    'Pipas de Girasol', 'pipas de girasol', 584, 20, 20,
    2.6, 51, 4.5, 8.6, 0,
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
  VALUES (v_ing_id, 'pipas', 'pipas')
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
    'Pipas de Calabaza', 'pipas de calabaza', 559, 30, 10,
    1.4, 49, 8.6, 6, 0,
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
  VALUES (v_ing_id, 'pipas calabaza', 'pipas calabaza')
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
    'Sésamo', 'sesamo', 573, 17, 23,
    0.3, 49, 6.9, 11, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sésamo'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'ajonjoli', 'ajonjoli')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'semillas de sésamo', 'semillas de sesamo')
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
    'Lino', 'lino', 534, 18, 28,
    1.5, 42, 3.7, 27, 0,
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
  VALUES (v_ing_id, 'semillas de lino', 'semillas de lino')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'linaza', 'linaza')
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
    'Chía', 'chia', 486, 16, 42,
    0, 30, 3.3, 34, 0,
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
  VALUES (v_ing_id, 'semillas de chía', 'semillas de chia')
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
    'Castaña', 'castana', 196, 2.4, 45,
    8, 1.2, 0.2, 5, 0,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'castañas', 'castanas')
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
    'Pimienta Negra', 'pimienta negra', 251, 10.3, 63,
    0.6, 3.2, 1.3, 25, 0.1,
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
  VALUES (v_ing_id, 'pimienta', 'pimienta')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pimienta en grano', 'pimienta en grano')
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
    'Pimienta Blanca', 'pimienta blanca', 296, 10.4, 68,
    0, 2.1, 0.6, 26, 0.1,
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
  VALUES (v_ing_id, 'pimienta blanca en polvo', 'pimienta blanca en polvo')
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
    'Pimienta Verde', 'pimienta verde', 251, 10.3, 63,
    0.6, 3.2, 1.3, 25, 0.1,
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
  VALUES (v_ing_id, 'pimienta verde en grano', 'pimienta verde en grano')
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
    'Comino', 'comino', 375, 17.8, 44,
    2.2, 22, 1.5, 10, 0.4,
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
  VALUES (v_ing_id, 'cominos', 'cominos')
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
    'Clavo', 'clavo', 274, 5.9, 65,
    2.3, 13, 3.9, 34, 0.6,
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
  VALUES (v_ing_id, 'clavo de olor', 'clavo de olor')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'clavos', 'clavos')
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
    'Canela', 'canela', 247, 3.9, 80,
    2.1, 1.2, 0.3, 53, 0.1,
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
  VALUES (v_ing_id, 'canela en rama', 'canela en rama')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'canela molida', 'canela molida')
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
    'Nuez Moscada', 'nuez moscada', 525, 5.8, 49,
    2.9, 36, 25, 20, 0,
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
  VALUES (v_ing_id, 'nuez moscada molida', 'nuez moscada molida')
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
    'Anís', 'anis', 337, 17.6, 50,
    0, 15.9, 0, 14, 0,
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
  VALUES (v_ing_id, 'anis estrellado', 'anis estrellado')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'anis grano', 'anis grano')
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
    'Hinojo en Grano', 'hinojo en grano', 344, 15.8, 52,
    0, 14.8, 0, 39, 0,
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
  VALUES (v_ing_id, 'semillas de hinojo', 'semillas de hinojo')
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
    'Romero', 'romero', 331, 4.8, 64,
    0, 15.2, 7, 42, 0.1,
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
  VALUES (v_ing_id, 'romero fresco', 'romero fresco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'romero seco', 'romero seco')
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
    'Tomillo', 'tomillo', 276, 9.1, 63,
    1.7, 7.4, 2.7, 37, 0.1,
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
  VALUES (v_ing_id, 'tomillo fresco', 'tomillo fresco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'tomillo seco', 'tomillo seco')
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
    'Orégano', 'oregano', 265, 9, 68,
    4, 4.2, 1.5, 42, 0,
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
  VALUES (v_ing_id, 'oregano seco', 'oregano seco')
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
    'Albahaca', 'albahaca', 233, 14, 47,
    1.7, 4, 0.1, 37, 0.1,
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
  VALUES (v_ing_id, 'albahaca fresca', 'albahaca fresca')
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
    'Perejil', 'perejil', 36, 2.9, 6.3,
    0.8, 0.7, 0.1, 3.3, 0.1,
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
  VALUES (v_ing_id, 'perejil fresco', 'perejil fresco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'perejil picado', 'perejil picado')
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
    'Cilantro', 'cilantro', 279, 21, 52,
    0, 4.7, 0.1, 10, 0,
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
  VALUES (v_ing_id, 'cilantro fresco', 'cilantro fresco')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'coriandro', 'coriandro')
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
    'Menta', 'menta', 285, 19, 52,
    0, 6, 0.1, 29, 0.1,
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
  VALUES (v_ing_id, 'menta fresca', 'menta fresca')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'hojas de menta', 'hojas de menta')
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
    'Hierbabuena', 'hierbabuena', 285, 19, 52,
    0, 6, 0.1, 29, 0.1,
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
  VALUES (v_ing_id, 'hierbabuena fresca', 'hierbabuena fresca')
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
    'Laurel', 'laurel', 313, 7.6, 74,
    0, 8.3, 2.2, 26, 0,
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
  VALUES (v_ing_id, 'hoja de laurel', 'hoja de laurel')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'laurel seco', 'laurel seco')
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
    'Estragón', 'estragon', 295, 22, 50,
    0, 7, 1.8, 7, 0.1,
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
    'Eneldo', 'eneldo', 253, 15, 55,
    0, 4, 0.1, 13, 0.1,
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
  VALUES (v_ing_id, 'eneldo fresco', 'eneldo fresco')
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
    'Vinagre de Vino', 'vinagre de vino', 19, 0, 0,
    0, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vinagre', 'vinagre')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vinagre blanco', 'vinagre blanco')
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
    'Vinagre de Manzana', 'vinagre de manzana', 21, 0, 0,
    0, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vinagre de sidra', 'vinagre de sidra')
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
    'Vinagre de Jerez', 'vinagre de jerez', 30, 0.5, 2,
    2, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vinagre reserva', 'vinagre reserva')
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
    'Vinagre de Módena', 'vinagre de modena', 88, 0.4, 17,
    15, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vinagre balsamico', 'vinagre balsamico')
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
    'Salsa Perrins', 'salsa perrins', 78, 0.8, 18,
    11, 0.1, 0, 0, 2.5,
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
  VALUES (v_ing_id, 'salsa worcestershire', 'salsa worcestershire')
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
    'Salsa Sriracha', 'salsa sriracha', 80, 1.5, 16,
    10, 0.5, 0, 0.5, 6,
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
  VALUES (v_ing_id, 'sriracha', 'sriracha')
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
    'Salsa Brava', 'salsa brava', 150, 2, 15,
    8, 8, 1, 1.5, 2,
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
  VALUES (v_ing_id, 'salsa picante brava', 'salsa picante brava')
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
    'Mostaza', 'mostaza', 66, 4.4, 8,
    3, 3.3, 0.2, 3, 2.9,
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
  VALUES (v_ing_id, 'mostaza de dijon', 'mostaza de dijon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mostaza antigua', 'mostaza antigua')
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
    'Sal en Escamas', 'sal en escamas', 0, 0, 0,
    0, 0, 0, 0, 100,
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
  VALUES (v_ing_id, 'sal maldon', 'sal maldon')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'escamas de sal', 'escamas de sal')
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
    'Pasta de Curry', 'pasta de curry', 110, 4, 15,
    2, 4, 0.5, 3, 5,
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
  VALUES (v_ing_id, 'curry', 'curry')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'curry rojo', 'curry rojo')
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
    'Limón', 'limon', 29, 1.1, 9.3,
    2.5, 0.3, 0.1, 2.8, 0,
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
  VALUES (v_ing_id, 'limones', 'limones')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zumo de limon', 'zumo de limon')
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
    'Naranja', 'naranja', 47, 0.9, 11.7,
    9.3, 0.1, 0, 2.4, 0,
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
  VALUES (v_ing_id, 'naranjas', 'naranjas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zumo de naranja', 'zumo de naranja')
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
    'Lima', 'lima', 30, 0.7, 10.5,
    1.6, 0.2, 0, 2.8, 0,
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
  VALUES (v_ing_id, 'limas', 'limas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'zumo de lima', 'zumo de lima')
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
    'Manzana', 'manzana', 52, 0.2, 13.8,
    10.3, 0.1, 0, 2.4, 0,
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
  VALUES (v_ing_id, 'manzanas', 'manzanas')
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
    'Pera', 'pera', 57, 0.3, 15.2,
    9.7, 0.1, 0, 3.1, 0,
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
  VALUES (v_ing_id, 'peras', 'peras')
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
    'Uva', 'uva', 69, 0.7, 18.1,
    15.4, 0.1, 0, 0.9, 0,
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
  VALUES (v_ing_id, 'uvas', 'uvas')
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
    'Pasas', 'pasas', 299, 3.1, 79,
    59, 0.4, 0.1, 3.7, 0.1,
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
  VALUES (v_ing_id, 'uvas pasas', 'uvas pasas')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pasas sultanas', 'pasas sultanas')
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
    'Ciruelas Pasas', 'ciruelas pasas', 240, 2.1, 63,
    38, 0.3, 0, 7, 0,
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
  VALUES (v_ing_id, 'ciruela pasa', 'ciruela pasa')
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
    'Orejones', 'orejones', 241, 3.3, 62,
    53, 0.5, 0, 7.3, 0,
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
  VALUES (v_ing_id, 'albaricoque seco', 'albaricoque seco')
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
    'Dátiles', 'datiles', 277, 1.8, 75,
    66, 0.1, 0, 6.7, 0,
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
    'Aguacate', 'aguacate', 160, 2, 8.5,
    0.6, 14.6, 2.1, 6.7, 0,
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
  VALUES (v_ing_id, 'aguacates', 'aguacates')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'avocado', 'avocado')
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
    'Aceitunas Verdes', 'aceitunas verdes', 145, 1, 3.8,
    0.5, 15.3, 2, 3.3, 4,
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
  VALUES (v_ing_id, 'olivas verdes', 'olivas verdes')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aceitunas', 'aceitunas')
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
    'Aceitunas Negras', 'aceitunas negras', 116, 0.8, 6,
    0, 10.5, 1.3, 3, 2.5,
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
  VALUES (v_ing_id, 'olivas negras', 'olivas negras')
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
    'Aceitunas Gordal', 'aceitunas gordal', 145, 1, 3.8,
    0.5, 15.3, 2, 3.3, 4,
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
  VALUES (v_ing_id, 'gordales', 'gordales')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'oliva gordal', 'oliva gordal')
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
    'Alcaparrones', 'alcaparrones', 23, 2, 4,
    0.4, 0.9, 0.2, 3, 2.9,
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
  VALUES (v_ing_id, 'taperots', 'taperots')
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
    'Manteca de Cerdo', 'manteca de cerdo', 900, 0, 0,
    0, 100, 39, 0, 0,
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
  VALUES (v_ing_id, 'manteca', 'manteca')
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
    'Aceite de Coco', 'aceite de coco', 862, 0, 0,
    0, 100, 86, 0, 0,
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
  VALUES (v_ing_id, 'aceite coco', 'aceite coco')
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
    'Aceite de Sésamo', 'aceite de sesamo', 884, 0, 0,
    0, 100, 14, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sésamo'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'aceite sesamo', 'aceite sesamo')
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
    'Vino Tinto', 'vino tinto', 85, 0.2, 2.6,
    0.6, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'vino negro', 'vino negro')
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
    'Vino Dulce', 'vino dulce', 160, 0.2, 13,
    13, 0, 0, 0, 0,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Sulfitos'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'pedro ximenez', 'pedro ximenez')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'mistela', 'mistela')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'moscatel', 'moscatel')
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
    'Coñac', 'conac', 231, 0, 0,
    0, 0, 0, 0, 0,
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
  VALUES (v_ing_id, 'cognac', 'cognac')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'brandy', 'brandy')
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
    'Cerveza', 'cerveza', 43, 0.4, 3.5,
    0, 0, 0, 0, 0,
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
  VALUES (v_ing_id, 'cerveza rubia', 'cerveza rubia')
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
    'Caldo de Carne', 'caldo de carne', 15, 1.5, 1,
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

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'fondo oscuro', 'fondo oscuro')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caldo oscuro', 'caldo oscuro')
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
    'Caldo de Verduras', 'caldo de verduras', 10, 0.5, 1.5,
    0.5, 0, 0, 0, 0.7,
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
  SELECT v_ing_id, id FROM public.allergens WHERE name = 'Apio'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'caldo vegetal', 'caldo vegetal')
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
    'Agua', 'agua', 0, 0, 0,
    0, 0, 0, 0, 0,
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
  VALUES (v_ing_id, 'agua mineral', 'agua mineral')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;

  INSERT INTO public.ingredient_aliases (ingredient_id, alias_name, normalized_alias)
  VALUES (v_ing_id, 'agua del grifo', 'agua del grifo')
  ON CONFLICT (normalized_alias) DO UPDATE SET ingredient_id = EXCLUDED.ingredient_id, alias_name = EXCLUDED.alias_name;
END $$;

COMMIT;
