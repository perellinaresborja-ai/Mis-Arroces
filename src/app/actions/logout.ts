"use server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete("ma_has_account")
  cookieStore.delete("ma_vault")
  revalidatePath("/", "layout")
  redirect("/login")
}
