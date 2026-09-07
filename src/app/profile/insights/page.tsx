import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileInsightsView } from "./ProfileInsightsView"

export const metadata = {
  title: 'Mis Estadísticas',
}

export default async function ProfileInsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <ProfileInsightsView ownerId={user.id} />
}
