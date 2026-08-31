"use client"

import { useEffect, useState } from "react"
import { formatRelativeTime } from "@/lib/utils"
import { ProfileAvatar } from "@/components/domain/ProfileAvatar"
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications"
import { acceptFollowRequest, rejectFollowRequest } from "@/app/actions/social"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function NotificationPanel({ onClose, onRead }: { onClose: () => void, onRead: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    const data = await fetchNotifications()
    setNotifications(data)
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    onRead()
  }

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      onRead()
    }

    // Routing logic
    if (notif.type === 'NEW_MESSAGE') { 
      const cid = notif.payload?.conversation_id || notif.entity_type;
      router.push(`/messages/${cid}`); 
    }
    else if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_ACCEPT') {
        const url = notif.actor?.username ? `/@${notif.actor.username}` : `/${notif.actor?.id}`;
        router.push(url);
      } else if (notif.type === 'FOLLOW_REQUEST') {
      router.push(`/profile/requests`)
    } else if (notif.type === 'LIKE' || notif.type === 'COMMENT' || notif.type === 'REPLY' || notif.type === 'MENTION' || notif.type === 'TAG' || notif.type === 'REACTION') {
      if (notif.entity_type === 'recipe') router.push(`/recipes/${notif.entity_id}`)
      else if (notif.entity_type === 'session') router.push(`/sessions/${notif.entity_id}`)
      else if (notif.entity_type === 'post') router.push(`/posts/${notif.entity_id}`)
      else if (notif.entity_type === 'short') router.push(`/shorts`)
      else if (notif.entity_type === 'story') {
        const url = `/profile`;
        router.push(url);
      }
    } else if (notif.type === 'COOKED_RECIPE') {
      router.push(`/sessions/${notif.entity_id}`)
    }

    onClose()
  }

  const handleFollowRequest = async (notif: any, action: 'accept' | 'reject', e: React.MouseEvent) => {
    e.stopPropagation()
    if (action === 'accept') {
      await acceptFollowRequest(notif.actor_id)
    } else {
      await rejectFollowRequest(notif.actor_id)
    }
    await markNotificationRead(notif.id)
    setNotifications(notifications.filter(n => n.id !== notif.id)) // Remove or mark as done
    onRead()
  }

  const getMessage = (notif: any) => {
    const name = notif.actor?.display_name || notif.actor?.username || "Alguien"
    switch (notif.type) {
      case 'LIKE': return <><span className="font-bold">{name}</span> indicó que le gusta tu {notif.entity_type === 'recipe' ? 'receta' : 'publicación'}.</>
      case 'COMMENT': return <><span className="font-bold">{name}</span> comentó en tu {notif.entity_type === 'recipe' ? 'receta' : 'publicación'}.</>
      case 'REPLY': return <><span className="font-bold">{name}</span> respondió a tu comentario.</>
      case 'MENTION': return <><span className="font-bold">{name}</span> te mencionó.</>
      case 'TAG': return <><span className="font-bold">{name}</span> te etiquetó.</>
      case 'FOLLOW': return <><span className="font-bold">{name}</span> empezó a seguirte.</>
      case 'FOLLOW_REQUEST': return <><span className="font-bold">{name}</span> quiere seguirte.</>
      case 'NEW_MESSAGE': return <><span className="font-bold">{name}</span> te envió un mensaje.</>;
      case 'FOLLOW_ACCEPT': return <><span className="font-bold">{name}</span> aceptó tu solicitud.</>
      case 'COOKED_RECIPE': return <><span className="font-bold">{name}</span> ha cocinado tu receta.</>
      default: return <><span className="font-bold">{name}</span> interactuó contigo.</>
    }
  }

  return (
    <div className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden flex flex-col max-h-[80vh] md:max-h-[500px]">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
        <h3 className="font-bold">Notificaciones</h3>
        <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline font-medium">
          Marcar leídas
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground p-4">Cargando...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 space-y-2">
            <p className="text-muted-foreground text-sm">No tienes notificaciones.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${notif.is_read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}
            >
              <div className="shrink-0 pt-1">
                <ProfileAvatar 
                  avatarUrl={notif.actor?.avatar?.storage_path || null} 
                  username={notif.actor?.display_name || notif.actor?.username || "U"} 
                   
                />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm leading-snug">{getMessage(notif)}</p>
                {notif.payload?.text && (
                  <p className="text-xs text-muted-foreground line-clamp-2 border-l-2 border-border pl-2 my-1">"{notif.payload.text}"</p>
                )}
                <p className="text-xs text-muted-foreground">{formatRelativeTime(notif.created_at)}</p>

                {notif.type === 'FOLLOW_REQUEST' && !notif.is_read && (
                  <div className="flex gap-2 pt-2">
                    <Button  onClick={(e) => handleFollowRequest(notif, 'accept', e)} className="h-8 rounded-full text-xs font-bold w-full bg-primary text-primary-foreground">
                      Aceptar
                    </Button>
                    <Button  variant="outline" onClick={(e) => handleFollowRequest(notif, 'reject', e)} className="h-8 rounded-full text-xs font-bold w-full">
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
              {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
