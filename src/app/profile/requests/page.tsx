import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ChevronLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { acceptFollowRequest, rejectFollowRequest } from "@/app/actions/follows"

export default async function RequestsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // Fetch pending follow requests
  const { data: requests } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))")
    .eq("following_id", user.id)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })

  const getAvatarUrl = (path: string | undefined | null) => 
    path ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${path}` : null

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 flex justify-center">
      <div className="w-full max-w-lg space-y-6 md:mt-8 p-4 md:p-0">
        
        <header className="flex items-center gap-4 mb-4">
          <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Solicitudes de seguimiento</h1>
        </header>

        {(!requests || requests.length === 0) ? (
          <div className="bg-card border border-border p-8 rounded-3xl text-center space-y-2">
            <p className="font-medium">No tienes solicitudes pendientes.</p>
            <p className="text-sm text-muted-foreground">Las cuentas públicas no reciben solicitudes porque los usuarios te siguen directamente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req: any) => {
              const follower = req.follower
              const avatar = getAvatarUrl(follower.avatar?.storage_path)

              return (
                <div key={follower.id} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full overflow-hidden shrink-0">
                      {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <Link href={`/@${follower.username}`} className="font-bold hover:underline block">{follower.display_name}</Link>
                      <p className="text-sm text-muted-foreground">@{follower.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <form action={async () => { "use server"; await acceptFollowRequest(follower.id) }}>
                      <Button type="submit" size="icon" className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Check className="w-5 h-5" />
                      </Button>
                    </form>
                    <form action={async () => { "use server"; await rejectFollowRequest(follower.id) }}>
                      <Button type="submit" size="icon" variant="outline" className="w-10 h-10 rounded-full">
                        <X className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
