"use client"

import { useState } from "react"
import { createQuickRecipe } from "@/app/actions/recipes"
import { registerMediaAsset } from "@/app/actions/media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { Camera, Loader2 } from "lucide-react"

export default function CreateQuickRecipePage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      
      if (file) {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const fileExt = file.name.split('.').pop()
          const filePath = `${session.user.id}/${uuidv4()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from("recipe_media")
            .upload(filePath, file)
            
          if (uploadError) throw uploadError

          const mediaId = await registerMediaAsset(filePath, file.type)
          formData.append("media_asset_id", mediaId)
        }
      }

      await createQuickRecipe(formData)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      alert("Error al guardar la receta. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8 mt-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nuevo Arroz</h1>
          <p className="text-muted-foreground">Empieza con lo básico. Podrás editar el resto después.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Upload */}
          <div className="space-y-3">
            <Label>Foto Principal (Opcional)</Label>
            <div 
              className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Camera className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Toca para subir foto</span>
                </div>
              )}
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del arroz</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ej. Paella Valenciana de la abuela" 
              required 
              className="h-14 text-lg bg-card"
            />
          </div>

          <Button type="submit" className="w-full h-14 text-base rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...</>
            ) : (
              "Guardar y continuar"
            )}
          </Button>
          
        </form>
      </div>
    </div>
  )
}
