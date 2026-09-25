'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  encryptVault,
  decryptVault,
  VaultPayload,
  VaultAccountSession,
} from "@/lib/auth/vault-crypto"

export interface AccountPublicProfile {
  userId: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  lastActiveAt: number
}

const VAULT_COOKIE_NAME = "ma_vault"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 año

async function getVaultFromCookies(): Promise<VaultPayload> {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(VAULT_COOKIE_NAME)?.value
  if (!rawCookie) {
    return { version: 1, accounts: [] }
  }
  const decrypted = decryptVault(rawCookie)
  return decrypted || { version: 1, accounts: [] }
}

async function saveVaultToCookies(vault: VaultPayload) {
  const cookieStore = await cookies()
  const encrypted = encryptVault(vault)
  cookieStore.set(VAULT_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })
}

/**
 * Devuelve la lista de cuentas autorizadas en este dispositivo (solo datos públicos, sin credenciales).
 */
export async function getVaultAccountsAction(): Promise<AccountPublicProfile[]> {
  const vault = await getVaultFromCookies()
  return vault.accounts.map((a) => ({
    userId: a.userId,
    email: a.email,
    username: a.username,
    displayName: a.displayName,
    avatarUrl: a.avatarUrl,
    lastActiveAt: a.lastActiveAt,
  }))
}

/**
 * Sincroniza la cuenta activa actual de Supabase dentro de la bóveda cifrada httpOnly.
 */
