"use server"

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/client"
import { toggleFollow } from "@/app/actions/social"

export interface ContactInput {
  name?: string
  email?: string
  tel?: string
}

export interface MatchedContactUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  privacyLevel: string
  isFollowing: boolean
  followStatus: string | null
  contactName: string
}

export interface UnmatchedContactItem {
  name: string
  email?: string
  tel?: string
}

export interface MatchContactsResponse {
  success: boolean
  error?: string
  matched: MatchedContactUser[]
  unmatched: UnmatchedContactItem[]
  inviteCode: string | null
  inviteUrl: string | null
}

export interface UserInviteInfo {
  success: boolean
  error?: string
  inviteCode: string | null
  inviteUrl: string | null
  username: string | null
  displayName: string | null
  referralsCount: number
}

const MAX_CONTACTS_BATCH = 50

/**
 * Returns current user's invite info and referral statistics.
 */
export async function getUserInviteInfoAction(): Promise<UserInviteInfo> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "No autorizado",
      inviteCode: null,
      inviteUrl: null,
      username: null,
      displayName: null,
      referralsCount: 0,
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, invite_code")
    .eq("id", user.id)
    .single()

  let inviteCode = profile?.invite_code || null

  // Ensure invite_code exists defensively
  if (!inviteCode) {
    const generated = Math.random().toString(36).substring(2, 10)
    await supabase.from("profiles").update({ invite_code: generated }).eq("id", user.id)
    inviteCode = generated
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es"
  const inviteUrl = `${siteUrl}/invite/${inviteCode}`

  // Count referrals where this user is the inviter
  const { count } = await supabase
    .from("invite_referrals" as any)
    .select("id", { count: "exact", head: true })
    .eq("inviter_id", user.id)

  return {
    success: true,
    inviteCode,
    inviteUrl,
    username: profile?.username || null,
    displayName: profile?.display_name || null,
    referralsCount: count || 0,
  }
}

/**
 * Securely and ephemerally matches selected contacts against registered users.
 * Anti-enumeration protections:
 * - Requires authenticated session.
 * - Caps batch size at MAX_CONTACTS_BATCH (50) to prevent scraping.
 * - Matches server-side in memory using service_role client.
 * - Never returns emails, phones, hashes, or auth identifiers to the client.
 * - Returns ONLY public profile data of matched users.
 * - Does NOT store or log any contact information in the database or server logs.
 */
