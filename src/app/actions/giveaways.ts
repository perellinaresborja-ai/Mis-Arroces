// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/client"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import {
  Giveaway,
  GiveawayParticipant,
  GiveawayResultItem,
  CreateGiveawayInput
} from "@/types/giveaway"
import { createNotification } from "@/app/actions/notifications"
import { trackEvent } from "@/app/actions/analytics"

/**
 * Obtener un sorteo por el ID de la publicación asociada
 */
export async function getGiveawayByPostId(postId: string): Promise<Giveaway | null> {
  const adminClient = getAdminClient()

  const { data, error } = await adminClient
    .from("post_giveaways")
    .select(`
      *,
      organizer:profiles!post_giveaways_organizer_id_fkey(
        id, username, display_name,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      ),
      results:giveaway_results(
        id, giveaway_id, user_id, role, position, status,
        selected_at, replaced_at, replacement_reason, replaced_by_user_id,
        user:profiles!giveaway_results_user_id_fkey(
          id, username, display_name,
          avatar:media_assets!fk_profiles_avatar(storage_path)
        ),
        replaced_by_user:profiles!giveaway_results_replaced_by_user_id_fkey(
          id, username, display_name,
          avatar:media_assets!fk_profiles_avatar(storage_path)
        )
      )
    `)
    .eq("post_id", postId)
    .maybeSingle()

  if (error || !data) return null

  // Si el sorteo está ACTIVO pero ya venció la fecha de cierre, cerramos lógicamente
  if (data.status === "ACTIVE" && new Date(data.ends_at) <= new Date()) {
    try {
      await closeGiveawayLogical(data.id)
      data.status = "CLOSED"
      data.closed_at = new Date().toISOString()
    } catch (e) {
      console.error("[GIVEAWAY] Error al auto-cerrar sorteo vencido:", e)
    }
  }

  // Ordenar resultados por rol (WINNER primero) y posición
  if (data.results) {
    data.results.sort((a: any, b: any) => {
      if (a.role !== b.role) return a.role === "WINNER" ? -1 : 1
      return a.position - b.position
    })
  }

  return data as Giveaway
}

/**
 * Obtener un certificado público por su código único humano (ej: MR-2026-000001)
 */
export async function getGiveawayByCertificate(certificateCode: string): Promise<Giveaway | null> {
  const adminClient = getAdminClient()

  const { data, error } = await adminClient
    .from("post_giveaways")
    .select(`
      *,
      organizer:profiles!post_giveaways_organizer_id_fkey(
        id, username, display_name,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      ),
      results:giveaway_results(
        id, giveaway_id, user_id, role, position, status,
        selected_at, replaced_at, replacement_reason, replaced_by_user_id,
        user:profiles!giveaway_results_user_id_fkey(
          id, username, display_name,
          avatar:media_assets!fk_profiles_avatar(storage_path)
        ),
        replaced_by_user:profiles!giveaway_results_replaced_by_user_id_fkey(
          id, username, display_name,
          avatar:media_assets!fk_profiles_avatar(storage_path)
        )
      )
    `)
    .eq("certificate_code", certificateCode.trim())
    .maybeSingle()

  if (error || !data) return null

  if (data.results) {
    data.results.sort((a: any, b: any) => {
      if (a.role !== b.role) return a.role === "WINNER" ? -1 : 1
      return a.position - b.position
    })
  }

  // Cargar historial de auditoría
  try {
    const { data: logs } = await adminClient
      .from("giveaway_audit_log")
      .select("id, action, details, created_at, actor:profiles(id, username, display_name)")
      .eq("giveaway_id", data.id)
      .order("created_at", { ascending: true })

    data.audit_logs = (logs as any) || []
  } catch (e) {
    console.error("[GIVEAWAY] Error al cargar logs de auditoría:", e)
  }

  return data as Giveaway
}

/**
 * Comprobar el estado de participación del usuario autenticado en una publicación
 */
