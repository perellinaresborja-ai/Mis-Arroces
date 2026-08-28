const fs = require('fs');
const path = require('path');

const postOptionsPath = path.join('src', 'app', 'actions', 'post_options.ts');
let postOptionsCode = fs.readFileSync(postOptionsPath, 'utf8');

postOptionsCode += `
export async function updatePostContent(entityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('social_posts' as any)
    .update({ content })
    .eq('id', entityId)
    .eq('author_id', user.id)

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/[userParam]', 'layout')
}

export async function updateSessionContent(entityId: string, notes: string, rating: number, socarrat: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('cooking_sessions' as any)
    .update({ notes, rating, socarrat_level: socarrat })
    .eq('id', entityId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/[userParam]', 'layout')
}
`;

fs.writeFileSync(postOptionsPath, postOptionsCode);
console.log("UPDATED ACTIONS");
