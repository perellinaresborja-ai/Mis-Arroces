"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendMessage, getOrCreateConversation } from "@/app/actions/messaging"

export function ShareDMModal({ isOpen, onClose, entityType, entityId }: { isOpen: boolean, onClose: () => void, entityType: 'RECIPE'|'SESSION'|'STORY', entityId: string }) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
    
        let query = supabase.from("profiles").select("id, username, avatar_media_id").neq("id", user.id).limit(10)
        if (search.trim()) query = query.ilike("username", `%${search}%`)
    
        const { data } = await query
        setUsers((data as Record<string, unknown>[]) || [])
        setIsLoading(false)
      }
      fetchUsers()
    }
  }, [isOpen, search, supabase])

  const handleShare = async (receiverId: string) => {
    try {
      const convId = await getOrCreateConversation(receiverId)
      await sendMessage({
        conversationId: convId,
        type: entityType,
        body: null,
        entityId
      })
      onClose()
      alert("Enviado correctamente")
    } catch (err: Error | NodeJS.ErrnoException | unknown) {
      alert("Error enviando: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Compartir por Mensaje</h2>
          <button onClick={onClose} className="p-1 opacity-70 hover:opacity-100"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar usuarios..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-border bg-muted/50" />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /> : users.map((u: Record<string, unknown>) => (
              <div key={u.id as string} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {u.avatar_media_id ? (
                    <img src={u.avatar_media_id as string} className="w-10 h-10 rounded-full border border-border object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center">
                      {(u.username as string)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-sm">{u.username as string}</span>
                </div>
                <Button size="sm" onClick={() => handleShare(u.id as string)} className="rounded-xl">Enviar</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