export async function getUserGiveawayStatus(postId: string): Promise<{
  isParticipating: boolean
  isEligible: boolean
  isOrganizer: boolean
  checks: {
    follow: boolean
    like: boolean
    comment: boolean
    mentions: boolean
    keyword: boolean
  }
  missingCriteria: string[]
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const giveaway = await getGiveawayByPostId(postId)
  if (!giveaway) return null

  const isOrganizer = giveaway.organizer_id === user.id
  if (isOrganizer) {
    return {
      isParticipating: false,
      isEligible: false,
      isOrganizer: true,
      checks: { follow: true, like: true, comment: true, mentions: true, keyword: true },
      missingCriteria: ["El organizador no puede participar en su propio sorteo"]
    }
  }

  const adminClient = getAdminClient()

  // Si ya está cerrado o sorteado, consultar directamente el snapshot inmutable
  if (giveaway.status === "CLOSED" || giveaway.status === "DRAWN") {
    const { data: snap } = await adminClient
      .from("giveaway_participants_snapshot")
      .select("*")
      .eq("giveaway_id", giveaway.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!snap) {
      return {
        isParticipating: false,
        isEligible: false,
        isOrganizer: false,
        checks: { follow: false, like: false, comment: false, mentions: false, keyword: false },
        missingCriteria: ["No participaste antes del cierre del sorteo"]
      }
    }

    return {
      isParticipating: true,
      isEligible: snap.is_eligible,
      isOrganizer: false,
      checks: {
        follow: snap.has_follow,
        like: snap.has_like,
        comment: snap.has_comment,
        mentions: snap.mentions_count >= giveaway.min_mentions,
        keyword: snap.has_keyword
      },
      missingCriteria: snap.missing_criteria || []
    }
  }

  // Si está ACTIVO, calcular en tiempo real contra acciones reales
  const [likeRes, commentsRes, followRes, profileRes] = await Promise.all([
    adminClient.from("post_likes").select("created_at").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
    adminClient.from("post_comments").select("id, content, created_at").eq("post_id", postId).eq("author_id", user.id),
    adminClient.from("follows").select("status").eq("follower_id", user.id).eq("following_id", giveaway.organizer_id).eq("status", "ACCEPTED").maybeSingle(),
    adminClient.from("profiles").select("username").eq("id", user.id).single()
  ])

  const username = profileRes.data?.username?.toLowerCase().replace(/^@/, "") || ""
  const isExcluded = (giveaway.excluded_usernames || []).some(
    (u) => u.toLowerCase().replace(/^@/, "") === username
  )

  const hasLike = Boolean(likeRes.data)
  const userComments = commentsRes.data || []
  const hasComment = userComments.length > 0
  const hasFollow = Boolean(followRes.data)

  // Menciones
  let hasMentions = true
  let maxMentions = 0
  if (giveaway.min_mentions > 0) {
    if (userComments.length === 0) {
      hasMentions = false
    } else {
      const commentIds = userComments.map((c) => c.id)
      const { data: mentionsData } = await adminClient
        .from("mentions")
        .select("entity_id, mentioned_id")
        .eq("entity_type", "post_comment")
        .in("entity_id", commentIds)

      const mentionMap: Record<string, Set<string>> = {}
      ;(mentionsData || []).forEach((m) => {
        if (!mentionMap[m.entity_id]) mentionMap[m.entity_id] = new Set()
        mentionMap[m.entity_id].add(m.mentioned_id)
      })

      // Fallback a regex en caso de comentarios recién guardados
      userComments.forEach((c) => {
        const inDbCount = mentionMap[c.id]?.size || 0
        const textMatches = (c.content || "").match(/(?:^|\s)@([a-zA-Z0-9_.-]+)/g)
        const textCount = textMatches ? new Set(textMatches.map((t) => t.trim().toLowerCase())).size : 0
        const effective = Math.max(inDbCount, textCount)
        if (effective > maxMentions) maxMentions = effective
      })

      hasMentions = maxMentions >= giveaway.min_mentions
    }
  }

  // Palabra clave / hashtag
  let hasKeyword = true
  if (giveaway.required_keyword && giveaway.required_keyword.trim()) {
    const kw = giveaway.required_keyword.trim().toLowerCase()
    hasKeyword = userComments.some((c) => (c.content || "").toLowerCase().includes(kw))
  }

  const missingCriteria: string[] = []
  if (isExcluded) missingCriteria.push("Cuenta excluida por el organizador")
  if (giveaway.require_follow && !hasFollow) missingCriteria.push("Seguir a la cuenta organizadora")
  if (giveaway.require_like && !hasLike) missingCriteria.push("Dar Me gusta a la publicación")
  if (giveaway.require_comment && !hasComment) missingCriteria.push("Dejar un comentario")
  if (giveaway.min_mentions > 0 && !hasMentions) {
    missingCriteria.push(`Mencionar al menos a ${giveaway.min_mentions} persona${giveaway.min_mentions > 1 ? "s" : ""} en un comentario`)
  }
  if (giveaway.required_keyword && !hasKeyword) {
    missingCriteria.push(`Incluir la palabra o hashtag "${giveaway.required_keyword}" en un comentario`)
  }

  const isEligible = !isExcluded && missingCriteria.length === 0
  const isParticipating = hasLike || hasComment

  return {
    isParticipating,
    isEligible,
    isOrganizer: false,
    checks: {
      follow: hasFollow,
      like: hasLike,
      comment: hasComment,
      mentions: hasMentions,
      keyword: hasKeyword
    },
    missingCriteria
  }
}

