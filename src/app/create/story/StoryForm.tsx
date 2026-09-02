"use client"

import { useState } from "react"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { uploadMedia } from "@/services/media/client"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { Loader2 } from "lucide-react"

export function StoryForm() {
  const [media, setMedia] = useState<SelectedMedia[]>([])
  const [caption, setCaption] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (media.length === 0) return alert("Añade una foto o vídeo")
    
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized")

      const storyId = uuidv4()
      
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      const { error: storyErr } = await supabase.from("stories").insert({
        id: storyId,
        owner_id: user.id,
        visibility: 'PUBLIC',
        caption: caption,
        expires_at: expiresAt.toISOString()
      })
      if (storyErr) throw storyErr

      const uploadedPath = await uploadMedia(media[0].file, "stories", storyId)
      
      await supabase.from("story_media").insert({
        story_id: storyId,
        media_id: uploadedPath,
        display_order: 0
      })

      router.push("/")
    } catch (err: unknown) {
      alert("Error: " + (err as Error).message)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <MediaUploader context={"sessions" as any} maxItems={1} onMediaChange={setMedia} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="caption">Mensaje (Opcional)</Label>
        <textarea
          id="caption"
          rows={3}
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          placeholder="Escribe algo..."
          maxLength={200}
        />
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isSubmitting || media.length === 0}>
        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Publicar historia
      </Button>
    </form>
  )
}
