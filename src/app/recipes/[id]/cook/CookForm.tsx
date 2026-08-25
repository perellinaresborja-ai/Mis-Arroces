"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { uploadMedia } from "@/services/media/client"
import { createCookingSession } from "@/app/actions/sessions"
import { v4 as uuidv4 } from "uuid"
import { Save, Clock, Calendar } from "lucide-react"

export function CookForm({ recipeId, initialData }: { recipeId: string, initialData?: any }) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>(initialData?.media || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(initialData?.scheduled_for ? initialData.scheduled_for.substring(0, 16) : "")
  
  const isCurrentlyPublished = initialData?.status === 'PUBLISHED' && (!initialData.scheduled_for || new Date(initialData.scheduled_for) <= new Date());
  const isCurrentlyScheduled = initialData?.status === 'PUBLISHED' && initialData.scheduled_for && new Date(initialData.scheduled_for) > new Date();

  const submitWithAction = async (action: 'DRAFT' | 'PUBLISH' | 'SCHEDULE' | 'UPDATE') => {
    const form = document.getElementById("cook-form") as HTMLFormElement
    const formData = new FormData(form)
    
    let finalStatus = initialData?.status || 'DRAFT'
    let finalScheduledFor = initialData?.scheduled_for || null

    if (action === 'DRAFT') {
      finalStatus = 'DRAFT'
      finalScheduledFor = null
    } else if (action === 'PUBLISH') {
      finalStatus = 'PUBLISHED'
      finalScheduledFor = null
    } else if (action === 'SCHEDULE') {
      if (!scheduleDate) return alert("Selecciona fecha y hora.")
      finalStatus = 'PUBLISHED'
      finalScheduledFor = new Date(scheduleDate).toISOString()
    } else if (action === 'UPDATE') {
      finalStatus = initialData?.status || 'DRAFT'
      finalScheduledFor = initialData?.scheduled_for || null
    }
    
    formData.set("status", finalStatus)
    if (finalScheduledFor) {
      formData.set("scheduled_for", finalScheduledFor)
    } else {
      formData.delete("scheduled_for")
    }
    
    if (initialData?.id) {
      formData.set("id", initialData.id)
    }
    
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const sessionId = initialData?.id || uuidv4()
      if (!initialData?.id) {
        formData.set("id", sessionId)
      }

      const mediaIds = await Promise.all(
        selectedMedia.map(async (m) => {
          // If we had existing media support, we would check here. 
          // For now, all SelectedMedia from MediaUploader are new files.
          const uploadedPath = await uploadMedia(m.file, "sessions", sessionId)
          return uploadedPath // Note: uploadMedia actually returns the mediaAsset.id directly!
        })
      )
      
      if (mediaIds.length > 0) {
        formData.set("media_ids", JSON.stringify(mediaIds))
      }
      
      await createCookingSession(formData)
    } catch (err: any) {
      setErrorMsg(err.message || "Error guardando el historial")
      setIsSubmitting(false)
    }
  }

  return (
    <form id="cook-form" onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

      <div className="space-y-4">
        <MediaUploader context="sessions" maxItems={3} onMediaChange={setSelectedMedia} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Valoración (1-5)</Label>
          <Input type="number" id="rating" name="rating" min="1" max="5" defaultValue={initialData?.rating || 5} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actualServings">Comensales</Label>
          <Input type="number" step="0.5" id="actualServings" name="actualServings" placeholder="Ej: 4" defaultValue={initialData?.actual_servings || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas o comentarios</Label>
        <textarea 
          id="notes" 
          name="notes" 
          rows={3} 
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          placeholder="¿Qué tal salió? ¿Algún truco?"
          defaultValue={initialData?.notes || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="modifications">Cambios en ingredientes</Label>
        <textarea 
          id="modifications" 
          name="modifications" 
          rows={2} 
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ej: Menos agua, usé ñora en vez de pimentón..."
          defaultValue={initialData?.modifications || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibilidad</Label>
        <select name="visibility" id="visibility" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" defaultValue={initialData?.visibility || "PUBLIC"}>
          <option value="PUBLIC">Público</option>
          <option value="FOLLOWERS">Solo Seguidores</option>
          <option value="PRIVATE">Privado</option>
        </select>
      </div>

      <input type="hidden" name="recipeId" value={recipeId} />

      {showSchedule && (
        <div className="bg-muted/30 p-4 rounded-xl border border-border mt-6">
          <Label className="mb-2 block">Fecha y Hora de Publicación</Label>
          <div className="flex gap-2">
            <Input 
              type="datetime-local" 
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setShowSchedule(false)}>Cerrar</Button>
            <Button type="button" onClick={() => submitWithAction('SCHEDULE')} disabled={isSubmitting || !scheduleDate}>
              <Calendar className="w-4 h-4 mr-2" /> Programar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center pt-4 border-t border-border">
        <div className="flex w-full md:w-auto">
          {!isCurrentlyPublished && (
            <Button type="button" variant="outline" className="flex-1 md:flex-none h-12 rounded-xl" onClick={() => submitWithAction('DRAFT')} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> Guardar historial
            </Button>
          )}
          
          {isCurrentlyPublished && (
            <Button type="button" variant="outline" className="flex-1 md:flex-none h-12 rounded-xl text-muted-foreground" onClick={() => submitWithAction('DRAFT')} disabled={isSubmitting}>
              Pasar a borrador
            </Button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {isCurrentlyScheduled && (
            <Button type="button" variant="outline" className="flex-1 md:flex-none h-12 rounded-xl" onClick={() => submitWithAction('UPDATE')} disabled={isSubmitting}>
              Guardar cambios
            </Button>
          )}

          {isCurrentlyPublished && (
            <Button type="button" className="flex-1 md:flex-none h-12 rounded-xl font-bold" onClick={() => submitWithAction('UPDATE')} disabled={isSubmitting}>
              Guardar cambios
            </Button>
          )}

          {!isCurrentlyPublished && (
            <>
              <Button type="button" variant="secondary" className="flex-1 md:flex-none h-12 rounded-xl" onClick={() => setShowSchedule(!showSchedule)} disabled={isSubmitting}>
                <Clock className="w-4 h-4 mr-2" /> Programar
              </Button>
              <Button type="button" className="flex-1 md:flex-none h-12 rounded-xl font-bold" onClick={() => submitWithAction('PUBLISH')} disabled={isSubmitting}>
                {isCurrentlyScheduled ? "Publicar ahora" : "Publicar sesión"}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}