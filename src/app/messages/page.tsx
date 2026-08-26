import { fetchConversations, acceptRequest, rejectRequest } from "@/app/actions/messaging"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function MessagesPage() {
  const convs = await fetchConversations()

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>
      
      <div className="space-y-4">
        {convs.length === 0 && <p className="text-muted-foreground text-center py-12">No tienes mensajes todavía.</p>}
        
        {convs.map((c) => (
          <Link key={c.conversation_id} href={`/messages/${c.conversation_id}`} className="block">
            <div className="flex items-center p-3 rounded-2xl bg-card border border-border hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 bg-secondary rounded-full overflow-hidden shrink-0">
                {c.otherMember?.user?.avatar_media_id ? (
                  <img src={c.otherMember.user.avatar_media_id} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold">
                    {c.otherMember?.user?.display_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 truncate">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold truncate">{c.otherMember?.user?.display_name}</h3>
                  {c.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {c.status === 'REQUEST' ? 'Nueva solicitud de mensaje' : (c.lastMessage?.body || 'Nuevo mensaje')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
