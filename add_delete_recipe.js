const fs = require('fs');
let code = fs.readFileSync('src/app/actions/recipes.ts', 'utf8');

if (!code.includes('export async function deleteRecipe')) {
  code += `\n\nexport async function deleteRecipe(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Delete recipe error:", error)
    throw new Error(error.message)
  }
}`;
  fs.writeFileSync('src/app/actions/recipes.ts', code);
}
