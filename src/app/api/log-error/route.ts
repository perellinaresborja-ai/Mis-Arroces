import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !adminKey) return null
  return createAdminClient(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function sanitizeText(str: string, maxLen = 4000): string {
  if (!str) return ""
  // Strip potential Bearer tokens, passwords, cookies or secrets
  const sanitized = str
    .replace(/(bearer\s+[a-zA-Z0-9_\-\.]+)/gi, "[REDACTED_TOKEN]")
    .replace(/(password|passwd|secret|api[_-]?key)["']?\s*[:=]\s*["']?[^"'\s,]+/gi, "$1: [REDACTED]")
  return sanitized.slice(0, maxLen)
}

export async function POST(req: Request) {
  try {
    const userAgent = req.headers.get("user-agent") || null
    const referer = req.headers.get("referer") || null

    let message = "Unknown error"
    let stack: string | null = null
    let errorType = "CLIENT_ERROR"
    let extraContext: Record<string, any> = {}

    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      try {
        const body = await req.json()
        message = sanitizeText(body.message || body.error || "Unknown JSON error", 1000)
        stack = body.stack ? sanitizeText(body.stack, 4000) : null
        errorType = body.type || body.errorType || "CLIENT_ERROR"
        if (body.context && typeof body.context === "object") {
          extraContext = body.context
        }
      } catch {
        message = "Failed to parse error JSON payload"
      }
    } else {
      const rawText = await req.text()
      const sanitized = sanitizeText(rawText, 5000)
      const lines = sanitized.split("\n")
      message = lines[0]?.slice(0, 1000) || "Unknown client error"
      stack = lines.length > 1 ? sanitized : null
    }

    // Attempt to resolve user ID safely without failing
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) userId = user.id
    } catch {
      // User auth check failure is non-fatal
    }

    const incidentPayload = {
      incident_type: errorType,
      message,
      stack,
      url: referer ? sanitizeText(referer, 500) : null,
      user_agent: userAgent ? sanitizeText(userAgent, 500) : null,
      user_id: userId,
      context: Object.keys(extraContext).length > 0 ? extraContext : null,
      status: "OPEN",
    }

    // Persist to Supabase if admin client available
    const adminClient = getAdminClient()
    if (adminClient) {
      const { error: dbError } = await (adminClient as any)
        .from("app_incidents")
        .insert(incidentPayload)

      if (dbError) {
        console.warn("[App Incident Telemetry] Could not persist incident to DB:", dbError.message)
      }
    }

    console.error(`[App Incident Telemetry] [${errorType}] ${message} (User: ${userId || "anon"})`)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[App Incident Telemetry] Handler exception:", err?.message || err)
    return NextResponse.json({ ok: true }) // Always return 200 so client error boundaries don't loop
  }
}