/**
 * Obtener la lista completa de participantes para el organizador (o auditores)
 */
export async function getGiveawayParticipantsServer(giveawayId: string): Promise<{
  giveaway: Giveaway
  participants: GiveawayParticipant[]
  totalCandidates: number
  eligibleCount: number
  ineligibleCount: number
}> {
  const adminClient = getAdminClient()

  const { data: giveaway, error: gErr } = await adminClient
    .from("post_giveaways")
    .select(`
      *,
      organizer:profiles!post_giveaways_organizer_id_fkey(
        id, username, display_name,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      )
    `)
    .eq("id", giveawayId)
    .single()

  if (gErr || !giveaway) throw new Error("Sorteo no encontrado")

  // Si ya existe snapshot inmutable (sorteo CERRADO o SORTEADO), leer snapshot
  if (giveaway.status === "CLOSED" || giveaway.status === "DRAWN") {
    const { data: snapshots } = await adminClient
      .from("giveaway_participants_snapshot")
      .select(`
        *,
        user:profiles!giveaway_participants_snapshot_user_id_fkey(
          id, username, display_name,
          avatar:media_assets!fk_profiles_avatar(storage_path)
        )
      `)
      .eq("giveaway_id", giveawayId)
      .order("snapshot_at", { ascending: true })

    const participants: GiveawayParticipant[] = (snapshots || []).map((s: any) => ({
      userId: s.user_id,
      username: s.user?.username || "usuario",
      displayName: s.user?.display_name || `@${s.user?.username || "usuario"}`,
      avatarUrl: s.user?.avatar?.storage_path
        ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${s.user.avatar.storage_path}`
        : null,
      hasFollow: s.has_follow,
      hasLike: s.has_like,
      hasComment: s.has_comment,
      mentionsCount: s.mentions_count,
      hasKeyword: s.has_keyword,
      isExcluded: s.is_excluded,
      isEligible: s.is_eligible,
      missingCriteria: s.missing_criteria || [],
      earliestActionAt: s.snapshot_at
    }))

    const eligibleCount = participants.filter((p) => p.isEligible).length

    return {
      giveaway: giveaway as Giveaway,
      participants,
      totalCandidates: participants.length,
      eligibleCount,
      ineligibleCount: participants.length - eligibleCount
    }
  }

  // Sorteo ACTIVO: evaluar dinámicamente
  const postId = giveaway.post_id
  if (!postId) {
    return {
      giveaway: giveaway as Giveaway,
      participants: [],
      totalCandidates: 0,
      eligibleCount: 0,
      ineligibleCount: 0
    }
  }

  // 1. Obtener candidatos: usuarios que han dado like o comentado
  const [likesRes, commentsRes, followsRes] = await Promise.all([
    adminClient.from("post_likes").select("user_id, created_at").eq("post_id", postId),
    adminClient.from("post_comments").select("id, author_id, content, created_at").eq("post_id", postId),
    giveaway.require_follow
      ? adminClient.from("follows").select("follower_id").eq("following_id", giveaway.organizer_id).eq("status", "ACCEPTED")
      : Promise.resolve({ data: [] })
  ])

  const likes = likesRes.data || []
  const comments = commentsRes.data || []
  const follows = new Set((followsRes.data || []).map((f: any) => f.follower_id))

  const candidateIds = new Set<string>()
  const earliestActionMap: Record<string, string> = {}

  likes.forEach((l) => {
    if (l.user_id !== giveaway.organizer_id) {
      candidateIds.add(l.user_id)
      if (!earliestActionMap[l.user_id] || l.created_at < earliestActionMap[l.user_id]) {
        earliestActionMap[l.user_id] = l.created_at
      }
    }
  })

  comments.forEach((c) => {
    if (c.author_id !== giveaway.organizer_id) {
      candidateIds.add(c.author_id)
      if (!earliestActionMap[c.author_id] || c.created_at < earliestActionMap[c.author_id]) {
        earliestActionMap[c.author_id] = c.created_at
      }
    }
  })

  const candidateArray = Array.from(candidateIds)
  if (candidateArray.length === 0) {
    return {
      giveaway: giveaway as Giveaway,
      participants: [],
      totalCandidates: 0,
      eligibleCount: 0,
      ineligibleCount: 0
    }
  }

  // 2. Perfiles de candidatos
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
    .in("id", candidateArray)

  const profileMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p
    return acc
  }, {})

  // 3. Menciones si se requieren
  const commentIds = comments.map((c) => c.id)
  let mentionsMap: Record<string, Set<string>> = {}
  if (giveaway.min_mentions > 0 && commentIds.length > 0) {
    const { data: mentionsData } = await adminClient
      .from("mentions")
      .select("entity_id, mentioned_id")
      .eq("entity_type", "post_comment")
      .in("entity_id", commentIds)

    ;(mentionsData || []).forEach((m) => {
      if (!mentionsMap[m.entity_id]) mentionsMap[m.entity_id] = new Set()
      mentionsMap[m.entity_id].add(m.mentioned_id)
    })
  }

  const userCommentsMap: Record<string, typeof comments> = {}
  comments.forEach((c) => {
    if (!userCommentsMap[c.author_id]) userCommentsMap[c.author_id] = []
    userCommentsMap[c.author_id].push(c)
  })

  const userLikesSet = new Set(likes.map((l) => l.user_id))
  const excludedSet = new Set(
    (giveaway.excluded_usernames || []).map((u) => u.toLowerCase().replace(/^@/, ""))
  )

  const participants: GiveawayParticipant[] = candidateArray.map((uid) => {
    const p = profileMap[uid]
    const username = p?.username?.toLowerCase().replace(/^@/, "") || ""
    const isExcluded = excludedSet.has(username)

    const hasLike = userLikesSet.has(uid)
    const uComments = userCommentsMap[uid] || []
    const hasComment = uComments.length > 0
    const hasFollow = giveaway.require_follow ? follows.has(uid) : true

    // Menciones
    let maxMentions = 0
    let hasMentions = true
    if (giveaway.min_mentions > 0) {
      if (uComments.length === 0) {
        hasMentions = false
      } else {
        uComments.forEach((c) => {
          const inDb = mentionsMap[c.id]?.size || 0
          const textMatches = (c.content || "").match(/(?:^|\s)@([a-zA-Z0-9_.-]+)/g)
          const textCount = textMatches ? new Set(textMatches.map((t) => t.trim().toLowerCase())).size : 0
          const effective = Math.max(inDb, textCount)
          if (effective > maxMentions) maxMentions = effective
        })
        hasMentions = maxMentions >= giveaway.min_mentions
      }
    }

    // Palabra clave
    let hasKeyword = true
    if (giveaway.required_keyword && giveaway.required_keyword.trim()) {
      const kw = giveaway.required_keyword.trim().toLowerCase()
      hasKeyword = uComments.some((c) => (c.content || "").toLowerCase().includes(kw))
    }

    const missingCriteria: string[] = []
    if (isExcluded) missingCriteria.push("Cuenta excluida por organizador")
    if (giveaway.require_follow && !hasFollow) missingCriteria.push("Seguir a la cuenta")
    if (giveaway.require_like && !hasLike) missingCriteria.push("Dar Me gusta")
    if (giveaway.require_comment && !hasComment) missingCriteria.push("Comentar la publicación")
    if (giveaway.min_mentions > 0 && !hasMentions) {
      missingCriteria.push(`Mencionar a ${giveaway.min_mentions} personas`)
    }
    if (giveaway.required_keyword && !hasKeyword) {
      missingCriteria.push(`Incluir "${giveaway.required_keyword}"`)
    }

    const isEligible = !isExcluded && missingCriteria.length === 0

    return {
      userId: uid,
      username: p?.username || "usuario",
      displayName: p?.display_name || `@${p?.username || "usuario"}`,
      avatarUrl: p?.avatar?.storage_path
        ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${p.avatar.storage_path}`
        : null,
      hasFollow,
      hasLike,
      hasComment,
      mentionsCount: maxMentions,
      hasKeyword,
      isExcluded,
      isEligible,
      missingCriteria,
      earliestActionAt: earliestActionMap[uid] || new Date().toISOString()
    }
  })

  // Ordenar: primero los elegibles, luego por fecha de participación
  participants.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1
    return new Date(a.earliestActionAt).getTime() - new Date(b.earliestActionAt).getTime()
  })

  const eligibleCount = participants.filter((p) => p.isEligible).length

  return {
    giveaway: giveaway as Giveaway,
    participants,
    totalCandidates: participants.length,
    eligibleCount,
    ineligibleCount: participants.length - eligibleCount
  }
}

