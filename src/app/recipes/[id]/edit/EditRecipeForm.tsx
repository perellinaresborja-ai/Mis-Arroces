"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Plus, Trash2 } from "lucide-react"

export default function EditRecipeForm({ recipe, catalogs }: { recipe: any, catalogs: any }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: recipe.name,
    description: recipe.description || "",
    status: recipe.status,
    visibility: recipe.visibility,
    style_id: recipe.style_id || "",
    variety_id: recipe.variety_id || "",
    base_servings: recipe.base_servings || 2,
    rice_qty: recipe.rice_qty || 0,
    stock_qty: recipe.stock_qty || 0,
    cook_time: recipe.cook_time || 0,
    rest_time: recipe.rest_time || 0,
  })

  // Basic dynamic array logic for steps
  const [steps, setSteps] = useState<any[]>(recipe.recipe_steps || [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    // Save main recipe data
    await supabase.from("recipes").update({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      visibility: formData.visibility,
      style_id: formData.style_id || null,
      variety_id: formData.variety_id || null,
      base_servings: Number(formData.base_servings),
      rice_qty: Number(formData.rice_qty),
      stock_qty: Number(formData.stock_qty),
      cook_time: Number(formData.cook_time),
      rest_time: Number(formData.rest_time),
    }).eq("id", recipe.id)

    // A real implementation would also sync steps, ingredients and vessels here
    // ...

    setIsSaving(false)
    router.push(`/recipes/${recipe.id}`)
  }

  const ratio = (formData.rice_qty > 0 && formData.stock_qty > 0) 
    ? (formData.stock_qty / formData.rice_qty).toFixed(2) 
    : "0"

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <h2 className="font-semibold text-lg">Información General</h2>
        
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </div>
        
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input name="description" value={formData.description} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Visibilidad</Label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value="PUBLIC">Público</option>
              <option value="FOLLOWERS">Seguidores</option>
              <option value="PRIVATE">Privado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <h2 className="font-semibold text-lg">Detalles Técnicos</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estilo</Label>
            <select name="style_id" value={formData.style_id} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value="">Selecciona...</option>
              {catalogs.styles.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Variedad de Arroz</Label>
            <select name="variety_id" value={formData.variety_id} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value="">Selecciona...</option>
              {catalogs.varieties.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="space-y-2">
            <Label>Comensales</Label>
            <Input name="base_servings" type="number" value={formData.base_servings} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Arroz (g)</Label>
            <Input name="rice_qty" type="number" value={formData.rice_qty} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Caldo (ml)</Label>
            <Input name="stock_qty" type="number" value={formData.stock_qty} onChange={handleChange} />
          </div>
        </div>

        <div className="p-3 bg-primary/10 text-primary font-medium rounded-lg text-sm flex justify-between items-center">
          <span>Ratio Caldo/Arroz calculado:</span>
          <span className="text-lg">1 : {ratio}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cocción (min)</Label>
            <Input name="cook_time" type="number" value={formData.cook_time} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Reposo (min)</Label>
            <Input name="rest_time" type="number" value={formData.rest_time} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* Steps (Basic Mock for demonstration) */}
      <section className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Pasos</h2>
          <Button variant="outline" size="sm" onClick={() => setSteps([...steps, { step_number: steps.length + 1, instruction: "" }])}>
            <Plus className="w-4 h-4 mr-1" /> Añadir
          </Button>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="bg-muted text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                {idx + 1}
              </div>
              <Input 
                value={step.instruction} 
                onChange={e => {
                  const newSteps = [...steps]
                  newSteps[idx].instruction = e.target.value
                  setSteps(newSteps)
                }} 
                placeholder="Ej. Sofreír la carne..." 
              />
              <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setSteps(steps.filter((_, i) => i !== idx))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {steps.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay pasos añadidos.</p>}
        </div>
      </section>

      <Button onClick={handleSave} className="w-full h-14 text-lg rounded-xl sticky bottom-20 shadow-lg" disabled={isSaving}>
        <Save className="w-5 h-5 mr-2" /> {isSaving ? "Guardando..." : "Guardar Receta"}
      </Button>
    </div>
  )
}
