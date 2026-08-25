import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "./EditProfileForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function EditProfilePage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, avatar:media_assets!fk_profiles_avatar(storage_path), cover:media_assets!fk_profiles_cover(storage_path)")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="w-full bg-background flex justify-center">
      <div className="w-full max-w-lg flex flex-col p-4 md:p-6 md:mt-4 ">
        
        <header className="flex items-center gap-4 mb-4 shrink-0">
          <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
        </header>

        <div className="w-full pb-32" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />
          <EditProfileForm initialProfile={profile} />
        </div>

      </div>
    </div>
  )
}
