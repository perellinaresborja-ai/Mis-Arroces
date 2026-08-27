"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Video, X, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { notifyNewMessage } from "@/app/actions/messaging"

export function MessageInput({ conversationId, receiverId, disabled }: { conversationId: string, receiverId?: string, disabled?: boolean }) {
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 50 * 1024 * 1024) return alert("File too large (max 50MB)")
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !file) return
    setIsSending(true)

    try {
      let messageType = 'TEXT'
      let entityId = null

      if (file) {
        messageType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        const ext = file.name.split('.').pop()
        const path = `${conversationId}/${crypto.randomUUID()}.${ext}`
        
        // Use file directly, it's safer when not using Server Actions for the surrounding code
        const { error: uploadError } = await supabase.storage.from('message_media').upload(path, file)
        if (uploadError) throw uploadError
        entityId = path
      } else {
        try {
          const url = new URL(content.trim())
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            messageType = 'LINK'
          }
        } catch (_) {}
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error("No user")

      const { data: msg, error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userData.user.id,
        type: messageType,
        body: content.trim() || null,
        entity_id: entityId
      }).select().single()

      if (insertError || !msg) throw insertError || new Error("Failed to insert message")

      // Call Server Action ONLY for notification, passing only simple strings
      await notifyNewMessage(conversationId, msg.id).catch(console.error)

      setContent("")
      setFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    } catch (err: Error | NodeJS.ErrnoException | unknown) {
      alert('Error enviando: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
      {previewUrl && (
        <div className="mb-4 relative inline-block">
          {file?.type.startsWith('video/') ? (
            <video src={previewUrl} className="max-h-40 rounded-xl" controls />
          ) : (
            <img src={previewUrl} className="max-h-40 rounded-xl object-cover" alt="Preview" />
          )}
          <button type="button" onClick={() => { setFile(null); setPreviewUrl(null) }} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="w-4 h-4"/></button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input type="file" hidden ref={fileInputRef} accept="image/*,video/mp4,video/webm" onChange={handleFile} disabled={disabled || isSending} />
        <Button type="button" variant="ghost" size="icon" disabled={disabled || isSending} onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-5 h-5"/></Button>
        <Input placeholder="Escribe un mensaje..." value={content} onChange={e => setContent(e.target.value)} disabled={disabled || isSending} className="flex-1 rounded-full bg-muted/50 border-border" />
        <Button type="submit" size="icon" disabled={disabled || isSending || (!content.trim() && !file)} className="rounded-full"><Send className="w-4 h-4"/></Button>
      </div>
    </form>
  )
}
