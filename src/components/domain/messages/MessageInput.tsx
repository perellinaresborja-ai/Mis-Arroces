"use client"
import { useState } from 'react'
import { sendMessage } from '@/app/actions/messaging'

export function MessageInput({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    
    try {
      const type = text.startsWith('http') ? 'LINK' : 'TEXT'
      await sendMessage(conversationId, type, text)
      setText('')
    } catch (err) {
      console.error(err)
      alert("Error al enviar")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSend} className="flex gap-2">
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        className="flex-1 bg-secondary rounded-full px-4 py-2 outline-none text-foreground" 
        placeholder="Mensaje..." 
        disabled={loading}
      />
      <button type="submit" disabled={loading} className="bg-primary text-primary-foreground font-bold px-4 rounded-full">
        {loading ? '...' : 'Enviar'}
      </button>
    </form>
  )
}
