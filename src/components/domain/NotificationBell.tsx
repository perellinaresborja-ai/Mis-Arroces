"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotificationPanel } from "./NotificationPanel"
import { cn } from "@/lib/utils"

export function NotificationBell({ className }: { className?: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
      }
    })
  }, [supabase])

  const fetchUnread = async () => {
    if (!user) return
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: 'exact', head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false)
    
    setUnreadCount(count || 0)
  }

  useEffect(() => {
    if (user) {
      fetchUnread()
      const interval = setInterval(fetchUnread, 30000) // Poll every 30s
      return () => clearInterval(interval)
    }
  }, [user])

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
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen && unreadCount > 0) {
            setUnreadCount(0); // Optimistic clear
            import('@/app/actions/notifications').then(m => m.markAllNotificationsRead());
          }
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
          />
        </div>
      )}
    </div>
  )
}