export async function syncCurrentSessionToVaultAction(): Promise<AccountPublicProfile[]> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return await getVaultAccountsAction()
    }

    const user = session.user
    const vault = await getVaultFromCookies()

    // Obtener datos de perfil frescos
    let username = user.user_metadata?.username || user.email?.split("@")[0] || "arrocero"
    let displayName = user.user_metadata?.display_name || username
    let avatarUrl: string | null = null

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
        .eq("id", user.id)
        .maybeSingle()

      if (profile) {
        if (profile.username) username = profile.username.replace(/^@+/, "")
        if (profile.display_name) displayName = profile.display_name
        const avatarData: any = profile.avatar
        const avatarPath = Array.isArray(avatarData) ? avatarData[0]?.storage_path : avatarData?.storage_path
        if (avatarPath) {
          avatarUrl = avatarPath.startsWith("http")
            ? avatarPath
            : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`
        }
      }
    } catch (profileErr) {
      console.warn("Aviso consultando perfil para bóveda:", profileErr)
    }

    const accountSession: VaultAccountSession = {
      userId: user.id,
      email: user.email || "",
      username,
      displayName,
      avatarUrl,
      refreshToken: session.refresh_token,
      accessToken: session.access_token,
      lastActiveAt: Date.now(),
    }

    const existingIndex = vault.accounts.findIndex((a) => a.userId === user.id)
    if (existingIndex >= 0) {
      vault.accounts[existingIndex] = {
        ...vault.accounts[existingIndex],
        ...accountSession,
      }
    } else {
      vault.accounts.push(accountSession)
    }

    await saveVaultToCookies(vault)

    return vault.accounts.map((a) => ({
      userId: a.userId,
      email: a.email,
      username: a.username,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
      lastActiveAt: a.lastActiveAt,
    }))
  } catch (err) {
    console.error("Error en syncCurrentSessionToVaultAction:", err)
    return await getVaultAccountsAction()
  }
}

/**
 * Limpia únicamente las cookies de sesión activa de Supabase del navegador.
 * IMPORTANTE: No se debe llamar a supabase.auth.signOut(), ya que revocaría
 * el refresh_token en los servidores de Supabase Auth impidiendo conmutar de vuelta.
 */
async function clearActiveSessionCookies() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  for (const c of allCookies) {
    if (
      c.name.includes("auth-token") ||
      (c.name.startsWith("sb-") && (c.name.endsWith("-token") || c.name.includes("-code-verifier")))
    ) {
      cookieStore.set(c.name, "", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }
  }
}

/**
 * Conmuta la sesión activa de Supabase a la cuenta destino utilizando su refresh_token almacenado en la bóveda cifrada.
 */
export async function switchAccountSessionAction(targetUserId: string): Promise<{
  success: boolean
  username?: string
  error?: string
  isExpired?: boolean
  email?: string
  accessToken?: string
  refreshToken?: string
}> {
  try {
    const supabase = await createClient()
    const vault = await getVaultFromCookies()

    // 1. Guardar la sesión actual activa antes de conmutar (si hay una)
    const { data: currentSessionData } = await supabase.auth.getSession()
    if (currentSessionData?.session?.user) {
      const currentId = currentSessionData.session.user.id
      const currentIdx = vault.accounts.findIndex((a) => a.userId === currentId)
      if (currentIdx >= 0) {
        vault.accounts[currentIdx].refreshToken = currentSessionData.session.refresh_token
        vault.accounts[currentIdx].accessToken = currentSessionData.session.access_token
      }
    }

    // 2. Buscar la cuenta destino en la bóveda
    const targetIndex = vault.accounts.findIndex((a) => a.userId === targetUserId)
    if (targetIndex < 0) {
      return { success: false, error: "La cuenta solicitada no se encuentra en este dispositivo." }
    }
    const targetAccount = vault.accounts[targetIndex]

    // 3. Limpiar previamente las cookies de sesión activa para evitar fragmentos residuales (chunks)
    await clearActiveSessionCookies()

    // 4. Establecer la sesión en Supabase con los tokens descifrados
    const switchSupabase = await createClient()
    const { data: newSessionData, error: setSessionError } = await switchSupabase.auth.setSession({
      access_token: targetAccount.accessToken || "",
      refresh_token: targetAccount.refreshToken,
    })

    if (setSessionError) {
      console.error("Error cambiando de cuenta en Supabase:", setSessionError.message)
      // Si el refresh_token expiró o fue revocado, retiramos la sesión inválida de la bóveda
      // para evitar que el usuario quede en un bucle zombi
      vault.accounts.splice(targetIndex, 1)
      await saveVaultToCookies(vault)

      return {
        success: false,
        isExpired: true,
        email: targetAccount.email,
        username: targetAccount.username,
        error: `La sesión de @${targetAccount.username} ha caducado.`,
      }
    }

    // 5. Actualizar tokens frescos y marca temporal de última actividad
    if (newSessionData?.session) {
      targetAccount.refreshToken = newSessionData.session.refresh_token
      targetAccount.accessToken = newSessionData.session.access_token
    }
    targetAccount.lastActiveAt = Date.now()

    await saveVaultToCookies(vault)

    const cookieStore = await cookies()
    cookieStore.set("ma_has_account", "1", {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return {
      success: true,
      username: targetAccount.username,
      accessToken: newSessionData?.session?.access_token || targetAccount.accessToken,
      refreshToken: newSessionData?.session?.refresh_token || targetAccount.refreshToken,
    }
  } catch (err: any) {
    console.error("Fallo inesperado conmutando cuenta:", err)
    return { success: false, error: "Fallo inesperado al sincronizar la cuenta." }
  }
}

/**
 * Prepara el flujo para añadir una nueva cuenta sin perder la actual.
 */
export async function prepareAddAccountAction(): Promise<{ success: boolean }> {
  try {
    // 1. Asegurar sesión actual en la bóveda
    await syncCurrentSessionToVaultAction()

    // 2. Limpiar ÚNICAMENTE las cookies del navegador.
    // NUNCA llamar a supabase.auth.signOut(), porque revocaría el refresh token en Supabase.
    await clearActiveSessionCookies()

    revalidatePath("/", "layout")
    return { success: true }
  } catch (err) {
    console.error("Error en prepareAddAccountAction:", err)
    return { success: false }
  }
}

/**
 * Elimina una cuenta de la bóveda en este dispositivo.
 */
export async function removeAccountFromVaultAction(userId: string): Promise<{
  success: boolean
  switchedToRemaining?: boolean
  signedOutAll?: boolean
}> {
  try {
    const supabase = await createClient()
    const vault = await getVaultFromCookies()

    const { data: { user } } = await supabase.auth.getUser()
    const isActiveUser = user?.id === userId

    vault.accounts = vault.accounts.filter((a) => a.userId !== userId)

    if (isActiveUser) {
      if (vault.accounts.length > 0) {
        // Conmutar a la siguiente cuenta disponible
        await saveVaultToCookies(vault)
        const nextId = vault.accounts[0].userId
        const switchRes = await switchAccountSessionAction(nextId)
        return { success: switchRes.success, switchedToRemaining: true }
      } else {
        // No quedan cuentas: cerrar sesión completa
        await supabase.auth.signOut()
        const cookieStore = await cookies()
        cookieStore.delete(VAULT_COOKIE_NAME)
        cookieStore.delete("ma_has_account")
        revalidatePath("/", "layout")
        return { success: true, signedOutAll: true }
      }
    } else {
      // Si la cuenta eliminada no era la activa, la sesión activa sigue intacta
      await saveVaultToCookies(vault)
      return { success: true }
    }
  } catch (err) {
    console.error("Error en removeAccountFromVaultAction:", err)
    return { success: false }
  }
}

