"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageBubble } from "@/components/domain/messages/MessageBubble"
import { MessageInput } from "@/components/domain/messages/MessageInput"

export function ClientChat({ initialMessages, userId, conversationId, myStatus, otherStatus, otherUserId }: { conversationId: string, initialMessages: Record<string, unknown>[], userId: string, myStatus: string, otherStatus?: string, otherUserId?: string }) {
  const [messages, setMessages] = useState<Record<string, unknown>[]>(initialMessages)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const channel = supabase.channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages((prev) => {
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Record<string, unknown>].sort((a, b) => new Date((a.created_at as string) || '').getTime() - new Date((b.created_at as string) || '').getTime())
        })
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex-1 p-4">
        {messages.map((msg: Record<string, unknown>) => (
          <MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 md:absolute md:bottom-0 md:left-0 md:right-0 w-full bg-card border-t border-border p-0 z-20">
        <MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} />
      </div>
    </div>
  )
}
