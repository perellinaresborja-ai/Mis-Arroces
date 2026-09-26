"use server"

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/client"
import { normalizePhoneToE164 } from "@/lib/phone"

export interface UserPhoneResult {
  success: boolean
  error?: string
  phone: string | null
  phoneE164: string | null
  countryCode: string | null
}

/**
 * Retrieves the authenticated user's private phone.
 * Protected by RLS: only the user themselves can access this data.
 */
export async function getUserPhoneAction(): Promise<UserPhoneResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "No autorizado",
      phone: null,
      phoneE164: null,
      countryCode: null,
    }
  }

  try {
    const { data, error } = await supabase
      .from("user_private_contacts" as any)
      .select("phone, phone_e164, country_code")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!error && data) {
      return {
        success: true,
        phone: (data as any).phone || null,
        phoneE164: (data as any).phone_e164 || null,
        countryCode: (data as any).country_code || "ES",
      }
    }
  } catch (err) {
    console.error("[getUserPhoneAction] Error reading user_private_contacts:", err)
  }

  // Fallback to auth metadata if table not yet created
  const metaPhone = user.user_metadata?.phone_e164 || null
  return {
    success: true,
    phone: metaPhone,
    phoneE164: metaPhone,
    countryCode: user.user_metadata?.phone_country || "ES",
  }
}

/**
 * Updates or sets the user's private phone number.
 * Validates E.164 format and saves in isolated private storage.
 */
export async function updateUserPhoneAction(
  rawPhone: string,
  countryCode: string = "ES",
  dialCode: string = "+34"
): Promise<{ success: boolean; error?: string; e164?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "No autorizado" }

  const trimmed = (rawPhone || "").trim()

  // If empty, delete phone
  if (!trimmed) {
    return await deleteUserPhoneAction()
  }

  const norm = normalizePhoneToE164(trimmed, dialCode)
  if (!norm.valid) {
    return { success: false, error: norm.error || "Número de teléfono no válido." }
  }

  try {
    const adminClient = getAdminClient()

    // Upsert into user_private_contacts using admin client (or user client)
    await adminClient
      .from("user_private_contacts" as any)
      .upsert({
        user_id: user.id,
        phone: trimmed,
        phone_e164: norm.e164,
        country_code: countryCode,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    // Also update user metadata defensively
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        phone_e164: norm.e164,
        phone_country: countryCode,
      },
    })

    return { success: true, e164: norm.e164 }
  } catch (err: any) {
    console.error("[updateUserPhoneAction] Error:", err)
    return { success: false, error: "Error al guardar el teléfono." }
  }
}

/**
 * Deletes the user's private phone number.
 */
export async function deleteUserPhoneAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "No autorizado" }

  try {
    const adminClient = getAdminClient()

    await adminClient
      .from("user_private_contacts" as any)
      .delete()
      .eq("user_id", user.id)

    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        phone_e164: null,
        phone_country: null,
      },
    })

    return { success: true }
  } catch (err: any) {
    console.error("[deleteUserPhoneAction] Error:", err)
    return { success: false, error: "Error al eliminar el teléfono." }
  }
}
