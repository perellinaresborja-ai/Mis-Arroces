const fs = require('fs');
let f = fs.readFileSync('src/app/actions/recipes.ts', 'utf8');

const newIngredientsBlock = `
  if (ingredients) {
    const existingIngIds = ingredients.filter((i: any) => i.db_id).map((i: any) => i.db_id);
    
    // Delete ingredients that are no longer in the list
    if (existingIngIds.length > 0) {
      const { error: delError } = await supabase.from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id)
        .not("id", "in", '(' + existingIngIds.join(',') + ')');
      if (delError) console.error("ING DEL ERROR:", delError);
    } else {
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    }

    if (ingredients.length > 0) {
      const ingsToUpsert = ingredients.map((i: any, idx: number) => ({
        id: i.db_id || i.id || undefined,
        recipe_id: id,
        display_order: idx + 1,
        display_text: i.display_text,
        normalized_quantity: i.normalized_quantity ? Number(i.normalized_quantity) : null,
        unit_id: i.unit_id || null,
        canonical_ingredient_id: i.canonical_ingredient_id || null,
      }));
      const { error: ingError } = await supabase.from("recipe_ingredients").upsert(ingsToUpsert);
      if (ingError) console.error("ING UPSERT ERROR:", ingError);
    }
  }
`;

f = f.replace(
  /if \(ingredients\) \{\s*await supabase\.from\("recipe_ingredients"\)\.delete\(\)\.eq\("recipe_id", id\);\s*if \(ingredients\.length > 0\) \{\s*const ingsToInsert = ingredients\.map\(\(i: any, idx: number\) => \(\{\s*recipe_id: id,\s*display_order: idx \+ 1,\s*display_text: i\.display_text,\s*normalized_quantity: i\.normalized_quantity \? Number\(i\.normalized_quantity\) : null,\s*unit_id: i\.unit_id \|\| null,\s*canonical_ingredient_id: i\.canonical_ingredient_id \|\| null,\s*\}\)\);\s*const \{ error: ingError \} = await supabase\.from\("recipe_ingredients"\)\.insert\(ingsToInsert\);\s*if \(ingError\) console\.error\("ING INSERT ERROR:", ingError\);\s*\}\s*\}/,
  newIngredientsBlock.trim()
);

fs.writeFileSync('src/app/actions/recipes.ts', f, 'utf8');