/**
 * Cierre lógico del sorteo y creación del SNAPSHOT INMUTABLE de participantes
 */
export async function closeGiveawayLogical(giveawayId: string, actorId?: string): Promise<boolean> {
  const adminClient = getAdminClient()

  // 1. Obtener sorteo
  const { data: giveaway, error } = await adminClient
    .from("post_giveaways")
    .select("*")
    .eq("id", giveawayId)
    .single()

  if (error || !giveaway) throw new Error("Sorteo no encontrado")
  if (giveaway.status === "CLOSED" || giveaway.status === "DRAWN") return true
  if (giveaway.status === "CANCELLED") throw new Error("El sorteo está cancelado")

  // 2. Obtener estado de participantes a la fecha de cierre
  const { participants, eligibleCount, totalCandidates } = await getGiveawayParticipantsServer(giveawayId)

  // 3. Insertar Snapshot Inmutable en giveaway_participants_snapshot
  if (participants.length > 0) {
    const snapshotRows = participants.map((p) => ({
      giveaway_id: giveawayId,
      user_id: p.userId,
      has_follow: p.hasFollow,
      has_like: p.hasLike,
      has_comment: p.hasComment,
      mentions_count: p.mentionsCount,
      has_keyword: p.hasKeyword,
      is_excluded: p.isExcluded,
      is_eligible: p.isEligible,
      missing_criteria: p.missingCriteria,
      snapshot_at: new Date().toISOString()
    }))

    await adminClient
      .from("giveaway_participants_snapshot")
      .upsert(snapshotRows, { onConflict: "giveaway_id,user_id" })
  }

  // 4. Capturar post_snapshot para blindar el certificado si la publicación se borra
  let postSnapshot = null
  if (giveaway.post_id) {
    const { data: post } = await adminClient
      .from("social_posts")
      .select("id, content, created_at, post_media(display_order, media:media_assets(storage_path))")
      .eq("id", giveaway.post_id)
      .maybeSingle()
    if (post) postSnapshot = post
  }

  // 5. Actualizar estado a CLOSED
  await adminClient
    .from("post_giveaways")
    .update({
      status: "CLOSED",
      closed_at: new Date().toISOString(),
      total_eligible_count: eligibleCount,
      total_evaluated_count: totalCandidates,
      post_snapshot: postSnapshot,
      updated_at: new Date().toISOString()
    })
    .eq("id", giveawayId)

  // 6. Registrar en auditoría
  await adminClient.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    actor_id: actorId || giveaway.organizer_id,
    action: "CLOSE",
    details: {
      totalCandidates,
      eligibleCount,
      closed_at: new Date().toISOString()
    }
  })

  // 7. Notificar al organizador de que el sorteo ha cerrado y está listo para sortear
  try {
    await createNotification(
      giveaway.organizer_id,
      "SYSTEM",
      "post",
      giveaway.post_id || giveaway.id,
      {
        title: "Tu sorteo ha finalizado",
        body: `El sorteo "${giveaway.title}" ha finalizado con ${eligibleCount} participantes válidos. Ya puedes realizar la selección oficial.`
      }
    )
  } catch (err) {
    console.error("[GIVEAWAY] Error notificando al organizador:", err)
  }

  if (giveaway.post_id) {
    revalidatePath(`/posts/${giveaway.post_id}`)
  }
  revalidatePath(`/sorteos/${giveaway.certificate_code}`)
  revalidatePath("/")

  return true
}

