"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Search, X, Loader2, MessageSquarePlus } from "lucide-react"
import { getOrCreateConversation, searchUsersForNewChat } from "@/app/actions/messaging"

export function NewMessageModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load initial suggestions or perform debounced search
  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setUsers([])
      setErrorMsg(null)
      setCreatingId(null)
      return
    }

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    let active = true
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsersForNewChat(query)
        if (active) {
          setUsers(results || [])
        }
      } catch (err) {
        console.error("Error buscando usuarios para nuevo chat:", err)
      } finally {
        if (active) setLoading(false)
      }
    }, query ? 250 : 0)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [isOpen, query])

  const handleSelectUser = async (targetUserId: string) => {
    if (creatingId) return
    setCreatingId(targetUserId)
    setErrorMsg(null)

    try {
      const convId = await getOrCreateConversation(targetUserId)
      if (convId) {
        onClose()
        router.push(`/messages/${convId}`)
      } else {
        throw new Error("No se pudo abrir la conversación")
      }
    } catch (err) {
      console.error("Error al iniciar conversación:", err)
      setErrorMsg(err instanceof Error ? err.message : "Error al iniciar conversación")
      setCreatingId(null)
    }
  }

  if (!isOpen || !mounted) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvesoygqssyyojqyswwm.supabase.co"

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[600px] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg">Nuevo mensaje</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-border bg-muted/20">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o @usuario..."
              className="w-full pl-10 pr-9 py-2 bg-background border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mx-4 mt-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Buscando arroceros...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="text-sm font-semibold text-muted-foreground">
                {query ? "No se encontraron arroceros con ese nombre" : "No hay usuarios sugeridos"}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Escribe un nombre o @usuario para buscar
              </p>
            </div>
          ) : (
            users.map((u) => {
              const isSelected = creatingId === u.id
              const avatarPath = u.avatar?.storage_path
              const avatarUrl = avatarPath ? `${supabaseUrl}/storage/v1/object/public/recipe_media/${avatarPath}` : null

              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={!!creatingId}
                  onClick={() => handleSelectUser(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition-colors text-left disabled:opacity-60 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border bg-secondary flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-primary text-sm uppercase">
                        {u.username?.[0] || "A"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">
                      {u.display_name || u.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{u.username}
                    </p>
                  </div>

                  {isSelected && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
