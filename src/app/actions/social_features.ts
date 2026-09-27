"use server"



import { createClient } from "@/lib/supabase/server"

export async function searchUsersForMention(query: string) {
  if (!query || query.length < 1) return []
  const supabase = await createClient()
  
  // Basic search: in a real app, this would prioritize followed users.
  // For V1, simple ilike on username or display_name
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(5)
    
  if (error) {
    console.error("searchUsersForMention error", error)
    return []
  }
  return data
}

export async function searchHashtags(query: string) {
  if (!query || query.length < 1) return []
  const supabase = await createClient()
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  
  const { data, error } = await supabase
    .from("hashtags")
    .select("id, name, normalized_name")
    .ilike("normalized_name", `%${normalizedQuery}%`)
    .limit(5)
    
  if (error) return []
  return data
}

export async function extractSocialTokens(text: string) {
  if (!text) return { mentions: [], hashtags: [] }

  const tokenRegex = /(?:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))|(?:(?<![a-zA-Z0-9._%+-])@([a-zA-Z0-9_.-]+))|(?:(?<![a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ])#([a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+))/gu

  const mentions: string[] = []
  const hashtags: string[] = []
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match[1]) {
      // Email -> ignore
      continue
    }
    if (match[2]) {
      let rawUsername = match[2]
      const trailingPunctMatch = rawUsername.match(/[.,:;!?'"()\[\]{}«»“”]+$/)
      if (trailingPunctMatch) {
        rawUsername = rawUsername.slice(0, -trailingPunctMatch[0].length)
      }
      if (rawUsername.length > 0) {
        mentions.push(rawUsername.toLowerCase())
      }
    } else if (match[3]) {
      let rawTag = match[3]
      const trailingPunctMatch = rawTag.match(/[.,:;!?'"()\[\]{}«»“”]+$/)
      if (trailingPunctMatch) {
        rawTag = rawTag.slice(0, -trailingPunctMatch[0].length)
      }
      if (rawTag.length > 0) {
        hashtags.push(rawTag)
      }
    }
  }
  
  return {
    mentions: [...new Set(mentions)],
    hashtags: [...new Set(hashtags)]
  }
}

export async function parseAndSaveMentionsAndHashtags(text: string, entityType: string, entityId: string, actorId: string) {
  const supabase = await createClient()
  const { mentions, hashtags } = await extractSocialTokens(text)
  
  // Clear existing to handle edits properly
  await supabase.from("entity_hashtags").delete().match({ entity_type: entityType, entity_id: entityId })
  await supabase.from("mentions").delete().match({ entity_type: entityType, entity_id: entityId, actor_id: actorId })
  
  // Process Hashtags
  if (hashtags.length > 0) {
    for (const tag of hashtags) {
      const normalized = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      
      // Upsert hashtag
      const { data: htData } = await supabase
        .from("hashtags")
        .select("id")
        .eq("normalized_name", normalized)
        .maybeSingle()
        
      let hashtagId = htData?.id
      if (!hashtagId) {
        const { data: newHt } = await supabase
          .from("hashtags")
          .insert({ name: tag, normalized_name: normalized })
          .select("id")
          .maybeSingle()
        hashtagId = newHt?.id
      }
      
      if (hashtagId) {
        // Link to entity (ignore errors on duplicate)
        await supabase.from("entity_hashtags").upsert({
          hashtag_id: hashtagId,
          entity_type: entityType,
          entity_id: entityId
        }, { onConflict: "hashtag_id,entity_type,entity_id" })
      }
    }
  }
  
  // Process Mentions
  if (mentions.length > 0) {
    for (const username of mentions) {
      // Find user by username
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle()
        
      if (profile) {
        // Insert mention
        await supabase.from("mentions").upsert({
          actor_id: actorId,
          mentioned_id: profile.id,
          entity_type: entityType,
          entity_id: entityId
        }, { onConflict: "mentioned_id,entity_type,entity_id" })
        
        if (profile.id !== actorId) {
          try {
            const { createNotification } = await import("@/app/actions/notifications")
            await createNotification(
              profile.id,
              "MENTION",
              entityType === "social_post" ? "post" : entityType,
              entityId
            )
          } catch (e) {
            console.error("Failed to send mention notification:", e)
          }
        }
      }
    }
  }
}

export async function saveTags(entityType: string, entityId: string, authorId: string, tags: any[]) {
  const supabase = await createClient()
  
  // Clear old tags
  await supabase.from("tagged_users").delete().match({ entity_type: entityType, entity_id: entityId, author_id: authorId })
  
  // Insert new tags
  if (tags.length > 0) {
    const inserts = tags.map(t => ({
      author_id: authorId,
      tagged_id: t.id,
      entity_type: entityType,
      entity_id: entityId
    }))
    await supabase.from("tagged_users").insert(inserts)

    try {
      const { createNotification } = await import("@/app/actions/notifications")
      for (const t of tags) {
        if (t.id && t.id !== authorId) {
          await createNotification(
            t.id,
            "TAG",
            entityType === "social_post" ? "post" : entityType,
            entityId
          ).catch(() => {})
        }
      }
    } catch (e) {
      console.error("Failed to send tag notifications:", e)
    }
  }
}

export async function removeSelfTag(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from("tagged_users").delete().match({ 
    entity_type: entityType, 
    entity_id: entityId,
    tagged_id: user.id
  })
}


