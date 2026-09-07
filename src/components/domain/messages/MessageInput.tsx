"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ArrowUp, Camera, Mic, Send, Trash2, Circle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { notifyNewMessage } from "@/app/actions/messaging"

export function MessageInput({ conversationId, receiverId, disabled, replyingTo, onCancelReply }: { conversationId: string, receiverId?: string, disabled?: boolean, replyingTo?: Record<string, any> | null, onCancelReply?: () => void }) {
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 50 * 1024 * 1024) return alert("File too large (max 50MB)")
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4' // fallback for Safari
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '' // let browser choose default
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error(err)
      alert("No se pudo acceder al micrófono. Verifica los permisos del navegador.")
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setRecordingTime(0)
    audioChunksRef.current = []
  }

  const stopRecordingAndSend = () => {
    if (!mediaRecorderRef.current) return
    
    // Create a promise to wait for the stop event which finalizes chunks
    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        
        setIsRecording(false)
        const finalTime = recordingTime
        setRecordingTime(0)

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current!.mimeType || 'audio/webm' })
        audioChunksRef.current = []
        
        if (finalTime < 1 || audioBlob.size === 0) {
           return resolve() // prevent sending empty/accidental short clicks
        }
        
        const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.${ext}`, { type: audioBlob.type })
        
        await sendPayload(audioFile, 'AUDIO')
        resolve()
      }
      mediaRecorderRef.current!.stop()
    })
  }

  const sendPayload = async (filePayload: File | null, typeOverride?: string) => {
    setIsSending(true)
    try {
      let messageType = typeOverride || 'TEXT'
      let mediaPath = null
      let actualContent = content.trim()

      if (filePayload) {
        if (!typeOverride) {
          messageType = filePayload.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        }
        const ext = filePayload.name.split('.').pop()
        const path = `${conversationId}/${crypto.randomUUID()}.${ext}`
        
        const { error: uploadError } = await supabase.storage.from('message_media').upload(path, filePayload, {
          cacheControl: '3600',
          upsert: false
        })
        if (uploadError) throw uploadError
        mediaPath = path
        actualContent = "" // Voice notes shouldn't have content text here
      } else {
        try {
          const url = new URL(actualContent)
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
        body: actualContent || null,
        reply_to_id: replyingTo?.id || null,
        entity_id: null
      }).select().single()

      if (insertError || !msg) {
        if (mediaPath) await supabase.storage.from('message_media').remove([mediaPath]).catch(()=>null)
        throw insertError || new Error("Failed to insert message")
      }

      if (mediaPath) {
        const { error: attachError } = await supabase.from('message_attachments').insert({
          message_id: msg.id,
          storage_path: mediaPath,
          mime_type: filePayload!.type,
          size_bytes: filePayload!.size
        })
        if (attachError) throw attachError
      }

      await notifyNewMessage(conversationId, msg.id).catch(console.error)

      if (typeOverride !== 'AUDIO') {
        setContent("")
        setFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      if (onCancelReply) onCancelReply()

    } catch (err: Error | NodeJS.ErrnoException | unknown) {
      alert('Error enviando: ' + (err instanceof Error ? err.message : JSON.stringify(err)))
    } finally {
      setIsSending(false)
    }
  }

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !file) return
    await sendPayload(file)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col w-full bg-card border-t border-border">
      {replyingTo && (
        <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border text-sm">
          <div className="truncate opacity-70 flex-1">
            <span className="font-bold mr-2">Respondiendo a:</span>
            {replyingTo.type === 'IMAGE' || replyingTo.type === 'VIDEO' ? 'Archivo adjunto' : replyingTo.type === 'AUDIO' ? 'Nota de voz' : replyingTo.body || replyingTo.content}
          </div>
          <button type="button" onClick={onCancelReply} className="p-1 hover:bg-background rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="p-4">
        {previewUrl && !isRecording && (
          <div className="mb-4 relative inline-block">
            {file?.type.startsWith('video/') ? (
              <video src={previewUrl} className="max-h-40 rounded-xl" controls />
            ) : (
              <img src={previewUrl} className="max-h-40 rounded-xl object-cover" alt="Preview" />
            )}
            <button type="button" onClick={() => { setFile(null); setPreviewUrl(null) }} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="w-4 h-4"/></button>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between gap-4 w-full h-10 px-2 animate-in fade-in zoom-in-95 duration-200">
            <Button type="button" variant="ghost" size="sm" onClick={cancelRecording} className="text-destructive font-semibold hover:bg-destructive/10 hover:text-destructive px-2">
              <Trash2 className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <Circle className="w-3 h-3 fill-current animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
            <Button type="button" size="sm" onClick={stopRecordingAndSend} disabled={isSending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-4">
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <input type="file" hidden ref={fileInputRef} accept="image/*,video/mp4,video/webm" onChange={handleFile} disabled={disabled || isSending} />
            <Input placeholder="Escribe un mensaje..." value={content} onChange={e => setContent(e.target.value)} disabled={disabled || isSending} className="flex-1 rounded-full bg-muted/50 border-border" />
            <Button type="button" size="icon" disabled={disabled || isSending} onClick={() => fileInputRef.current?.click()} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"><Camera className="w-5 h-5"/></Button>
            
            {content.trim() || file ? (
              <Button type="submit" size="icon" disabled={disabled || isSending} className="rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowUp className="w-5 h-5" strokeWidth={3} />
              </Button>
            ) : (
              <Button type="button" size="icon" disabled={disabled || isSending} onClick={startRecording} className="rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
