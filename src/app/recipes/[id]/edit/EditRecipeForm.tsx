// @ts-nocheck
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NutritionSection, AllergensSection } from "@/components/domain/NutritionSection"
import { calculateNutrition } from "@/lib/nutrition"
import { EscandalloSection } from "@/components/domain/EscandalloSection"

import { AddToCartButton } from "@/components/domain/AddToCartButton"
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Check, Clock, EyeOff, Calendar } from "lucide-react"
import { updateRecipeFull } from "@/app/actions/recipes"
import { cn, formatUnitSymbol } from "@/lib/utils"
import { RecipeMediaManager, MediaItem } from "./RecipeMediaManager"
import { StepMediaManager, StepMediaItem } from "./StepMediaManager"
import { uploadMedia } from "@/services/media/client"


function CollapsibleSection({ title, defaultOpen = false, children, rightAction }: { title: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode, rightAction?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="flex justify-between items-center w-full p-4 md:p-6 hover:bg-muted/30 transition-colors bg-card cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="font-bold text-lg text-charcoal flex-1">{title}</h2>
        <div className="flex items-center gap-4">
          {isOpen && rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}
          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
        </div>
      </div>
      {isOpen && (
        <div className="p-4 md:p-6 pt-0 border-t border-border mt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function EditRecipeForm({ recipe, catalogs }: { recipe: any, catalogs: any }) {
  const router = useRouter()
  console.log("RECIPE MOUNT MEDIA:", recipe.recipe_media);
  const [isSaving, setIsSaving] = useState(false)
  
  const initialScheduledFor = recipe.scheduled_for ? new Date(recipe.scheduled_for).toISOString().slice(0,16) : ""
  const [scheduleDate, setScheduleDate] = useState(initialScheduledFor)
  const [showSchedule, setShowSchedule] = useState(false)

  const initialVessel = recipe.recipe_vessels?.[0] || {}

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      name: recipe.name,
      description: recipe.description || "",
      status: recipe.status,
      visibility: recipe.visibility,
      scheduled_for: recipe.scheduled_for || "",
      style_id: recipe.style_id || "",
      variety_id: recipe.variety_id || "",
      heat_source_id: recipe.heat_source_id || "",
      base_servings: recipe.base_servings || "",
      rice_qty: recipe.rice_qty || "",
      stock_qty: recipe.stock_qty || "",
      cook_time: recipe.cook_time || "",
      rest_time: recipe.rest_time || "",
      difficulty: recipe.difficulty || "",
      vessel_type_id: initialVessel.vessel_type_id || "",
      vessel_diameter_cm: initialVessel.diameter_cm || "",
      vessel_notes: initialVessel.notes || "",
      tags: (recipe.recipe_tags || recipe.tags)?.map((t: any) => t.tag_id) || [],
      steps: (recipe.recipe_steps || recipe.steps)?.sort((a: any, b: any) => a.step_number - b.step_number).map((s: any) => ({
          ...s,
          mediaItem: s.media_id && s.media ? { type: 'existing', id: s.media_id, url: `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${s.media.storage_path}` } : null
        })) || [],
      ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => ({ ...ing, db_id: ing.id })) || []
    }
  })

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    (recipe.recipe_media || recipe.media)?.map((m: any) => ({
      id: m.media_id || m.media?.id,
      url: `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${m.media_assets?.storage_path || m.media?.storage_path}`,
      file: null,
      type: 'existing'
    })) || []
  )

  const { fields: stepFields, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray({
    control,
    name: "steps"
  })

  const { fields: ingFields, append: appendIng, remove: removeIng, move: moveIng } = useFieldArray({
    control,
    name: "ingredients"
  })

  const watchRiceQty = watch("rice_qty")
  const watchStockQty = watch("stock_qty")
  const watchTags = watch("tags")

  const ratio = (Number(watchRiceQty) > 0 && Number(watchStockQty) > 0) 
    ? (Number(watchStockQty) / Number(watchRiceQty)).toFixed(2) 
    : "0"

  const toggleTag = (tagId: string) => {
    const current = watchTags || []
    if (current.includes(tagId)) {
      setValue("tags", current.filter((id: string) => id !== tagId))
    } else {
      setValue("tags", [...current, tagId])
    }
  }

  const submitWithAction = async (action: 'DRAFT' | 'PUBLISH' | 'SCHEDULE' | 'UPDATE') => {
    let finalStatus = recipe.status
    let finalScheduledFor = recipe.scheduled_for || null

    if (action === 'DRAFT') {
      finalStatus = 'DRAFT'
      finalScheduledFor = null
    } else if (action === 'PUBLISH') {
      finalStatus = 'PUBLISHED'
      finalScheduledFor = null
    } else if (action === 'SCHEDULE') {
      if (!scheduleDate) return alert("Por favor, selecciona una fecha y hora para programar.")
      finalStatus = 'PUBLISHED'
      finalScheduledFor = new Date(scheduleDate).toISOString()
    } else if (action === 'UPDATE') {
      // Keep existing status and scheduled_for
      finalStatus = recipe.status
      finalScheduledFor = recipe.scheduled_for
    }

    setValue('status', finalStatus)
    setValue('scheduled_for', finalScheduledFor)

    handleSubmit(onSubmit)()
  }

  const onSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      
        console.log("Submitting mediaItems:", mediaItems);
          const finalMediaIds: string[] = []
        for (const item of mediaItems) {
          if (item.type === 'existing') {
            finalMediaIds.push(item.id!)
          } else if (item.file) {
            const uploadedId = await uploadMedia(item.file, 'recipes', recipe.id)
            finalMediaIds.push(uploadedId)
          }
        }
        data.media_ids = finalMediaIds
          console.log("FINAL MEDIA IDS:", finalMediaIds);

        // Upload step media
        if (data.steps && data.steps.length > 0) {
          for (let i = 0; i < data.steps.length; i++) {
            const s = data.steps[i];
            if (s.mediaItem) {
              if (s.mediaItem.type === 'new' && s.mediaItem.file) {
                const uploadedId = await uploadMedia(s.mediaItem.file, 'recipes', recipe.id)
                s.media_id = uploadedId;
              } else if (s.mediaItem.type === 'existing') {
                s.media_id = s.mediaItem.id;
              }
            } else {
              s.media_id = null;
            }
          }
        }


      
        // Strip out File objects to avoid Next.js payload limits
        const cleanData = { ...data };
        if (cleanData.steps) {
          cleanData.steps = cleanData.steps.map((s: any) => {
            const cleanStep = { ...s };
            delete cleanStep.mediaItem;
            return cleanStep;
          });
        }
        await updateRecipeFull(recipe.id, cleanData)

      
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      console.error(err)
      alert("Error: " + (err.message || JSON.stringify(err)))
      setIsSaving(false)
    }
  }

  // Determine current logical state
  const isCurrentlyScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date();
  const isCurrentlyPublished = recipe.status === 'PUBLISHED' && !isCurrentlyScheduled;

  
  const watchedIngredients = watch('ingredients');
  const watchedPortions = watch('portions');
  
  const computedRecipeIngredients = React.useMemo(() => {
    return watchedIngredients.map((wi: any) => {
      // attempt to match ingredient by canonical_ingredient_id or display_text
      let matchedIng = null;
      if (wi.canonical_ingredient_id) {
        matchedIng = catalogs?.ingredients?.find((i: any) => i.id === wi.canonical_ingredient_id);
      }
      if (!matchedIng && wi.display_text) {
        const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');
        const query = normalize(wi.display_text);
        
        if (query) {
          // 1. Exact match on normalized name
          matchedIng = catalogs?.ingredients?.find((i: any) => i.normalized_name === query);
          
          // 2. Exact match on aliases
          if (!matchedIng) {
            matchedIng = catalogs?.ingredients?.find((i: any) => 
              i.ingredient_aliases?.some((a: any) => a.normalized_alias === query)
            );
          }
          
          // 3. Very high confidence inclusion match (e.g. "aceite de oliva" inside "aceoite de oliva virgen extra") 
          // Actually, let's keep it strict or allow simple includes if length > 4 to avoid false positives.
          if (!matchedIng && query.length > 4) {
            const candidates = catalogs?.ingredients?.filter((i: any) => 
              query.includes(i.normalized_name) || i.normalized_name.includes(query)
            ) || [];
            
            // Only assign if there is EXACTLY ONE very clear candidate to avoid ambiguity
            if (candidates.length === 1) {
              matchedIng = candidates[0];
            }
          }
          
          // Ensure we update canonical_ingredient_id for saving!
          if (matchedIng) {
            wi.canonical_ingredient_id = matchedIng.id;
          }
        }
      }
      return {
        ...wi,
        ingredient: matchedIng,
        ingredient_allergens: matchedIng?.ingredient_allergens
      };
    });
  }, [watchedIngredients, catalogs]);

  const nutritionResult = React.useMemo(() => {
    return calculateNutrition(computedRecipeIngredients as any, catalogs?.units as any, watchedPortions || 1);
  }, [computedRecipeIngredients, catalogs, watchedPortions]);
  
  return (
  <form onSubmit={(e) => e.preventDefault()} className="space-y-8 pb-32">
      <div className="space-y-8">
        {/* Basic Info */}
        <CollapsibleSection title="Información Básica" defaultOpen={true}>
          <div className="space-y-2 mb-6">
            <Label>Foto de Portada (Obligatoria)</Label>
            <RecipeMediaManager 
                initialMedia={recipe.recipe_media || recipe.media || []}
                onChange={setMediaItems}
              />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...register("name", { required: true })} />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea 
                {...register("description")} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Cuenta la historia de este arroz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Privacidad</Label>
                <select {...register("visibility")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="PUBLIC">Público (Visible para todos)</option>
                  <option value="FOLLOWERS">Solo mis Seguidores</option>
                  <option value="PRIVATE">Privado (Solo yo)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Controla quién puede ver la receta una vez que esté publicada.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Technical Details */}
        <CollapsibleSection title="Detalles Técnicos">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label>Estilo</Label>
              <select {...register("style_id")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Selecciona...</option>
                {catalogs.styles.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Variedad de Arroz</Label>
              <select {...register("variety_id")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Selecciona...</option>
                {catalogs.varieties.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fuente de calor</Label>
              <select {...register("heat_source_id")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Selecciona...</option>
                {catalogs.heats.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dificultad</Label>
              <select {...register("difficulty")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Selecciona...</option>
                <option value="EASY">Fácil</option>
                <option value="MEDIUM">Media</option>
                <option value="HARD">Difícil</option>
                <option value="EXPERT">Experto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-border/50 mt-4">
            <div className="space-y-2">
              <Label>Comensales</Label>
              <Input type="number" {...register("base_servings")} />
            </div>
            <div className="space-y-2">
              <Label>Arroz (gr)</Label>
              <Input type="number" step="0.01" {...register("rice_qty")} />
            </div>
            <div className="space-y-2">
              <Label>Caldo (ml)</Label>
              <Input type="number" step="0.01" {...register("stock_qty")} />
            </div>
            <div className="space-y-2">
              <Label>Cocción</Label>
              <Input type="number" {...register("cook_time")} />
            </div>
            <div className="space-y-2">
              <Label>Reposo</Label>
              <Input type="number" {...register("rest_time")} />
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/10 text-primary font-medium rounded-lg text-sm flex justify-between items-center">
            <span>Ratio Caldo/Arroz calculado:</span>
            <span className="text-lg font-bold">1 : {ratio}</span>
          </div>
        </CollapsibleSection>

        {/* Vessel Details */}
        <CollapsibleSection title="Recipiente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label>Tipo de recipiente</Label>
              <select {...register("vessel_type_id")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Selecciona...</option>
                {catalogs.vessels.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Diámetro (cm)</Label>
              <Input type="number" step="0.1" {...register("vessel_diameter_cm")} placeholder="Ej. 40" />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label>Notas del recipiente (opcional)</Label>
            <Input {...register("vessel_notes")} placeholder="Ej. Paellera de acero pulido" />
          </div>
        </CollapsibleSection>

        {/* Ingredients */}
        <CollapsibleSection title="Ingredientes" rightAction={
            <div className="flex items-center gap-1">
              <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="icon" />
              <Button type="button" variant="outline" size="sm" onClick={() => appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true })}>
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
          }>
          
          <div className="space-y-4">
            {ingFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start bg-muted/50 p-2 md:p-3 rounded-lg border border-border/50">
                <div className="flex flex-col gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveIng(idx, idx - 1)} disabled={idx === 0}><ChevronUp className="w-4 h-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveIng(idx, idx + 1)} disabled={idx === ingFields.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 md:col-span-3">
                      <Input type="number" step="0.01" placeholder="Cant." {...register(`ingredients.${idx}.normalized_quantity`)} />
                    </div>
                    <div className="col-span-8 md:col-span-3">
                      <select {...register(`ingredients.${idx}.unit_id`)} className="w-full h-10 px-2 rounded-md border border-input bg-background text-sm">
                        <option value="">Unidad (opc)</option>
                        {catalogs.units.map((u: any) => <option key={u.id} value={u.id}>{formatUnitSymbol(u.name)}</option>)}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <Input placeholder="" {...register(`ingredients.${idx}.display_text`, { required: true })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" id={`scale-${idx}`} {...register(`ingredients.${idx}.is_scalable`)} className="rounded border-input text-primary focus:ring-primary" />
                    <label htmlFor={`scale-${idx}`} className="text-xs text-muted-foreground cursor-pointer">Escala con el nº de comensales</label>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeIng(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {ingFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay ingredientes añadidos.</p>}

            
          </div>
          </CollapsibleSection>

        <CollapsibleSection title="Información Nutricional (Cálculo automático)">
          <div className="text-sm text-muted-foreground mb-4">
            Los valores nutricionales se calculan automáticamente basándose en los ingredientes canónicos. No es necesario introducirlos a mano.
          </div>
          <NutritionSection result={nutritionResult} servings={watchedPortions || 1} hideTitle />
        </CollapsibleSection>

        <CollapsibleSection title="Alérgenos (Cálculo automático)">
          <div className="text-sm text-muted-foreground mb-4">
            Los alérgenos se detectan automáticamente. Si falta alguno, asegúrate de que el ingrediente esté bien escrito.
          </div>
          <AllergensSection result={nutritionResult} hideTitle />
        </CollapsibleSection>
        <EscandalloSection recipeId={recipe.id} initialIngredients={ingFields} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />

          {/* Steps */}
        <CollapsibleSection title="Pasos de Elaboración" rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendStep({ instruction: "", duration_minutes: "", notes: "" })}>
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>}>
          <div className="space-y-4">
            {stepFields.map((field, idx) => (
              <div key={field.id} className="relative flex flex-col md:flex-row gap-3 md:gap-4 items-start bg-muted/40 p-3 md:p-5 rounded-3xl border border-border shadow-sm">
                
                {/* Controles de orden */}
                <div className="flex md:flex-col gap-1 items-center shrink-0 md:pt-8">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => moveStep(idx, idx - 1)} disabled={idx === 0}><ChevronUp className="w-5 h-5" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => moveStep(idx, idx + 1)} disabled={idx === stepFields.length - 1}><ChevronDown className="w-5 h-5" /></Button>
                </div>
                
                {/* Media Manager (Left Card) */}
                <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-start">
                  <StepMediaManager 
                    initialMedia={field.mediaItem || null}
                    onChange={(item) => setValue(`steps.${idx}.mediaItem`, item)}
                  />
                </div>
                
                {/* Text Area (Center/Right Section) */}
                <div className="flex-1 space-y-3 w-full md:max-w-[65%] ml-auto md:pl-4">
                  <div className="relative">
                    <span className="absolute -top-2.5 left-3 bg-muted px-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider rounded">Paso {idx + 1}</span>
                    <textarea 
                      {...register(`steps.${idx}.instruction`, { required: true })}
                      className="flex min-h-[90px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                      placeholder="Ej. Sofreír la carne a fuego medio hasta que esté dorada." 
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input type="number" placeholder="Tiempo (min)" {...register(`steps.${idx}.duration_minutes`)} className="sm:w-1/3 rounded-xl bg-background" />
                    <Input placeholder="Notas (ej. Fuego fuerte)" {...register(`steps.${idx}.notes`)} className="sm:w-2/3 rounded-xl bg-background" />
                  </div>
                </div>

                {/* Acciones */}
                <Button type="button" variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 shrink-0 absolute md:static right-4 top-4" onClick={() => removeStep(idx)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            {stepFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No hay pasos añadidos. Escribe el primer paso.</p>}
          </div>
        </CollapsibleSection>

        {/* Tags */}
        {catalogs.tags && catalogs.tags.length > 0 && (
          <CollapsibleSection title="Etiquetas (Tags)">
            <div className="flex flex-wrap gap-2">
              {catalogs.tags.map((tag: any) => {
                const isSelected = watchTags?.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </CollapsibleSection>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-50">
        <div className="max-w-3xl mx-auto flex justify-end">
          <Button 
            type="button" 
            variant="default"
            className="w-full md:w-auto h-12 rounded-xl font-bold px-8" 
            onClick={() => submitWithAction('UPDATE')}
            disabled={isSaving}
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Guardando..." : "Guardar receta"}
          </Button>
        </div>
      </div>
    </form>
  )
}