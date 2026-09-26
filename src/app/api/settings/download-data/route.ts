import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // 1. Perfil y Configuración
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: prefs } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle()
    
    // 2. Interacciones y Conexiones
    const { data: followers } = await supabase.from('follows').select('follower_id, created_at').eq('following_id', user.id)
    const { data: following } = await supabase.from('follows').select('following_id, created_at').eq('follower_id', user.id)
    const { data: blocks } = await supabase.from('blocks').select('*').eq('blocker_id', user.id)
    const { data: mutes } = await supabase.from('user_mutes').select('*').eq('muter_id', user.id)
    const { data: hidden_words } = await supabase.from('hidden_words').select('*').eq('user_id', user.id)
    const { data: acceptances } = await supabase.from('user_legal_acceptances').select('document_id, accepted_at, legal_documents(document_type, version)').eq('user_id', user.id)

    // 3. Contenido Generado
    const [recipesRes, sessionsRes, postsRes, storiesRes] = await Promise.all([
      supabase.from('recipes').select('*').eq('owner_id', user.id),
      supabase.from('cooking_sessions').select('*').eq('user_id', user.id),
      supabase.from('social_posts').select('*').eq('author_id', user.id),
      supabase.from('stories').select('*').eq('owner_id', user.id),
    ])

    // 4. Comentarios reales del usuario (en posts, recetas y sesiones)
    const [postCommentsRes, recipeCommentsRes, sessionCommentsRes] = await Promise.all([
      supabase.from('post_comments').select('*').eq('author_id', user.id),
      supabase.from('recipe_comments').select('*').eq('author_id', user.id),
      supabase.from('session_comments').select('*').eq('author_id', user.id),
    ])
    
    // 5. Guardados e Interacciones de contenido (tablas reales: saves, want_to_cook, shopping_lists)
    const [savesRes, wantToCookRes, shoppingListsRes] = await Promise.all([
      supabase.from('saves').select('*, recipe:recipes(id, name)').eq('user_id', user.id),
      supabase.from('want_to_cook').select('*, recipe:recipes(id, name)').eq('user_id', user.id),
      supabase.from('shopping_lists').select('*').eq('user_id', user.id),
    ])

    // 6. Me gusta y reacciones reales del usuario
    const [postLikesRes, recipeLikesRes, sessionLikesRes, commentLikesRes] = await Promise.all([
      supabase.from('post_likes').select('*').eq('user_id', user.id),
      supabase.from('recipe_likes').select('*').eq('user_id', user.id),
      supabase.from('session_likes').select('*').eq('user_id', user.id),
      supabase.from('post_comment_likes').select('*').eq('user_id', user.id),
    ])

    // 7. Mensajes Directos (DMs) - Solo enviados por el usuario
    const { data: sent_messages } = await supabase
      .from('messages')
      .select('id, content, created_at, message_attachments(storage_path)')
      .eq('sender_id', user.id)

    const exportData = {
      generated_at: new Date().toISOString(),
      account: {
        user_id: user.id,
        email: user.email,
        profile: profile,
        preferences: prefs,
        legal_acceptances: acceptances
      },
      connections_and_moderation: {
        followers: followers,
        following: following,
        blocks: blocks,
        mutes: mutes,
        hidden_words: hidden_words
      },
      content: {
        recipes: recipesRes.data || [],
        sessions: sessionsRes.data || [],
        posts: postsRes.data || [],
        stories: storiesRes.data || [],
        comments: {
          post_comments: postCommentsRes.data || [],
          recipe_comments: recipeCommentsRes.data || [],
          session_comments: sessionCommentsRes.data || [],
        },
        saved_items: {
          saves: savesRes.data || [],
          want_to_cook: wantToCookRes.data || [],
        },
        shopping_lists: shoppingListsRes.data || [],
        reactions: {
          post_likes: postLikesRes.data || [],
          recipe_likes: recipeLikesRes.data || [],
          session_likes: sessionLikesRes.data || [],
          comment_likes: commentLikesRes.data || [],
        },
        sent_messages: sent_messages || []
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
