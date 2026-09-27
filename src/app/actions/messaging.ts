"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"
import { revalidatePath, unstable_noStore } from "next/cache"
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
  unstable_noStore();
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. Fetch excluded users (blocks and mutes) AND user conversation members concurrently
  const [blocksRes, mutesRes, membersRes] = await Promise.all([
    supabase.from("blocks").select("blocker_id, blocked_id").or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    supabase.from("user_mutes").select("muted_id").eq("muter_id", user.id),
    supabase
      .from('conversation_members')
      .select('*, conversations(*)')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .order('is_pinned', { ascending: false })
      .order('last_read_at', { ascending: false })
  ])

  const blocks = blocksRes.data || []
  const mutes = mutesRes.data || []
  const convMembers = membersRes.data || []

  if (membersRes.error || convMembers.length === 0) return []

  const blockedIds = blocks.map((b: any) => b.blocker_id === user.id ? b.blocked_id : b.blocker_id)
  const mutedIds = mutes.map((m: any) => m.muted_id)
  const excludedUserIds = Array.from(new Set([...blockedIds, ...mutedIds]))

  const convIds = convMembers.map(cm => cm.conversation_id)

  // 2. Batch-fetch all other members in 1 single query instead of N queries
  const { data: allOthers } = await supabase
    .from('conversation_members')
    .select('conversation_id, status, user_id, user:profiles!inner(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))')
    .in('conversation_id', convIds)
    .neq('user_id', user.id)

  const otherMemberMap = new Map<string, any>()
  if (allOthers) {
    for (const om of allOthers) {
      otherMemberMap.set(om.conversation_id, om)
    }
  }

  // 3. Filter out conversations with blocked/muted users
  const validMembers = convMembers.filter(cm => {
    const otherMember = otherMemberMap.get(cm.conversation_id)
    return !(otherMember && excludedUserIds.includes(otherMember.user_id))
  })

  if (validMembers.length === 0) return []

  // 4. Batch resolve unread counts in 1 single query across all valid conversations
  const validConvIds = validMembers.map(cm => cm.conversation_id)
  const memberLastReadMap = new Map<string, string | null>()
  let earliestLastRead: string | null = null

  for (const cm of validMembers) {
    memberLastReadMap.set(cm.conversation_id, cm.last_read_at || null)
    if (!cm.last_read_at) {
      earliestLastRead = '1970-01-01T00:00:00Z'
    } else if (earliestLastRead !== '1970-01-01T00:00:00Z') {
      if (!earliestLastRead || cm.last_read_at < earliestLastRead) {
        earliestLastRead = cm.last_read_at
      }
    }
  }

  const unreadPromise = earliestLastRead
    ? supabase
        .from('messages')
        .select('conversation_id, created_at')
        .in('conversation_id', validConvIds)
        .neq('sender_id', user.id)
        .gt('created_at', earliestLastRead)
        .is('deleted_at', null)
    : Promise.resolve({ data: [] } as any)

  // 5. Concurrently resolve last message for each valid conversation
  const lastMessagesPromise = Promise.all(
    validMembers.map(cm =>
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', cm.conversation_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  )

  const [unreadRes, lastMessagesRes] = await Promise.all([
    unreadPromise,
    lastMessagesPromise
  ])

  const unreadCountsMap = new Map<string, number>()
  if (unreadRes.data) {
    for (const msg of unreadRes.data) {
      const lastRead = memberLastReadMap.get(msg.conversation_id)
      if (!lastRead || msg.created_at > lastRead) {
        unreadCountsMap.set(
          msg.conversation_id,
          (unreadCountsMap.get(msg.conversation_id) || 0) + 1
        )
      }
    }
  }

  const conversations = validMembers.map((cm, idx) => {
    const otherMember = otherMemberMap.get(cm.conversation_id)
    const lastMessage = lastMessagesRes[idx]?.data || null
    const unreadCount = unreadCountsMap.get(cm.conversation_id) || 0

    return {
      ...cm,
      otherMember,
      lastMessage,
      unreadCount
    }
  })

  // Sort by last message time or created_at
  conversations.sort((a, b) => {
    const timeA = new Date(a.lastMessage?.created_at || a.conversations?.created_at || 0).getTime()
    const timeB = new Date(b.lastMessage?.created_at || b.conversations?.created_at || 0).getTime()
    return timeB - timeA
  })

  return conversations
}

export async function updateReadStatus(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Find the latest message timestamp to avoid clock skew
  const { data: latestMsg } = await supabase
    .from('messages')
    .select('created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const readAt = latestMsg?.created_at || new Date().toISOString()

  const { error: updateError } = await supabase
    .from('conversation_members')
    .update({ last_read_at: readAt })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error("Failed to update read status:", updateError.message)
  }
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

  // Unarchive for all members so it pops back into view
  await supabase.from('conversation_members')
    .update({ archived_at: null })
    .eq('conversation_id', conversationId)

  // Notify the other user (assuming exactly 2 members)
  const { data: members } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
  
  if (members && members.length > 0) {
    const targetUserId = members[0].user_id
    await createNotification(targetUserId, 'NEW_MESSAGE', 'conversation', conversationId, { message_id: msg.id, conversation_id: conversationId, message_type: type })
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
    .select('*, message_attachments(storage_path), parent:messages!reply_to_id(type, body), message_reactions(id, emoji, user_id)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(60)

  if (error || !data) return []

  // Re-order ascending for chat display
  const orderedData = [...data].reverse()

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
      serviceKey
    )

    // Gather all paths to sign in a single batch
    const pathsToSign: string[] = []
    for (const msg of orderedData) {
      const path = msg.message_attachments?.[0]?.storage_path
      if (path) pathsToSign.push(path)
    }

    if (pathsToSign.length > 0) {
      const { data: signedList } = await adminSupabase.storage
        .from('message_media')
        .createSignedUrls(pathsToSign, 3600)

      const signedMap = new Map<string, string>()
      if (signedList) {
        for (const item of signedList) {
          if (item.path && item.signedUrl) {
            signedMap.set(item.path, item.signedUrl)
          }
        }
      }

      return orderedData.map(msg => {
        const path = msg.message_attachments?.[0]?.storage_path
        const signedUrl = path ? signedMap.get(path) : undefined
        return { ...msg, signed_url: signedUrl }
      })
    }
  }

  return orderedData.map(msg => ({ ...msg, signed_url: undefined }))
}




export async function notifyNewMessage(conversationId: string, messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: members } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id);
  
  if (members && members.length > 0) {
    await createNotification(members[0].user_id, 'NEW_MESSAGE', 'conversation', conversationId, { message_id: messageId, conversation_id: conversationId });
  }
}

