"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendMessage, getOrCreateConversation } from "@/app/actions/messaging"

export function ShareDMModal({ isOpen, onClose, entityType, entityId }: { isOpen: boolean, onClose: () => void, entityType: 'RECIPE'|'SESSION'|'STORY', entityId: string }) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
    
        let query = supabase.from("profiles").select("id, username, avatar:media_assets!fk_profiles_avatar(storage_path)").neq("id", user.id).limit(10)
        if (search.trim()) query = query.ilike("username", `%${search}%`)
    
        const { data } = await query
        setUsers((data as Record<string, unknown>[]) || [])
        setIsLoading(false)
      }
      fetchUsers()
    }
  }, [isOpen, search, supabase])

  const handleShare = async (receiverId: string) => {
    if (sentTo.has(receiverId) || sendingTo.has(receiverId)) return;
    
    setSendingTo(prev => { const n = new Set(prev); n.add(receiverId); return n; })
    try {
      const convId = await getOrCreateConversation(receiverId)
      await sendMessage({
        conversationId: convId,
        type: entityType,
        body: null,
        entityId
      })
      setSentTo(prev => { const n = new Set(prev); n.add(receiverId); return n; })
    } catch (err: any) {
      console.error("Error enviando:", err)
    } finally {
      setSendingTo(prev => { const n = new Set(prev); n.delete(receiverId); return n; })
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full h-[70vh] sm:h-auto sm:max-w-md bg-card border border-border sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Compartir por Mensaje</h2>
          <button onClick={onClose} className="p-2 opacity-70 hover:opacity-100 bg-muted rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar usuarios..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-border bg-muted/50 text-foreground font-medium rounded-xl h-11" />
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4 text-muted-foreground" /> : users.map((u: Record<string, unknown>) => {
              const isSent = sentTo.has(u.id as string);
              const isSending = sendingTo.has(u.id as string);
              return (
                <div key={u.id as string} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    {(u.avatar as any)?.storage_path ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${(u.avatar as any).storage_path}`} className="w-11 h-11 rounded-full border border-border object-cover" alt="" />
                    ) : (
                      <div className="w-11 h-11 rounded-full border border-border bg-muted flex items-center justify-center font-bold">
                        {(u.username as string)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-sm">{u.username as string}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isSent ? "secondary" : "default"}
                    onClick={() => handleShare(u.id as string)} 
                    disabled={isSent || isSending}
                    className="rounded-full px-5 font-bold transition-all"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : isSent ? <><Check className="w-4 h-4 mr-1"/> Enviado</> : "Enviar"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
