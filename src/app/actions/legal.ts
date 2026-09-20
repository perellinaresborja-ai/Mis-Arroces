"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function checkPendingLegal(userId: string) {
  const supabase = await createClient()

  // Get active documents
  const { data: activeDocs } = await supabase
    .from("legal_documents" as any)
    .select("id, document_type")
    .eq("is_active", true)

  if (!activeDocs || activeDocs.length === 0) return false

  // Get user acceptances
  const { data: userAcceptances } = await supabase
    .from("user_legal_acceptances" as any)
    .select("document_id")
    .eq("user_id", userId)

  const acceptedIds = new Set(userAcceptances?.map((a: any) => a.document_id) || [])

  // Check if any active document is missing
  const missing = activeDocs.some((doc: any) => !acceptedIds.has(doc.id))
  
  return missing
}

export async function acceptActiveLegalDocuments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No user found")

  const { error } = await (supabase.rpc as any)('accept_current_legal_documents')
  
  if (error) {
    throw error
  }

  revalidatePath("/", "layout")
  return { success: true }
}
