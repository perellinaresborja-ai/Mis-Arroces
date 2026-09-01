import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { unblockUser } from "@/app/actions/settings"

export default async function BlockedUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth")
  }

  // Fetch blocked users
  const { data: blocks } = await supabase
    .from('blocks')
    .select(`
      blocked_id,
      profiles!blocks_blocked_id_fkey(
        id, username, display_name
      )
    `)
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Usuarios bloqueados</h1>
        </header>

        <div className="bg-card rounded-3xl border border-border p-4">
          {(!blocks || blocks.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">No tienes usuarios bloqueados.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {blocks.map((block: any) => {
                const profile = Array.isArray(block.profiles) ? block.profiles[0] : block.profiles;
                if (!profile) return null;
                return (
                  <div key={block.blocked_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{profile.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                    <form action={async (formData) => { "use server"; await unblockUser(formData); }}>
                      <input type="hidden" name="blockedId" value={block.blocked_id} />
                      <button type="submit" className="px-4 py-2 bg-muted text-foreground font-medium rounded-2xl hover:bg-muted/80 transition text-sm">
                        Desbloquear
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


