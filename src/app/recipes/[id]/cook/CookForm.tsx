"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MediaUploader, SelectedMedia } from "@/components/domain/MediaUploader"
import { createCookingSession } from "@/app/actions/sessions"
import { Save, Calendar, Clock, ChevronDown, ChevronUp, Star } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { uploadMedia } from "@/services/media/client"

export function CookForm({ recipeId, initialData, snapshotData }: { recipeId: string, initialData?: any, snapshotData?: any }) {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>(initialData?.media || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [showOverride, setShowOverride] = useState(false)

  // Snapshots vs Real
  const [riceGrams, setRiceGrams] = useState(initialData?.rice_grams || snapshotData?.rice_grams || "")
  const [liquidMl, setLiquidMl] = useState(initialData?.liquid_ml || snapshotData?.liquid_ml || "")
  const [diameter, setDiameter] = useState(initialData?.diameter_cm || snapshotData?.diameter_cm || "")
  const [servings, setServings] = useState(initialData?.actual_servings || snapshotData?.base_servings || "")
  const [heatSource, setHeatSource] = useState(initialData?.heat_source || "")
  const [distribution, setDistribution] = useState(initialData?.ingredient_distribution || "")

  // Results
  const [texture, setTexture] = useState(initialData?.result_texture || "")
  const [liquid, setLiquid] = useState(initialData?.result_liquid || "")
  const [layer, setLayer] = useState(initialData?.reported_layer || "")
  const [socarrat, setSocarrat] = useState(initialData?.socarrat_level || 0)
  const [rating, setRating] = useState(initialData?.rating || 0)

  const submitWithAction = async (action: 'DRAFT' | 'PUBLISH') => {
    const form = document.getElementById("cook-form") as HTMLFormElement
    const formData = new FormData(form)
    
    formData.set("status", action === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT')
    if (initialData?.id) formData.set("id", initialData.id)
    
    // Add empirical overrides
    if (riceGrams) formData.set("rice_grams", riceGrams.toString())
    if (liquidMl) formData.set("liquid_ml", liquidMl.toString())
    if (diameter) formData.set("diameter_cm", diameter.toString())
    if (servings) formData.set("actualServings", servings.toString())
    if (heatSource) formData.set("heat_source", heatSource)
    if (distribution) formData.set("ingredient_distribution", distribution)
    
    // Add result answers
    if (texture) formData.set("result_texture", texture)
    if (liquid) formData.set("result_liquid", liquid)
    if (layer) formData.set("reported_layer", layer)
    if (socarrat) formData.set("socarratLevel", socarrat.toString())
    if (rating) formData.set("rating", rating.toString())
    
    // Hidden snapshots
    if (snapshotData?.rice_variety_id) formData.set("rice_variety_id", snapshotData.rice_variety_id)
    if (snapshotData?.vessel_type_id) formData.set("vessel_type_id", snapshotData.vessel_type_id)
    if (snapshotData?.cook_time) formData.set("cooking_time_minutes", snapshotData.cook_time.toString())

    setIsSubmitting(true)
    setErrorMsg(null)
    
    try {
      const sessionId = initialData?.id || uuidv4()
      if (!initialData?.id) {
        formData.set("id", sessionId)
      }

      const mediaIds = await Promise.all(
        selectedMedia.map(async (m) => {
          const uploadedPath = await uploadMedia(m.file, "sessions", sessionId)
          return uploadedPath 
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
      {errorMsg && <p className="text-destructive font-medium bg-destructive/10 p-3 rounded-xl">{errorMsg}</p>}

      <div className="space-y-4">
        <MediaUploader context="sessions" maxItems={3} onMediaChange={setSelectedMedia} />
      </div>

      {/* COMPACT SUMMARY */}
      <div className="bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Datos del cocinado</h3>
          <button 
            type="button" 
            onClick={() => setShowOverride(!showOverride)}
            className="text-sm font-semibold text-primary flex items-center gap-1"
          >
            Modificar datos reales {showOverride ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </button>
        </div>
        
        {!showOverride && (
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {riceGrams && <span>🍚 {riceGrams}g arroz</span>}
            {liquidMl && <span>💧 {liquidMl}ml líquido</span>}
            {diameter && <span>🥘 {diameter}cm</span>}
            {servings && <span>👥 {servings} pax</span>}
            {snapshotData?.variety_name && <span>🌾 {snapshotData.variety_name}</span>}
            {heatSource && <span>🔥 {heatSource}</span>}
          </div>
        )}

        {showOverride && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <Label className="text-xs">Arroz (g)</Label>
              <Input type="number" value={riceGrams} onChange={e => setRiceGrams(e.target.value)} placeholder="Ej: 400" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Líquido (ml)</Label>
              <Input type="number" value={liquidMl} onChange={e => setLiquidMl(e.target.value)} placeholder="Ej: 2000" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Diámetro (cm)</Label>
              <Input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} placeholder="Ej: 55" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Raciones</Label>
              <Input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="Ej: 4" className="h-9"/>
            </div>
            
            <div className="col-span-2 space-y-1 mt-2">
              <Label className="text-xs">Fuente de Calor</Label>
              <div className="flex flex-wrap gap-2">
                {['GAS', 'LEÑA', 'INDUCCIÓN', 'VITRO', 'HORNO', 'OTRO'].map(src => (
                  <button
                    key={src} type="button"
                    onClick={() => setHeatSource(src)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${heatSource === src ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-1 mt-2">
              <Label className="text-xs">Distribución Ingredientes</Label>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setDistribution('CLEAN')} className={`text-left px-3 py-2 text-sm rounded-xl border transition-colors ${distribution === 'CLEAN' ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                  Arroz bastante libre
                </button>
                <button type="button" onClick={() => setDistribution('MIXED')} className={`text-left px-3 py-2 text-sm rounded-xl border transition-colors ${distribution === 'MIXED' ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                  Ingredientes mezclados
                </button>
                <button type="button" onClick={() => setDistribution('HEAVY')} className={`text-left px-3 py-2 text-sm rounded-xl border transition-colors ${distribution === 'HEAVY' ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                  Muchos tropezones
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS QUESTIONS */}
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <Label>Punto del Arroz</Label>
          <div className="grid grid-cols-3 gap-2">
            {[{val: 'HARD', label: 'Duro'}, {val: 'PERFECT', label: 'Perfecto'}, {val: 'SOFT', label: 'Pasado'}].map(o => (
              <button key={o.val} type="button" onClick={() => setTexture(o.val)} className={`h-10 text-sm font-medium rounded-xl border transition-colors ${texture === o.val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Líquido</Label>
          <div className="grid grid-cols-3 gap-2">
            {[{val: 'DRY', label: 'Faltó'}, {val: 'PERFECT', label: 'Justo'}, {val: 'SOUPY', label: 'Sobró'}].map(o => (
              <button key={o.val} type="button" onClick={() => setLiquid(o.val)} className={`h-10 text-sm font-medium rounded-xl border transition-colors ${liquid === o.val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Capa Real Percebida</Label>
          <div className="grid grid-cols-3 gap-2">
            {[{val: 'THIN', label: 'Fina'}, {val: 'MEDIUM', label: 'Media'}, {val: 'THICK', label: 'Abundante'}].map(o => (
              <button key={o.val} type="button" onClick={() => setLayer(o.val)} className={`h-10 text-sm font-medium rounded-xl border transition-colors ${layer === o.val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Socarrat</Label>
          <div className="grid grid-cols-3 gap-2">
            {[{val: 1, label: 'Sin'}, {val: 3, label: 'Bueno'}, {val: 5, label: 'Quemado'}].map(o => (
              <button key={o.val} type="button" onClick={() => setSocarrat(o.val)} className={`h-10 text-sm font-medium rounded-xl border transition-colors ${socarrat === o.val ? 'bg-orange-500 text-white border-orange-500' : 'bg-card border-border hover:bg-muted'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Valoración General</Label>
          <div className="flex gap-2 items-center justify-center py-2 bg-muted/20 rounded-xl border border-border">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas o comentarios (Opcional)</Label>
          <textarea 
            id="notes" 
            name="notes" 
            rows={2} 
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            placeholder="¿Algún truco o apunte para la próxima?"
            defaultValue={initialData?.notes || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibilidad del Cook Log</Label>
        <select name="visibility" id="visibility" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" defaultValue={initialData?.visibility || "PRIVATE"}>
          <option value="PRIVATE">Solo para mí (Privado)</option>
          <option value="FOLLOWERS">Solo Seguidores</option>
          <option value="PUBLIC">Comunidad (Público)</option>
        </select>
      </div>

      <input type="hidden" name="recipeId" value={recipeId} />

      <div className="flex pt-4 border-t border-border">
        <Button type="button" className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => submitWithAction('PUBLISH')} disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar en Mis Arroces"}
        </Button>
      </div>
    </form>
  )
}