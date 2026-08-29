const fs = require('fs');

let code = fs.readFileSync('src/app/actions/recipes.ts', 'utf8');

code = code.replace(
  /supabase\.from\("units"\)\.select\("\*"\),/,
  `supabase.from("units").select("*"),
    supabase.from("ingredients").select("id, normalized_name, kcal_per_100, protein_g_per_100, carbs_g_per_100, fat_g_per_100, fiber_g_per_100, salt_g_per_100, nutrition_complete, default_grams_per_unit, ingredient_allergens(allergens(*))"),`
);

code = code.replace(
  /const \[styles, varieties, vessels, heats, units\] = await Promise\.all\(\[/,
  `const [styles, varieties, vessels, heats, units, ingredients] = await Promise.all([`
);

code = code.replace(
  /units: units\.data \|\| \[\],/,
  `units: units.data || [],
    ingredients: ingredients?.data || [],`
);

fs.writeFileSync('src/app/actions/recipes.ts', code);
console.log('Patched getCatalogs successfully.');
