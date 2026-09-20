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
    const { data: recipes } = await supabase.from('recipes').select('*').eq('owner_id', user.id)
    const { data: sessions } = await supabase.from('cooking_sessions').select('*').eq('user_id', user.id)
    const { data: posts } = await supabase.from('social_posts').select('*').eq('author_id', user.id)
    const { data: comments } = await (supabase as any).from('comments').select('*').eq('author_id', user.id)
    const { data: stories } = await supabase.from('stories').select('*').eq('owner_id', user.id)
    
    // 4. Guardados e Interacciones de contenido
    const { data: bookmarks } = await supabase.from('bookmarks').select('*').eq('user_id', user.id)
    const { data: shopping_lists } = await supabase.from('shopping_lists').select('*').eq('user_id', user.id)
    const { data: reactions } = await (supabase as any).from('reactions').select('*').eq('user_id', user.id)

    // 5. Mensajes Directos (DMs) - Solo enviados
    // Para proteger la privacidad de terceros, exportamos SÓLO los mensajes que el propio usuario ha redactado y enviado.
    // Excluimos información sobre el receptor (receiver_id) para no exponer con quién habló,
    // y solo exportamos el contenido del mensaje y el timestamp de cuándo lo envió.
    const { data: sent_messages } = await supabase.from('messages').select('id, content, created_at, message_attachments(storage_path)').eq('sender_id', user.id)

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
        recipes: recipes,
        sessions: sessions,
        posts: posts,
        comments: comments,
        stories: stories,
        bookmarks: bookmarks,
        shopping_lists: shopping_lists,
        reactions: reactions,
        sent_messages: sent_messages
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
