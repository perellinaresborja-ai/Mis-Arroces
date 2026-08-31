const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from("recipe_ingredients")
    .select(`
      id, display_text,
      ingredient:ingredients!recipe_ingredients_canonical_ingredient_id_fkey(
        id,
        canonical_name,
        ingredient_allergens(allergens(*))
      )
    `)
    .not('canonical_ingredient_id', 'is', null)
    .limit(10);
  console.log(JSON.stringify(data, null, 2));
}
test();
