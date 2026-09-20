import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const url = formData.get("url")?.toString()
    const reason = formData.get("reason")?.toString()
    const email = formData.get("email")?.toString()
    const goodFaith = formData.get("goodFaith") === "on"

    if (!url || !reason || !goodFaith) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('moderation_reports').insert({
      reporter_id: user?.id || null, // Allow anon
      target_type: 'URL', // Revert to URL since we cast the whole object
      target_id: url.slice(0, 255), // Store the URL in target_id or details
      reason: 'DSA_REPORT',
      details: reason,
      is_dsa_report: true,
      dsa_statement_good_faith: true,
      dsa_submitter_email: email || null
    } as any)

    if (error) {
      console.error("Error inserting DSA report:", error)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DSA Route Error:", error)
    return NextResponse.json({ error: "Ocurrió un error inesperado" }, { status: 500 })
  }
}
