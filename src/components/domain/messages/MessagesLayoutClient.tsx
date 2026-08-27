"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MessagesLayoutClient({ convs, children }: { convs: Record<string, any>[], children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/messages'

  return (
    <div className="fixed inset-0 md:top-[64px] flex w-full max-w-7xl mx-auto overflow-hidden bg-background z-40">
      {/* LEFT SIDEBAR (Inbox) - Visible always on Desktop, visible ONLY on Root on Mobile */}
      <div className={`${isRoot ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[350px] shrink-0 border-r border-border h-full`}>
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 z-10">
          <h1 className="text-2xl font-bold">Mensajes</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {convs.length === 0 && <p className="text-muted-foreground text-center py-12 text-sm">No tienes mensajes todavía.</p>}
          
          {convs.map((c) => {
            const isActive = pathname === `/messages/${c.conversation_id}`;
            return (
              <Link key={c.conversation_id} href={`/messages/${c.conversation_id}`} className="block">
                <div className={`flex items-center p-3 rounded-2xl border transition-colors ${isActive ? 'bg-primary/10 border-primary/20' : 'bg-card border-border hover:bg-card/80'}`}>
                  <div className="w-12 h-12 bg-secondary rounded-full overflow-hidden shrink-0 border border-border">
                    {c.otherMember?.user?.avatar_media_id ? (
                      <img src={c.otherMember.user.avatar_media_id} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold">
                        {c.otherMember?.user?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 truncate">
                    <div className="flex justify-between items-center">
                      <h3 className={`truncate ${isActive ? 'font-bold text-primary' : 'font-semibold'}`}>
                        {c.otherMember?.user?.username}
                      </h3>
                      {c.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {c.status === 'REQUEST' ? 'Nueva solicitud' : (c.lastMessage?.body || 'Enviado un archivo adjunto')}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR (Chat) - Visible always on Desktop, visible ONLY on Chat on Mobile */}
      <div className={`${!isRoot ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0 h-full relative`}>
        {children}
      </div>
    </div>
  )
}
