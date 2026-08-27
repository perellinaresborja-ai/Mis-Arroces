"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function getOrCreateConversation(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.rpc('get_or_create_conversation', { target_user_id: targetUserId })
  
  if (error) {
    if (error.message.includes('Blocked')) throw new Error('Blocked')
    if (error.message.includes('Invalid user')) throw new Error('Invalid user')
    throw new Error('Failed to create conversation')
  }
  
  return data
}

export async function fetchConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Fetch all members for conversations this user is in
  const { data: convMembers, error: membersError } = await supabase
    .from('conversation_members')
    .select('*, conversations(*)')
    .eq('user_id', user.id)
    .order('last_read_at', { ascending: false })

  if (membersError || !convMembers) return []

  const conversations = []
  
  for (const cm of convMembers) {
    // Get other member details
    const { data: others } = await supabase
      .from('conversation_members')
      .select('*, user:profiles!inner(id, username, display_name, avatar_media_id, avatar_media_id)')
      .eq('conversation_id', cm.conversation_id)
      .neq('user_id', user.id)
      .limit(1)

    const otherMember = others?.[0]

    // Get last message
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', cm.conversation_id)
      .order('created_at', { ascending: false })
      .limit(1)

    // Unread count (messages created after last_read_at)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', cm.conversation_id)
      .neq('sender_id', user.id)
      .gt('created_at', cm.last_read_at)

    conversations.push({
      ...cm,
      otherMember,
      lastMessage: lastMessage?.[0] || null,
      unreadCount: unreadCount || 0
    })
  }

  // Sort by last message time or created_at
  conversations.sort((a, b) => {
    const timeA = new Date(a.lastMessage?.created_at || a.conversations.created_at).getTime()
    const timeB = new Date(b.lastMessage?.created_at || b.conversations.created_at).getTime()
    return timeB - timeA
  })

  return conversations
}

export async function updateReadStatus(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
}

export async function sendMessage(params: { conversationId: string; type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'RECIPE' | 'SESSION' | 'STORY'; body?: string | null; entityId?: string | null }) {
  const { conversationId, type, body, entityId } = params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // The DB RLS ensures you can only insert if active member.
  const { data: msg, error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    type,
    body: body || null,
    entity_id: entityId || null
  }).select().single()

  if (error || !msg) throw new Error("Failed to send message: " + (error?.message || ""))

  // Notify the other user (assuming exactly 2 members)
  const { data: members } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
  
  if (members && members.length > 0) {
    const targetUserId = members[0].user_id
    await createNotification(targetUserId, 'NEW_MESSAGE', conversationId, user.id, { message_id: msg.id })
  }

  return { success: true, id: msg.id }
}

export async function acceptRequest(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase
    .from('conversation_members')
    .update({ status: 'ACTIVE' })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .eq('status', 'REQUEST')
    
  revalidatePath("/messages")
}

export async function rejectRequest(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase
    .from('conversation_members')
    .update({ status: 'REJECTED' })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .eq('status', 'REQUEST')
    
  revalidatePath("/messages")
}

export async function fetchMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('messages')
    .select('*, message_attachments(storage_path)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    )
    const result = []
    for (const msg of data) {
      let signedUrl = undefined
      if (msg.message_attachments && msg.message_attachments.length > 0) {
        const path = msg.message_attachments[0].storage_path
        if (path) {
          const { data: signed } = await adminSupabase.storage.from('message_media').createSignedUrl(path, 3600)
          if (signed) {
            signedUrl = signed.signedUrl
          }
        }
      }
      result.push({ ...msg, signed_url: signedUrl })
    }
    return result
  }

  return data.map(msg => ({ ...msg, signed_url: undefined }))
}



