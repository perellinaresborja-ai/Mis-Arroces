import { Json } from "@/types/database.types"
import { headers } from "next/headers"
import { getAdminClient } from "./client"

export interface LogAdminActionParams {
  adminId: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, any>
  ipAddress?: string
}

/**
 * Persists an administrative action to admin_audit_logs.
 * Captures timestamp, admin ID, target resource, and relevant metadata.
 */
export async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: LogAdminActionParams): Promise<void> {
  let resolvedIp = ipAddress

  if (!resolvedIp) {
    try {
      const headerList = await headers()
      resolvedIp =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        undefined
    } catch {
      // Ignorar fallo de headers si se invoca fuera del ciclo de petición HTTP
    }
  }

  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: (details as Json) || null,
      ip_address: resolvedIp || null,
    })

    if (error) {
      console.warn("[Admin Audit] Could not write audit log row:", error.message)
    } else {
      console.log(`[Admin Audit] ${action} executed by ${adminId} on ${targetType || "SYSTEM"}:${targetId || "NONE"}`)
    }
  } catch (err: any) {
    console.error("[Admin Audit Exception]", err?.message || err)
  }
}