export async function matchContactsAction(rawContacts: ContactInput[]): Promise<MatchContactsResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "No autorizado",
      matched: [],
      unmatched: [],
      inviteCode: null,
      inviteUrl: null,
    }
  }

  // Get current user's invite info
  const inviteInfo = await getUserInviteInfoAction()

  if (!Array.isArray(rawContacts) || rawContacts.length === 0) {
    return {
      success: true,
      matched: [],
      unmatched: [],
      inviteCode: inviteInfo.inviteCode,
      inviteUrl: inviteInfo.inviteUrl,
    }
  }

  // Cap batch size to prevent bulk enumeration
  const contacts = rawContacts.slice(0, MAX_CONTACTS_BATCH)

  // Map contacts by normalized email and phone for fast matching
  const emailToContactMap = new Map<string, ContactInput>()
  const validEmails: string[] = []

  const phoneToContactMap = new Map<string, ContactInput>()
  const validPhones: string[] = []

  const { normalizePhoneToE164 } = await import("@/lib/phone")

  for (const c of contacts) {
    const rawEmail = (c.email || "").trim().toLowerCase()
    if (rawEmail && rawEmail.includes("@") && rawEmail.length <= 100) {
      emailToContactMap.set(rawEmail, c)
      validEmails.push(rawEmail)
    }

    if (c.tel) {
      const normPhone = normalizePhoneToE164(c.tel)
      if (normPhone.valid && normPhone.e164) {
        phoneToContactMap.set(normPhone.e164, c)
        validPhones.push(normPhone.e164)
      }
    }
  }

  const matchedUserIds = new Set<string>()
  const contactNameByUserId = new Map<string, string>()

  if (validEmails.length > 0 || validPhones.length > 0) {
    try {
      const adminClient = getAdminClient()

      // 1. Check user_private_contacts for phone matches
      if (validPhones.length > 0) {
        try {
          const { data: phoneMatches } = await adminClient
            .from("user_private_contacts" as any)
            .select("user_id, phone_e164")
            .in("phone_e164", validPhones)

          for (const row of phoneMatches || []) {
            const uid = (row as any).user_id
            const pE164 = (row as any).phone_e164
            if (uid && uid !== user.id) {
              matchedUserIds.add(uid)
              const matchedContact = phoneToContactMap.get(pE164)
              if (matchedContact?.name) {
                contactNameByUserId.set(uid, matchedContact.name)
              }
            }
          }
        } catch (err) {
          console.warn("[matchContactsAction] user_private_contacts query warning:", err)
        }
      }

      // 2. Check auth users matching emails and user_metadata phones
      const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      const allAuthUsers = authData?.users || []

      for (const authUser of allAuthUsers) {
        // Never match the user with themselves
        if (authUser.id === user.id) continue

        let isMatch = false
        let contactInfo: ContactInput | undefined

        // Match email
        if (authUser.email) {
          const userEmail = authUser.email.trim().toLowerCase()
          if (emailToContactMap.has(userEmail)) {
            isMatch = true
            contactInfo = emailToContactMap.get(userEmail)
          }
        }

        // Match phone in auth metadata
        if (!isMatch && validPhones.length > 0) {
          const metaPhone = authUser.user_metadata?.phone_e164 || authUser.phone
          if (metaPhone && phoneToContactMap.has(metaPhone)) {
            isMatch = true
            contactInfo = phoneToContactMap.get(metaPhone)
          }
        }

        if (isMatch) {
          matchedUserIds.add(authUser.id)
          if (contactInfo?.name) {
            contactNameByUserId.set(authUser.id, contactInfo.name)
          }
        }
      }
    } catch (err) {
      console.error("[matchContactsAction] Error checking contact matches:", err)
    }
  }

  const matchedList: MatchedContactUser[] = []
  const matchedUserIdsArray = Array.from(matchedUserIds)

  if (matchedUserIdsArray.length > 0) {
    // Fetch public profile details for matched users
    const { data: profiles } = await supabase
      .from("profiles")
      .select(`
        id, username, display_name, privacy_level,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      `)
      .in("id", matchedUserIdsArray)

    if (profiles && profiles.length > 0) {
      // Check current user's follow status for each matched user
      const { data: followRecords } = await supabase
        .from("follows")
        .select("following_id, status")
        .eq("follower_id", user.id)
        .in("following_id", matchedUserIdsArray)

      const followMap = new Map<string, string>()
      for (const f of followRecords || []) {
        followMap.set(f.following_id, f.status)
      }

      const CDN_BASE = "https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media"

      for (const p of profiles) {
        const fStatus = followMap.get(p.id) || null
        const isFollowing = fStatus === "ACCEPTED" || fStatus === "PENDING"
        const avatarPath = (p.avatar as any)?.storage_path
        const avatarUrl = avatarPath ? `${CDN_BASE}/${avatarPath}` : null

        matchedList.push({
          id: p.id,
          username: p.username,
          displayName: p.display_name,
          avatarUrl,
          privacyLevel: p.privacy_level,
          isFollowing,
          followStatus: fStatus,
          contactName: contactNameByUserId.get(p.id) || p.display_name || p.username,
        })
      }
    }
  }

  // Deduplicate matched by user id
  const deduplicatedMatched = Array.from(
    new Map(matchedList.map((m) => [m.id, m])).values()
  )

  // Identify unmatched contacts for direct invitation (WhatsApp, SMS, link)
  const unmatchedList: UnmatchedContactItem[] = []
  for (const c of contacts) {
    const cEmail = (c.email || "").trim().toLowerCase()
    const normTel = c.tel ? normalizePhoneToE164(c.tel).e164 : ""
    let wasMatched = false

    if (cEmail && emailToContactMap.has(cEmail)) {
      for (const m of deduplicatedMatched) {
        if (contactNameByUserId.get(m.id) === c.name) {
          wasMatched = true
          break
        }
      }
    }

    if (!wasMatched && normTel && phoneToContactMap.has(normTel)) {
      for (const m of deduplicatedMatched) {
        if (contactNameByUserId.get(m.id) === c.name) {
          wasMatched = true
          break
        }
      }
    }

    if (!wasMatched && c.name) {
      unmatchedList.push({
        name: c.name,
        email: c.email,
        tel: c.tel,
      })
    }
  }

  return {
    success: true,
    matched: deduplicatedMatched,
    unmatched: unmatchedList,
    inviteCode: inviteInfo.inviteCode,
    inviteUrl: inviteInfo.inviteUrl,
  }
}

/**
 * Batch follow multiple matched contacts at once.
 * Excludes self, already followed, and deduplicates IDs.
 */
export async function followAllMatchesAction(targetUserIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "No autorizado" }

  // Deduplicate and filter out self
  const uniqueIds = Array.from(new Set(targetUserIds)).filter((id) => id !== user.id).slice(0, MAX_CONTACTS_BATCH)

  if (uniqueIds.length === 0) return { success: true, count: 0 }

  // Check which users are already followed
  const { data: existingFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .in("following_id", uniqueIds)

  const alreadyFollowed = new Set((existingFollows || []).map((f) => f.following_id))
  const toFollow = uniqueIds.filter((id) => !alreadyFollowed.has(id))

  let followedCount = 0
  for (const targetId of toFollow) {
    try {
      await toggleFollow(targetId, false, null)
      followedCount++
    } catch (err) {
      console.error(`[followAllMatchesAction] Failed to follow ${targetId}:`, err)
    }
  }

  return { success: true, count: followedCount }
}
