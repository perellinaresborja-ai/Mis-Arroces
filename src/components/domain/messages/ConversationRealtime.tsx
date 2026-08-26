"use client"
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ConversationRealtime({ conversationId }: { conversationId: string }) {
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('conv_' + conversationId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: 'conversation_id=eq.' + conversationId
      }, () => {
        router.refresh()
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, router])
  
  return null
}
