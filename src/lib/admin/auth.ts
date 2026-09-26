import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR"

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !adminKey) {
    throw new Error("[Admin Auth] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createAdminClient<Database>(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Resolves the admin role for a given user ID and optional email.
 * Evaluates secure server-side environment configuration and the database admin_roles table.
 * Returns null if the user is not an administrator.
 */
export async function getAdminRole(userId: string, userEmail?: string): Promise<AdminRole | null> {
  if (!userId) return null

  // 1. Comprobación segura por variables de entorno del servidor
  const envSuperAdmins = (process.env.SUPER_ADMIN_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)
  if (envSuperAdmins.includes(userId)) {
    return "SUPER_ADMIN"
  }

  const envSuperAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (userEmail && envSuperAdminEmails.includes(userEmail.toLowerCase())) {
    return "SUPER_ADMIN"
  }

  const envAdmins = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)
  if (envAdmins.includes(userId)) {
    return "ADMIN"
  }

  const envAdminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (userEmail && envAdminEmails.includes(userEmail.toLowerCase())) {
    return "ADMIN"
  }

  // 2. Consulta a la tabla admin_roles en Supabase
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle()

    if (!error && data?.role) {
      return data.role as AdminRole
    }
  } catch (err) {
    console.warn("[Admin Auth] Could not query admin_roles table:", err)
  }

  return null
}

/**
 * Resolves whether a user has official admin authorization (SUPER_ADMIN or ADMIN)
 * to claim official identifiers such as @misarroces.
 */
export async function isAuthorizedOfficialAccount(
  userId: string,
  userEmail?: string,
  currentUsername?: string
): Promise<boolean> {
  if (!userId) return false
  const role = await getAdminRole(userId, userEmail)
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return true
  }
  // Transición autorizada para la cuenta oficial del creador (@perellinares -> @misarroces)
  if (currentUsername && currentUsername.toLowerCase() === "perellinares") {
    return true
  }
  return false
}

export interface AdminSession {
  user: {
    id: string
    email?: string
  }
  role: AdminRole
  profile: {
    username: string
    display_name: string | null
  }
}

/**
 * Strict server-side guard for all /admin routes and administrative Server Actions.
 * If the caller is not an authorized administrator, immediately invokes notFound() (404),
 * concealing the existence of the administrative portal from unauthorized actors.
 */
export async function requireAdminSession(minimumRole?: AdminRole): Promise<AdminSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no está autenticado, 404 instantáneo
  if (!user) {
    notFound()
  }

  const role = await getAdminRole(user.id, user.email)

  // Si no tiene rol administrativo, 404 instantáneo
  if (!role) {
    notFound()
  }

  // Comprobar jerarquía de roles si se especifica un mínimo
  if (minimumRole) {
    const hierarchy: Record<AdminRole, number> = {
      MODERATOR: 1,
      ADMIN: 2,
      SUPER_ADMIN: 3,
    }
    if (hierarchy[role] < hierarchy[minimumRole]) {
      notFound()
    }
  }

  // Cargar datos mínimos del perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single()

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    role,
    profile: {
      username: profile?.username || "admin",
      display_name: profile?.display_name || "Administrador",
    },
  }
}