/**
 * Realizar el sorteo criptográficamente seguro y certificar ganadores y suplentes
 */
export async function drawGiveawayWinners(giveawayId: string): Promise<{
  success: boolean
  winners: GiveawayResultItem[]
  alternates: GiveawayResultItem[]
  certificateCode: string
  selectionHash: string
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const adminClient = getAdminClient()

  // 1. Bloqueo y verificación de estado
  const { data: giveaway, error: gErr } = await adminClient
    .from("post_giveaways")
    .select("*")
    .eq("id", giveawayId)
    .single()

  if (gErr || !giveaway) throw new Error("Sorteo no encontrado")
  if (giveaway.organizer_id !== user.id) {
    throw new Error("Solo el organizador puede realizar la selección del sorteo")
  }
  if (giveaway.status === "DRAWN") {
    throw new Error("Este sorteo ya ha sido realizado y certificado previamente. No se puede sortear de nuevo.")
  }
  if (giveaway.status === "CANCELLED") {
    throw new Error("El sorteo está cancelado.")
  }

  // Si aún no estaba cerrado, cerrarlo y crear snapshot
  if (giveaway.status === "ACTIVE") {
    await closeGiveawayLogical(giveawayId, user.id)
  }

  // 2. Obtener los participantes elegibles del SNAPSHOT INMUTABLE
  const { data: eligibleRows } = await adminClient
    .from("giveaway_participants_snapshot")
    .select("user_id")
    .eq("giveaway_id", giveawayId)
    .eq("is_eligible", true)
    .order("snapshot_at", { ascending: true })

  const eligibleUserIds = (eligibleRows || []).map((r) => r.user_id)

  if (eligibleUserIds.length === 0) {
    // Caso especial: 0 participantes elegibles
    const nowIso = new Date().toISOString()
    const emptyHash = crypto.createHash("sha256").update(`${giveawayId}:empty:${nowIso}`).digest("hex")

    await adminClient
      .from("post_giveaways")
      .update({
        status: "DRAWN",
        drawn_at: nowIso,
        selection_hash: emptyHash,
        updated_at: nowIso
      })
      .eq("id", giveawayId)

    await adminClient.from("giveaway_audit_log").insert({
      giveaway_id: giveawayId,
      actor_id: user.id,
      action: "DRAW",
      details: {
        winnersCount: 0,
        alternatesCount: 0,
        eligibleCount: 0,
        drawn_at: nowIso
      }
    })

    if (giveaway.post_id) revalidatePath(`/posts/${giveaway.post_id}`)
    revalidatePath(`/sorteos/${giveaway.certificate_code}`)

    return {
      success: true,
      winners: [],
      alternates: [],
      certificateCode: giveaway.certificate_code,
      selectionHash: emptyHash
    }
  }

  // 3. Selección criptográficamente segura (Fisher-Yates shuffle con crypto.randomInt)
  const pool = [...eligibleUserIds]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    const temp = pool[i]
    pool[i] = pool[j]
    pool[j] = temp
  }

  const requestedWinners = Math.max(1, giveaway.num_winners)
  const requestedAlternates = Math.max(0, giveaway.num_alternates)

  const selectedWinnerIds = pool.slice(0, requestedWinners)
  const remainingPool = pool.slice(requestedWinners)
  const selectedAlternateIds = remainingPool.slice(0, requestedAlternates)

  const nowIso = new Date().toISOString()
  const selectionSeed = crypto.randomBytes(16).toString("hex")
  const hashPayload = `${giveawayId}|${selectionSeed}|winners:${selectedWinnerIds.join(",")}|alternates:${selectedAlternateIds.join(",")}|${nowIso}`
  const selectionHash = crypto.createHash("sha256").update(hashPayload).digest("hex")

  // 4. Guardar resultados en giveaway_results
  const resultRows: any[] = []

  selectedWinnerIds.forEach((uid, index) => {
    resultRows.push({
      giveaway_id: giveawayId,
      user_id: uid,
      role: "WINNER",
      position: index + 1,
      status: "CONFIRMED",
      selected_at: nowIso
    })
  })

  selectedAlternateIds.forEach((uid, index) => {
    resultRows.push({
      giveaway_id: giveawayId,
      user_id: uid,
      role: "ALTERNATE",
      position: index + 1,
      status: "CONFIRMED",
      selected_at: nowIso
    })
  })

  await adminClient.from("giveaway_results").insert(resultRows)

  // 5. Actualizar sorteo a DRAWN
  await adminClient
    .from("post_giveaways")
    .update({
      status: "DRAWN",
      drawn_at: nowIso,
      selection_hash: selectionHash,
      updated_at: nowIso
    })
    .eq("id", giveawayId)

  // 6. Auditoría inmutable
  await adminClient.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    actor_id: user.id,
    action: "DRAW",
    details: {
      selectionHash,
      winnersCount: selectedWinnerIds.length,
      alternatesCount: selectedAlternateIds.length,
      eligiblePoolTotal: eligibleUserIds.length,
      drawn_at: nowIso
    }
  })

  // 7. Notificaciones a los ganadores
  for (const winnerId of selectedWinnerIds) {
    try {
      await createNotification(
        winnerId,
        "SYSTEM",
        "post",
        giveaway.post_id || giveawayId,
        {
          title: "¡Has ganado un sorteo en misarroces!",
          body: `¡Enhorabuena! Has sido seleccionado como ganador del sorteo "${giveaway.title}" organizado por tu comunidad arrocera.`
        }
      )
    } catch (notifErr) {
      console.error(`[GIVEAWAY] Error enviando notificación a ganador ${winnerId}:`, notifErr)
    }
  }

  // Notificar al organizador
  try {
    await createNotification(
      giveaway.organizer_id,
      "SYSTEM",
      "post",
      giveaway.post_id || giveawayId,
      {
        title: "Tu sorteo ha sido certificado",
        body: `La selección de "${giveaway.title}" ha finalizado con éxito. Certificado oficial: ${giveaway.certificate_code}.`
      }
    )
  } catch (orgNotifErr) {
    console.error("[GIVEAWAY] Error notificando organizador:", orgNotifErr)
  }

  // Registrar analítica
  try {
    await trackEvent("GIVEAWAY_DRAW", "giveaway", giveawayId)
  } catch {}

  if (giveaway.post_id) revalidatePath(`/posts/${giveaway.post_id}`)
  revalidatePath(`/sorteos/${giveaway.certificate_code}`)
  revalidatePath("/")

  // Recargar datos finales con perfiles
  const updatedGiveaway = await getGiveawayByCertificate(giveaway.certificate_code)
  const winners = (updatedGiveaway?.results || []).filter((r) => r.role === "WINNER")
  const alternates = (updatedGiveaway?.results || []).filter((r) => r.role === "ALTERNATE")

  return {
    success: true,
    winners,
    alternates,
    certificateCode: giveaway.certificate_code,
    selectionHash
  }
}

