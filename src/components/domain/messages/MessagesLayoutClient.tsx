"use client"
import { useState, useEffect, useTransition, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react"
import { togglePinConversation, archiveConversation } from "@/app/actions/messaging"

export function MessagesLayoutClient({ convs, children }: { convs: Record<string, any>[], children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isRoot = pathname === '/messages'
  const [localConvs, setLocalConvs] = useState(convs)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalConvs(convs)
  }, [convs])

  useEffect(() => {
    const handleRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      const readConvId = customEvent.detail?.conversationId;
      if (readConvId) {
        setLocalConvs(prev => prev.map(c => 
          c.conversation_id === readConvId ? { ...c, unreadCount: 0 } : c
        ));
      }
    };
    window.addEventListener('messages_read', handleRead);
    return () => window.removeEventListener('messages_read', handleRead);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePin = (e: React.MouseEvent, convId: string, currentPin: boolean) => {
    e.stopPropagation()
    setMenuOpenId(null)
    setLocalConvs(prev => {
      const copy = [...prev]
      const idx = copy.findIndex(c => c.conversation_id === convId)
      if (idx !== -1) {
        copy[idx].is_pinned = !currentPin
        // Sort
        copy.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()
        })
      }
      return copy
    })
    startTransition(() => {
      togglePinConversation(convId, currentPin)
    })
  }

  const handleDelete = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    setMenuOpenId(null)
    if (!confirm('¿Ocultar esta conversación? Volverá a aparecer si recibes un mensaje.')) return
    
    setLocalConvs(prev => prev.filter(c => c.conversation_id !== convId))
    if (pathname === `/messages/${convId}`) router.push('/messages')
    
    startTransition(() => {
      archiveConversation(convId)
    })
  }

  const navigateTo = (convId: string) => {
    router.push(`/messages/${convId}`)
  }

  return (
    <div className="fixed inset-0 md:top-[64px] flex w-full max-w-2xl mx-auto md:border-x border-border/50 overflow-hidden bg-background z-40">
      {/* LEFT SIDEBAR (Inbox) */}
      <div className={`${isRoot ? 'flex' : 'hidden'} flex-col w-full shrink-0 h-full`}>
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 z-10">
          <h1 className="text-2xl font-bold">Mensajes</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {localConvs.length === 0 && <p className="text-muted-foreground text-center py-12 text-sm">No tienes mensajes todavía.</p>}
          
          {localConvs.map((c) => {
            const isActive = pathname === `/messages/${c.conversation_id}`;
            const isPinned = c.is_pinned;
            return (
              <div 
                key={c.conversation_id} 
                onClick={() => navigateTo(c.conversation_id)} 
                className={`flex items-center p-3 rounded-2xl border transition-colors cursor-pointer relative ${isActive ? 'bg-primary/10 border-primary/20' : 'bg-card border-border hover:bg-card/80'}`}
              >
                <div className="w-12 h-12 bg-secondary rounded-full overflow-hidden shrink-0 border border-border">
                  {c.otherMember?.user?.avatar?.storage_path ? (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${c.otherMember.user.avatar.storage_path}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold">
                      {c.otherMember?.user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-1 truncate pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className={`truncate ${isActive ? 'font-bold text-primary' : 'font-semibold'}`}>
                      {c.otherMember?.user?.username}
                    </h3>
                    {isPinned && <Pin className="w-3 h-3 text-muted-foreground shrink-0" />}
                    {c.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {c.status === 'REQUEST' ? 'Nueva solicitud' : (c.lastMessage?.body || 'Enviado un archivo adjunto')}
                  </p>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === c.conversation_id ? null : c.conversation_id) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {menuOpenId === c.conversation_id && (
                  <div ref={menuRef} className="absolute right-12 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[120px] animate-in fade-in zoom-in-95">
                    <button 
                      onClick={(e) => handlePin(e, c.conversation_id, isPinned)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                    >
                      {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      {isPinned ? 'Desfijar' : 'Fijar'}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, c.conversation_id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR (Chat) */}
      <div className={`${!isRoot ? 'flex' : 'hidden'} flex-col flex-1 min-h-0 h-full relative`}>
        {children}
      </div>
    </div>
  )
}
