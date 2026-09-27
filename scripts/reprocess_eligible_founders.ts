import { createClient } from "@supabase/supabase-js"
import { processFounderSpotAndEmail } from "../src/lib/founder-claim"
import * as fs from "fs"

// Cargar variables de entorno de .env.local
const envContent = fs.readFileSync(".env.local", "utf-8")
const env: Record<string, string> = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    let val = match[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[match[1].trim()] = val
  }
})

for (const [k, v] of Object.entries(env)) {
  process.env[k] = v
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log("=== VERIFICACIÓN Y ASIGNACIÓN DE FUNDADORES ELEGIBLES ===")

  // 1. Obtener fundadores actuales
  const { data: founders } = await adminClient
    .from("founders")
    .select("founder_number, user_id, welcome_email_sent_at")
    .order("founder_number", { ascending: true })

  const existingFounderUserIds = new Set(founders?.map((f) => f.user_id) || [])
  console.log(`Fundadores asignados actualmente: ${existingFounderUserIds.size} (último: #${founders && founders.length > 0 ? founders[founders.length - 1].founder_number : -1})`)

  // 2. Obtener perfiles reales con onboarding completado ordenados por fecha de registro
  const { data: profiles, error: pErr } = await adminClient
    .from("profiles")
    .select("id, username, display_name, created_at, onboarding_completed")
    .eq("onboarding_completed", true)
    .neq("id", "d5e0c178-49d0-4160-b122-d518f5d46036") // Excluir cuenta oficial misarroces
    .order("created_at", { ascending: true })

  if (pErr || !profiles) {
    console.error("Error al consultar perfiles:", pErr)
    return
  }

  // Cuentas de prueba identificadas para no asignarles plaza
  const excludedUsernames = new Set(["testuser83402", "paellaloversclub", "misarroces2"])

  const eligiblePending = profiles.filter(
    (p) => !existingFounderUserIds.has(p.id) && !excludedUsernames.has(p.username)
  )

  console.log(`\nUsuarios elegibles pendientes de plaza: ${eligiblePending.length}`)
  eligiblePending.forEach((p) => {
    console.log(` - @${p.username} (${p.display_name}) [${p.id}] registrado en ${p.created_at}`)
  })

  if (eligiblePending.length === 0) {
    console.log("No hay usuarios elegibles pendientes.")
    return
  }

  for (const user of eligiblePending) {
    console.log(`\nProcesando asignación para @${user.username} (${user.id})...`)
    const result = await processFounderSpotAndEmail(user.id)
    console.log(`Resultado para @${user.username}:`, result)
  }

  // 3. Verificación final
  const { data: updatedFounders } = await adminClient
    .from("founders")
    .select("founder_number, user_id, welcome_email_sent_at")
    .order("founder_number", { ascending: true })

  console.log("\n=== ESTADO FINAL DE FUNDADORES ===")
  updatedFounders?.forEach((f) => {
    console.log(`#${String(f.founder_number).padStart(3, "0")} - User: ${f.user_id} - Email enviado: ${f.welcome_email_sent_at || "PENDIENTE"}`)
  })
}

main().catch(console.error)