/**
 * Sustituir un ganador por el siguiente suplente disponible (con motivo y trazabilidad inmutable)
 */
export async function replaceWinnerWithAlternate(
  giveawayId: string,
  winnerResultId: string,
  reason: string
): Promise<{ success: boolean; newWinner?: GiveawayResultItem; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  if (!reason || reason.trim().length < 5) {
    throw new Error("Debes indicar un motivo de sustitución de al menos 5 caracteres (ej: 'Ganador no responde en 48 horas').")
  }

  const adminClient = getAdminClient()

  // 1. Verificar sorteo y organizador
  const { data: giveaway } = await adminClient
    .from("post_giveaways")
    .select("*")
    .eq("id", giveawayId)
    .single()

  if (!giveaway) throw new Error("Sorteo no encontrado")
  if (giveaway.organizer_id !== user.id) {
    throw new Error("Solo el organizador puede sustituir un ganador")
  }
  if (giveaway.status !== "DRAWN") {
    throw new Error("El sorteo debe estar certificado y finalizado para sustituir un ganador")
  }

  // 2. Obtener el ganador a sustituir
  const { data: targetWinner } = await adminClient
    .from("giveaway_results")
    .select("*")
    .eq("id", winnerResultId)
    .eq("giveaway_id", giveawayId)
    .single()

  if (!targetWinner || targetWinner.role !== "WINNER" || targetWinner.status !== "CONFIRMED") {
    throw new Error("El resultado indicado no es un ganador activo que pueda ser sustituido")
  }

  // 3. Buscar el siguiente suplente disponible en orden de posición
  const { data: availableAlternates } = await adminClient
    .from("giveaway_results")
    .select("*")
    .eq("giveaway_id", giveawayId)
    .eq("role", "ALTERNATE")
    .eq("status", "CONFIRMED")
    .order("position", { ascending: true })

  if (!availableAlternates || availableAlternates.length === 0) {
    throw new Error("No hay suplentes disponibles en este sorteo para realizar la sustitución.")
  }

  const promotedAlternate = availableAlternates[0]
  const nowIso = new Date().toISOString()

  // 4. Actualizar el suplente para que pase a estado CLAIMED/PROMOTED
  await adminClient
    .from("giveaway_results")
    .update({
      status: "CLAIMED"
    })
    .eq("id", promotedAlternate.id)

  // 5. Marcar al ganador original como REPLACED con su motivo y enlace al suplente
  await adminClient
    .from("giveaway_results")
    .update({
      status: "REPLACED",
      replaced_at: nowIso,
      replacement_reason: reason.trim(),
      replaced_by_user_id: promotedAlternate.user_id
    })
    .eq("id", targetWinner.id)

  // 6. Crear la nueva entrada de ganador efectivo
  const { data: newWinnerEntry, error: nErr } = await adminClient
    .from("giveaway_results")
    .insert({
      giveaway_id: giveawayId,
      user_id: promotedAlternate.user_id,
      role: "WINNER",
      position: targetWinner.position,
      status: "CONFIRMED",
      selected_at: nowIso
    })
    .select(`
      *,
      user:profiles!giveaway_results_user_id_fkey(
        id, username, display_name,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      )
    `)
    .single()

  if (nErr) throw new Error("Error al asignar nuevo ganador: " + nErr.message)

  // 7. Registro de auditoría
  await adminClient.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    actor_id: user.id,
    action: "WINNER_REPLACE",
    details: {
      original_winner_id: targetWinner.user_id,
      promoted_alternate_id: promotedAlternate.user_id,
      reason: reason.trim(),
      replaced_at: nowIso
    }
  })

  // 8. Notificar al suplente ascendido
  try {
    await createNotification(
      promotedAlternate.user_id,
      "SYSTEM",
      "post",
      giveaway.post_id || giveawayId,
      {
        title: "¡Has sido seleccionado como ganador del sorteo!",
        body: `Has pasado de suplente a ganador en el sorteo "${giveaway.title}" tras una sustitución oficial.`
      }
    )
  } catch (err) {
    console.error("[GIVEAWAY] Error notificando a suplente ascendido:", err)
  }

  // Registrar analítica
  try {
    await trackEvent("GIVEAWAY_WINNER_REPLACED", "giveaway", giveawayId)
  } catch {}

  if (giveaway.post_id) revalidatePath(`/posts/${giveaway.post_id}`)
  revalidatePath(`/sorteos/${giveaway.certificate_code}`)

  return {
    success: true,
    newWinner: newWinnerEntry as GiveawayResultItem
  }
}

