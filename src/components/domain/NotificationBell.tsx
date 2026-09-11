"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotificationPanel } from "./NotificationPanel"
import { cn } from "@/lib/utils"
import { useUserSession } from "@/components/providers/UserSessionProvider"

export function NotificationBell({ className }: { className?: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUserSession()
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  const [supabase] = useState(() => createClient())

  const fetchUnread = async () => {
    if (!user) return
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: 'exact', head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false)
    
    setUnreadCount(count || 0)
  }

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnread()
      
      const channel = supabase.channel(`notifications_${user.id}_${Math.random()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
          () => {
            fetchUnread()
            setRefreshKey(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  if (!user) return null

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
        }} 
        className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-2 top-[70px] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 w-auto md:w-[400px] z-[100] max-h-[80vh] md:max-h-[500px]">
          <NotificationPanel 
            onClose={() => setIsOpen(false)} 
            onRead={() => fetchUnread()} 
            refreshKey={refreshKey}
          />
        </div>
      )}
    </div>
  )
}
