"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchConversations } from "@/app/actions/messaging"

export function UnreadBadge() {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const convs = await fetchConversations();
        const unread = convs.filter((c: any) => c.unreadCount > 0).length;
        setCount(unread);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCount()

    const channel = supabase.channel('global_unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchCount()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_members' }, () => {
        fetchCount()
      })
      .subscribe()

    const handleRead = () => fetchCount();
    window.addEventListener('messages_read', handleRead);

    return () => { 
      supabase.removeChannel(channel);
      window.removeEventListener('messages_read', handleRead);
    }
  }, [])

  if (count === 0) return null
  return <div className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full">{count}</div>
}
