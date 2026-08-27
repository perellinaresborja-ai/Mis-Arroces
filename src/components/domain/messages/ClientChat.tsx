"use client"
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageBubble } from '@/components/domain/messages/MessageBubble'
import { MessageInput } from '@/components/domain/messages/MessageInput'

export function ClientChat({ conversationId, initialMessages, userId, myStatus, otherStatus, otherUserId }: { conversationId: string, initialMessages: Record<string, unknown>[], userId: string, myStatus: string, otherStatus?: string, otherUserId?: string }) {
  const [messages, setMessages] = useState<Record<string, unknown>[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setMessages(prev => {
      const all = [...prev, ...initialMessages]
      const unique = Array.from(new Map(all.map(m => [m.id as string, m])).values())
      return unique.sort((a, b) => new Date((a.created_at as string) || '').getTime() - new Date((b.created_at as string) || '').getTime())
    })
  }, [initialMessages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('conv_' + conversationId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: 'conversation_id=eq.' + conversationId
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === (payload.new as Record<string, unknown>).id)) return prev;
          return [...prev, payload.new as Record<string, unknown>].sort((a, b) => new Date((a.created_at as string) || '').getTime() - new Date((b.created_at as string) || '').getTime())
        })
        
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const pendingRequest = otherStatus === 'REQUEST'
  const isRejected = otherStatus === 'REJECTED' || myStatus === 'REJECTED'

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative pb-32">
      <div className="flex-1 p-4">
        {messages.map((msg: Record<string, unknown>) => (
          <MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-card border-t border-border p-0 z-20">
        {pendingRequest ? (
          <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 font-medium">
            Solicitud enviada. Esperando respuesta.
          </div>
        ) : isRejected ? (
          <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 font-medium">
            No puedes enviar mensajes a esta conversación.
          </div>
        ) : myStatus === 'ACTIVE' ? (
          <MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} />
        ) : null}
      </div>
    </div>
  )
}
