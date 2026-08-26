const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
  const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
  
  const supabase = createClient(url, key);
  
  // get a recipe id
  const { data: recipe } = await supabase.from('recipes').select('id').limit(1).single();
  if(!recipe) return console.log('no recipes');
  
  console.log('Testing recipe:', recipe.id);
  
  const { data: fetchRecipe, error } = await supabase
    .from("recipes")
    .select("recipe_ingredients(*, unit:units(id, name, symbol))")
    .eq("id", recipe.id)
    .single();
    
  console.log('Result:', JSON.stringify(fetchRecipe, null, 2));
  console.log('Error:', error);
}

test();
