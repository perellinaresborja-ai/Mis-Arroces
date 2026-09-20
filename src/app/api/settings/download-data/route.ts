import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // 1. Perfil
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    // 2. Seguidores y Seguidos
    const { data: followers } = await supabase.from('follows').select('follower_id, created_at').eq('following_id', user.id)
    const { data: following } = await supabase.from('follows').select('following_id, created_at').eq('follower_id', user.id)
    
    // 3. Recetas publicadas
    const { data: recipes } = await supabase.from('recipes').select('*').eq('owner_id', user.id)
    
    // 4. Publicaciones sociales
    const { data: posts } = await supabase.from('social_posts').select('*').eq('author_id', user.id)
    
    // 5. Guardados
    const { data: bookmarks } = await supabase.from('bookmarks').select('*').eq('user_id', user.id)
    
    // 6. Listas de compra
    const { data: shopping_lists } = await supabase.from('shopping_lists').select('*').eq('user_id', user.id)

    // Assemble Data Export
    // Not exporting DMs here per privacy rules (requires complex sender validation vs receiver data visibility)
    const exportData = {
      generated_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile,
      connections: {
        followers: followers,
        following: following
      },
      content: {
        recipes: recipes,
        posts: posts,
        bookmarks: bookmarks,
        shopping_lists: shopping_lists
      }
    }

    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="misarroces_datos_${new Date().toISOString().split('T')[0]}.json"`,
      }
    })
  } catch (err: any) {
    console.error('Error exporting data:', err)
    return NextResponse.json({ error: 'Error exportando datos' }, { status: 500 })
  }
}