export async function unsendMessage(messageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function togglePinConversation(conversationId: string, currentPin: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { error } = await supabase.from('conversation_members')
    .update({ is_pinned: !currentPin })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
  return { success: !error, error: error?.message }
}

export async function archiveConversation(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { error } = await supabase.from('conversation_members')
    .update({ archived_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
  return { success: !error, error: error?.message }
}

export async function searchUsersForNewChat(query?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const cleanQ = query?.trim().replace(/^@+/, '')

  if (cleanQ && cleanQ.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .neq("id", user.id)
      .or(`username.ilike.%${cleanQ}%,display_name.ilike.%${cleanQ}%`)
      .limit(15)

    if (error) {
      console.error("searchUsersForNewChat error:", error)
      return []
    }
    return data || []
  }

  // Si no hay query, mostrar primero a los usuarios seguidos
  const { data: follows } = await supabase
    .from("follows")
    .select("following:profiles!follows_following_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))")
    .eq("follower_id", user.id)
    .eq("status", "ACCEPTED")
    .limit(15)

  if (follows && follows.length > 0) {
    const list = follows.map((f: any) => f.following).filter(Boolean)
    if (list.length > 0) return list
  }

  // Fallback a perfiles públicos si no sigue a nadie
  const { data: popular } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
    .neq("id", user.id)
    .eq("privacy_level", "PUBLIC")
    .limit(10)

  return popular || []
}
