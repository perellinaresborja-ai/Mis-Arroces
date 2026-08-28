const fs = require('fs');
let code = fs.readFileSync('src/app/actions/post_options.ts', 'utf8');

const newAction = `
export async function togglePin(entityType: string, entityId: string, currentState: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  let table = 'social_posts'
  let authorField = 'author_id'
  
  if (entityType === 'recipe') {
    table = 'recipes'
    authorField = 'owner_id'
  } else if (entityType === 'session') {
    table = 'cooking_sessions'
    authorField = 'user_id'
  }

  // If trying to pin, check if already pinned 3 items across all tables
  if (!currentState) {
    const { data: pinnedRecipes } = await supabase.from('recipes').select('id').eq('owner_id', user.id).eq('is_pinned', true)
    const { data: pinnedSessions } = await supabase.from('cooking_sessions').select('id').eq('user_id', user.id).eq('is_pinned', true)
    const { data: pinnedPosts } = await supabase.from('social_posts').select('id').eq('author_id', user.id).eq('is_pinned', true)
    
    const totalPinned = (pinnedRecipes?.length || 0) + (pinnedSessions?.length || 0) + (pinnedPosts?.length || 0)
    
    if (totalPinned >= 3) {
      throw new Error("No puedes fijar más de 3 publicaciones. Desfija alguna primero.")
    }
  }

  const { error } = await supabase.from(table as any)
    .update({ is_pinned: !currentState })
    .eq('id', entityId)
    .eq(authorField, user.id)

  if (error) throw error

  revalidatePath('/[userParam]', 'layout')
}
`;

code += `\n${newAction}`;
fs.writeFileSync('src/app/actions/post_options.ts', code);
console.log("ADDED TOGGLE PIN");
