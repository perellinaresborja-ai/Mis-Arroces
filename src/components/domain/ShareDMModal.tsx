"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, X, Check, Copy, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendMessage, getOrCreateConversation } from "@/app/actions/messaging"

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

export function ShareDMModal({ 
  isOpen, 
  onClose, 
  entityType, 
  entityId,
  caption,
  authorName
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  entityType: 'RECIPE'|'SESSION'|'STORY', 
  entityId: string,
  caption?: string | null,
  authorName?: string | null
}) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true)
    }
  }, [])

  const getShareUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.misarroces.es"
    if (entityType === "STORY") return `${origin}/?story=${entityId}`
    if (entityType === "RECIPE") return `${origin}/recipes/${entityId}`
    if (entityType === "SESSION") return `${origin}/sessions/${entityId}`
    return `${origin}/p/${String(entityType).toLowerCase()}/${entityId}`
  }

  const getShareText = () => {
    if (entityType === "STORY") {
      const cleanUsername = authorName ? authorName.replace(/^@/, '') : ""
      return cleanUsername 
        ? `Historia de @${cleanUsername} en Mis Arroces` 
        : `Historia en Mis Arroces`
    }
    return caption || "Publicación en Mis Arroces"
  }

  const handleWhatsApp = () => {
    const url = getShareUrl()
    const text = `${getShareText()}\n${url}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    let success = false
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        success = true
      } catch {
        success = false
      }
    }
    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea")
        textarea.value = url
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        success = document.execCommand("copy")
        document.body.removeChild(textarea)
      } catch {
        success = false
      }
    }
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    const url = getShareUrl()
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Mis Arroces",
          text: getShareText(),
          url
        })
      } catch {
        // User cancelled or dismissed
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
    
        let query = supabase.from("profiles").select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)").neq("id", user.id).limit(10)
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
    } catch (err: unknown) {
      console.error("Error enviando:", err)
    } finally {
      setSendingTo(prev => { const n = new Set(prev); n.delete(receiverId); return n; })
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full h-[85vh] sm:h-auto sm:max-w-md bg-card text-foreground border border-border sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">Compartir</h2>
          <button onClick={onClose} className="p-2 opacity-70 hover:opacity-100 bg-muted rounded-full transition-opacity cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* External Share Actions */}
          <div className="space-y-2 shrink-0">
            {/* WhatsApp Button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Compartir en WhatsApp</span>
            </button>

            {/* Quick Actions: Compartir... & Copiar enlace */}
            {canNativeShare ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNativeShare}
                  className="w-full rounded-2xl font-semibold border-border hover:bg-muted py-2.5 h-auto text-xs"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Compartir…
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full rounded-2xl font-semibold border-border hover:bg-muted py-2.5 h-auto text-xs"
                >
                  {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? "Enlace copiado" : "Copiar enlace"}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="w-full rounded-2xl font-semibold border-border hover:bg-muted py-2.5 h-auto text-xs"
              >
                {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 shrink-0 my-1">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">O enviar por mensaje</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Internal DM Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar usuarios..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10 border-border bg-muted/50 text-foreground font-medium rounded-2xl h-11" 
            />
          </div>

          {/* Users List */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6 text-muted-foreground" />
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No se encontraron usuarios.</p>
            ) : (
              users.map((u: Record<string, unknown>) => {
                const isSent = sentTo.has(u.id as string);
                const isSending = sendingTo.has(u.id as string);
                const displayName = (u.display_name as string) || (u.username as string);
                return (
                  <div key={u.id as string} className="flex items-center justify-between p-2.5 hover:bg-muted/50 rounded-2xl transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      {(u.avatar as any)?.storage_path ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${(u.avatar as any).storage_path}`} 
                          className="w-10 h-10 rounded-full border border-border object-cover shrink-0" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center font-bold shrink-0">
                          {displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">@{u.username as string}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isSent ? "secondary" : "default"}
                      onClick={() => handleShare(u.id as string)} 
                      disabled={isSent || isSending}
                      className="rounded-full px-4 font-bold transition-all shrink-0 ml-2"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : isSent ? <><Check className="w-4 h-4 mr-1"/> Enviado</> : "Enviar"}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