/**
 * Cancelar un sorteo antes de su realización
 */
export async function cancelGiveaway(giveawayId: string, reason?: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const adminClient = getAdminClient()

  const { data: giveaway } = await adminClient
    .from("post_giveaways")
    .select("*")
    .eq("id", giveawayId)
    .single()

  if (!giveaway) throw new Error("Sorteo no encontrado")
  if (giveaway.organizer_id !== user.id) {
    throw new Error("Solo el organizador puede cancelar el sorteo")
  }
  if (giveaway.status === "DRAWN") {
    throw new Error("No se puede cancelar un sorteo que ya ha sido realizado y certificado.")
  }

  const nowIso = new Date().toISOString()

  await adminClient
    .from("post_giveaways")
    .update({
      status: "CANCELLED",
      cancelled_at: nowIso,
      cancel_reason: reason?.trim() || null,
      updated_at: nowIso
    })
    .eq("id", giveawayId)

  await adminClient.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    actor_id: user.id,
    action: "CANCEL",
    details: {
      reason: reason?.trim() || "Cancelado por el organizador",
      cancelled_at: nowIso
    }
  })

  try {
    await trackEvent("GIVEAWAY_CANCEL", "giveaway", giveawayId)
  } catch {}

  if (giveaway.post_id) revalidatePath(`/posts/${giveaway.post_id}`)
  revalidatePath(`/sorteos/${giveaway.certificate_code}`)
  revalidatePath("/")

  return true
}

