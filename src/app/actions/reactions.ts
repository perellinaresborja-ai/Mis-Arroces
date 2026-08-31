"use server"
import { createClient } from "@/lib/supabase/server"

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const _supabase = await createClient()
  const supabase = _supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('message_reactions')
    .select('id, emoji')
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.emoji === emoji) {
      await supabase.from('message_reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('message_reactions').update({ emoji }).eq('id', existing.id)
    }
  } else {
    await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: user.id,
      emoji
    })
    
    // Notifications
    const { data: msg } = await supabase.from('messages').select('sender_id, type').eq('id', messageId).single()
    if (msg && msg.sender_id !== user.id) {
       let msgDesc = 'tu mensaje'
       if (msg.type === 'IMAGE') msgDesc = 'tu foto'
       if (msg.type === 'VIDEO') msgDesc = 'tu vídeo'
       if (msg.type === 'STORY') msgDesc = 'tu historia compartida'
       if (msg.type === 'RECIPE') msgDesc = 'tu receta compartida'
       
       await supabase.from('notifications').insert({
         recipient_id: msg.sender_id,
         actor_id: user.id,
         type: 'LIKE',
         entity_type: 'MESSAGE',
         entity_id: messageId,
         payload: { content: `reaccionó ${emoji} a ${msgDesc}.` }
       })
    }
  }
}
