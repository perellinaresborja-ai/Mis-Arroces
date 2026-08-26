import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { OnboardingWizard } from "./OnboardingWizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, avatar:media_assets!fk_profiles_avatar(storage_path)")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/")
  }

  // Get invite code from cookies if any
  const cookieStore = await cookies()
  const inviteCode = cookieStore.get("misarroces_invite_code")?.value

  let inviter = null
  if (inviteCode) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
      .eq("invite_code", inviteCode)
      .single()
    if (data && data.id !== user.id) {
      inviter = data
    }
  }

  // Fetch some basic suggestions (users with public visibility, maybe some random ones)
  // We'll exclude the user themselves and the inviter
  const excludeIds = [user.id]
  if (inviter) excludeIds.push(inviter.id)

  const { data: suggestionsData } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
    .not("id", "in", `(${excludeIds.map(id => `"${id}"`).join(",")})`)
    .eq("privacy_level", "PUBLIC")
    .limit(15)

  const suggestions = suggestionsData || []

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard 
        initialProfile={profile} 
        inviter={inviter} 
        suggestions={suggestions} 
        inviteCode={inviteCode || null}
      />
    </div>
  )
}