/**
 * Generador automático de Bases Legales / Términos del Sorteo
 */
export async function generateGiveawayTermsTemplate(params: {
  organizerUsername: string
  organizerDisplayName?: string
  title: string
  prize: string
  startsAt: string
  endsAt: string
  numWinners: number
  numAlternates: number
  requireFollow: boolean
  requireLike: boolean
  requireComment: boolean
  minMentions: number
  requiredKeyword?: string
}): Promise<string> {
  const orgName = params.organizerDisplayName || `@${params.organizerUsername}`
  const startDateStr = new Date(params.startsAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  const endDateStr = new Date(params.endsAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  const conditionsList: string[] = []
  if (params.requireFollow) conditionsList.push(`1. Seguir la cuenta de @${params.organizerUsername} en misarroces.`)
  if (params.requireLike) conditionsList.push("2. Dar Me gusta a la publicación del sorteo.")
  if (params.requireComment) conditionsList.push("3. Dejar un comentario en la publicación del sorteo.")
  if (params.minMentions > 0) {
    conditionsList.push(
      `4. Mencionar al menos a ${params.minMentions} persona${params.minMentions > 1 ? "s" : ""} real${params.minMentions > 1 ? "es" : ""} de misarroces en el comentario.`
    )
  }
  if (params.requiredKeyword && params.requiredKeyword.trim()) {
    conditionsList.push(`5. Incluir el texto o hashtag "${params.requiredKeyword.trim()}" en el comentario.`)
  }

  return `BASES LEGALES Y CONDICIONES DEL SORTEO: "${params.title}"

1. ORGANIZADOR:
El presente sorteo es organizado exclusivamente por ${orgName} (@${params.organizerUsername}) a través de la plataforma misarroces. misarroces actúa como proveedor de soporte tecnológico para la verificación y certificación del sorteo, sin ser organizador ni responsable del premio ofrecido por terceros.

2. ÁMBITO Y PLAZO DE PARTICIPACIÓN:
El periodo de participación comienza el ${startDateStr} y finaliza el ${endDateStr}. Toda acción efectuada con posterioridad a dicha hora no será contabilizada para la selección de ganadores.

3. PREMIO:
${params.prize}.
El premio no es canjeable por dinero en metálico ni transferible sin autorización expresa del organizador.

4. CONDICIONES DE PARTICIPACIÓN:
Para que la participación sea considerada válida, cada usuario debe cumplir acumulativamente los siguientes requisitos antes del cierre:
${conditionsList.join("\n")}

5. SELECCIÓN DE GANADORES Y SUPLENTES:
Se seleccionarán ${params.numWinners} ganador${params.numWinners > 1 ? "es" : ""} y ${params.numAlternates} suplente${params.numAlternates > 1 ? "s" : ""} mediante algoritmo criptográficamente seguro y verificable de misarroces entre todos los participantes válidos únicos (1 usuario = 1 participación). El resultado generará un Certificado Público Oficial e inmutable con hash de integridad.

6. CONTACTO Y ENTREGA DEL PREMIO:
El organizador contactará a los ganadores a través de misarroces. Si un ganador no responde en el plazo establecido por el organizador o renuncia, se procederá a la sustitución por el siguiente suplente en estricto orden correlativo, quedando dicha sustitución registrada públicamente en el certificado.`
}
