// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NutritionSection, AllergensSection } from "@/components/domain/NutritionSection"
import { calculateNutrition } from "@/lib/nutrition"
import { EscandalloSection } from "@/components/domain/EscandalloSection"

import { AddToCartButton } from "@/components/domain/AddToCartButton"
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Check, Clock, EyeOff, Calendar, AlertCircle } from "lucide-react"
import { updateRecipeFull } from "@/app/actions/recipes"
import { extractRealRiceGrams, calculateLayer, getRecommendedDiameter, LayerType } from "@/lib/paella-calculator"
import { cn, formatUnitSymbol } from "@/lib/utils"
import { RecipeMediaManager, MediaItem } from "./RecipeMediaManager"
import { StepMediaManager, StepMediaItem } from "./StepMediaManager"
import { uploadMedia } from "@/services/media/client"
import { validateRecipeForPublishing } from "@/lib/recipe-validator"
import { RiceVarietySelect } from "@/components/domain/recipes/RiceVarietySelect"
import { StockIngredientSelect } from "@/components/domain/recipes/StockIngredientSelect"


function CollapsibleSection({ id, title, defaultOpen = false, forceOpen, children, rightAction }: { id?: string, title: React.ReactNode, defaultOpen?: boolean, forceOpen?: boolean, children: React.ReactNode, rightAction?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  React.useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
    }
  }, [forceOpen])

  return (
    <div id={id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-8 scroll-mt-24">
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
  const [targetLayer, setTargetLayer] = useState<LayerType>('Fina')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [technicalError, setTechnicalError] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<{ basic?: boolean, technical?: boolean, ingredients?: boolean, steps?: boolean }>({})
  
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
      stock_ingredient_id: recipe.stock_ingredient_id || "",
      cook_time: recipe.cook_time || "",
      rest_time: recipe.rest_time || "",
      difficulty: recipe.difficulty || "",
      vessel_type_id: initialVessel.vessel_type_id || "",
      vessel_diameter_cm: initialVessel.diameter_cm || "",
      vessel_notes: initialVessel.notes || "",
      tags: (recipe.recipe_tags || recipe.tags)?.map((t: any) => t.tag_id) || [],
      steps: (recipe.recipe_steps || recipe.steps)?.sort((a: any, b: any) => a.step_number - b.step_number).map((s: any) => {
          const { id, ...rest } = s;
          return {
            ...rest, db_id: id,
            mediaItem: s.media_id && s.media ? { type: 'existing', id: s.media_id, url: `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${s.media.storage_path}` } : null
          }
        }) || [],
      ingredients: (recipe.recipe_ingredients || recipe.ingredients)?.sort((a: any, b: any) => a.display_order - b.display_order).map((ing: any) => {
        const { id, ...rest } = ing;
        return { ...rest, db_id: id }
      }) || []
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

  const { fields: stepFields, append: appendStep, remove: removeStep, move: moveStep, insert: insertStep } = useFieldArray({
    control,
    name: "steps"
  })

  const { fields: ingFields, append: appendIng, remove: removeIng, move: moveIng } = useFieldArray({
    control,
    name: "ingredients"
  })

  const watchTags = watch("tags")

  const toggleTag = (tagId: string) => {
    const current = watchTags || []
    if (current.includes(tagId)) {
      setValue("tags", current.filter((id: string) => id !== tagId))
    } else {
      setValue("tags", [...current, tagId])
    }
  }

  const scrollToErrorField = (field: 'name' | 'base_servings' | 'ingredients' | 'steps') => {
    if (field === 'name') {
      setOpenSections(prev => ({ ...prev, basic: true }))
      setTimeout(() => {
        const el = document.getElementById('field-recipe-name')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus()
      }, 100)
    } else if (field === 'base_servings') {
      setOpenSections(prev => ({ ...prev, technical: true }))
      setTimeout(() => {
        const el = document.getElementById('field-base-servings')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus()
      }, 100)
    } else if (field === 'ingredients') {
      setOpenSections(prev => ({ ...prev, ingredients: true }))
      setTimeout(() => {
        const el = document.getElementById('section-ingredients')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else if (field === 'steps') {
      setOpenSections(prev => ({ ...prev, steps: true }))
      setTimeout(() => {
        const el = document.getElementById('section-steps')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    if (recipe.status === 'PUBLISHED') return;
    
    let timeoutId: NodeJS.Timeout;
    const subscription = watch((value) => {
      setAutosaveStatus('saving');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const currentValues = getValues();
          // Stripping down just enough to save it as draft
          const cleanData = {
            name: currentValues.name,
            description: currentValues.description,
            base_servings: currentValues.base_servings,
            rice_qty: currentValues.rice_qty,
            stock_qty: currentValues.stock_qty,
            stock_ingredient_id: currentValues.stock_ingredient_id,
            cook_time: currentValues.cook_time,
            rest_time: currentValues.rest_time,
            difficulty: currentValues.difficulty,
            status: 'DRAFT',
            scheduled_for: null,
            ingredients: currentValues.ingredients,
            steps: currentValues.steps.map((s: any) => {
              const cleanStep = { ...s };
              delete cleanStep.mediaItem;
              return cleanStep;
            }),
            vessels: [{
              vessel_type_id: currentValues.vessel_type_id,
              diameter_cm: currentValues.vessel_diameter_cm,
              notes: currentValues.vessel_notes
            }],
            media_ids: mediaItems.filter(m => m.type === 'existing').map(m => m.id),
            tags: currentValues.tags,
            variety_id: currentValues.variety_id,
          };
          await updateRecipeFull(recipe.id, cleanData, true);
          setAutosaveStatus('saved');
          setTimeout(() => setAutosaveStatus('idle'), 3000);
        } catch (error) {
          console.error("Autosave failed", error);
          setAutosaveStatus('idle');
        }
      }, 1500);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [watch, getValues, recipe.id, recipe.status, mediaItems]);

  const submitWithAction = async (action: 'DRAFT' | 'PUBLISH' | 'SCHEDULE' | 'UPDATE') => {
    let finalStatus = recipe.status
    let finalScheduledFor = recipe.scheduled_for || null

    setTechnicalError(null)

    if (action === 'DRAFT') {
      finalStatus = 'DRAFT'
      finalScheduledFor = null
      setValidationErrors([])
    } else if (action === 'PUBLISH') {
      finalStatus = 'PUBLISHED'
      finalScheduledFor = null
    } else if (action === 'SCHEDULE') {
      if (!scheduleDate) {
        setValidationErrors(["Por favor, selecciona una fecha y hora para programar la publicación."])
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      finalStatus = 'PUBLISHED'
      finalScheduledFor = new Date(scheduleDate).toISOString()
    } else if (action === 'UPDATE') {
      finalStatus = recipe.status
      finalScheduledFor = recipe.scheduled_for
    }

      // Client-side integrity check if destination or current status is PUBLISHED
      if (finalStatus === 'PUBLISHED') {
        const currentValues = getValues()
        
        const validation = validateRecipeForPublishing({
          name: currentValues.name,
          base_servings: currentValues.base_servings,
          rice_qty: currentValues.rice_qty,
          stock_qty: currentValues.stock_qty,
          stock_ingredient_id: currentValues.stock_ingredient_id,
          ingredients: currentValues.ingredients,
          steps: currentValues.steps
        })

        if (!validation.isValid) {
          setValidationErrors(validation.errorList)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          if (validation.issues.length > 0) {
            scrollToErrorField(validation.issues[0].field)
          }
          // Downgrade to DRAFT so we save the progress and don't lose data
          finalStatus = 'DRAFT'
          finalScheduledFor = null
        } else {
          setValidationErrors([])
        }
      } else {
        setValidationErrors([])
      }

      setValue('status', finalStatus)
      setValue('scheduled_for', finalScheduledFor)

      handleSubmit(onSubmit)()
    }

  const onSubmit = async (data: any) => {
    console.log("[INSTRUMENTATION] >>> onSubmit called.");
    setIsSaving(true)
    setTechnicalError(null)
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
          
          // DRAFTs stay in the editor, PUBLISHED recipes redirect to their public page
          const skipRedirect = cleanData.status === 'DRAFT';
          await updateRecipeFull(recipe.id, cleanData, skipRedirect);
          
          if (skipRedirect) {
            setIsSaving(false);
          }
      } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      console.error("Error al guardar receta:", err)
      
      const errMsg = err?.message || ""
      const isDomainValidationError = errMsg.startsWith("No se puede guardar como publicada:") || errMsg.startsWith("No se puede publicar la receta:")
      
      if (isDomainValidationError) {
        const cleanMsg = errMsg.replace(/^No se puede (guardar como publicada|publicar la receta):\s*/, '').trim()
        setValidationErrors(cleanMsg ? [cleanMsg] : ["La receta no cumple los requisitos para ser publicada."])
      } else {
        // Technical error: keep validation errors list intact, display technical error in separate banner
        setTechnicalError("Ha ocurrido un error inesperado al guardar la receta. Por favor, inténtalo de nuevo.")
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsSaving(false)
    }
  }

  // Determine current logical state
  const isCurrentlyScheduled = recipe.status === 'PUBLISHED' && recipe.scheduled_for && new Date(recipe.scheduled_for) > new Date();
  const isCurrentlyPublished = recipe.status === 'PUBLISHED' && !isCurrentlyScheduled;

  
  const watchedIngredients = watch('ingredients') || [];
  const watchedPortions = watch('base_servings');
  const watchedRiceQty = watch('rice_qty');
  const watchedStockQty = watch('stock_qty');
  const watchedVarietyId = watch('variety_id');
  const watchedStockId = watch('stock_ingredient_id');
  
  const computedRecipeIngredients = React.useMemo(() => {
    const list = watchedIngredients.map((wi: any) => {
      // attempt to match ingredient by canonical_ingredient_id or display_text
      let matchedIng = null;
      if (wi.canonical_ingredient_id) {
        matchedIng = catalogs?.ingredients?.find((i: any) => i.id === wi.canonical_ingredient_id);
      }
      if (!matchedIng && wi.display_text) {
        const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');
        const query = normalize(wi.display_text);
        
        if (query) {
          matchedIng = catalogs?.ingredients?.find((i: any) => i.normalized_name === query);
          if (!matchedIng) {
            matchedIng = catalogs?.ingredients?.find((i: any) => 
              i.ingredient_aliases?.some((a: any) => a.normalized_alias === query)
            );
          }
          if (!matchedIng && query.length > 4) {
            const candidates = catalogs?.ingredients?.filter((i: any) => 
              query.includes(i.normalized_name) || i.normalized_name.includes(query)
            ) || [];
            if (candidates.length === 1) matchedIng = candidates[0];
          }
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

    const gramsUnit = catalogs?.units?.find(u => u.name.toLowerCase() === 'gramos' || u.name.toLowerCase() === 'g');
    const mlUnit = catalogs?.units?.find(u => u.name.toLowerCase() === 'mililitros' || u.name.toLowerCase() === 'ml');

    if (watchedRiceQty && watchedVarietyId) {
      const variety = catalogs?.rice_varieties?.find(v => v.id === watchedVarietyId);
      if (variety && variety.ingredient_id) {
        const canonical = catalogs?.ingredients?.find(i => i.id === variety.ingredient_id);
        if (canonical) {
          list.push({
            id: 'virtual-rice',
            normalized_quantity: watchedRiceQty,
            unit_id: gramsUnit?.id,
            ingredient: canonical,
            ingredient_allergens: canonical.ingredient_allergens
          });
        }
      }
    }

    if (watchedStockQty && watchedStockId) {
      const canonical = catalogs?.ingredients?.find(i => i.id === watchedStockId);
      if (canonical) {
        list.push({
          id: 'virtual-stock',
          normalized_quantity: watchedStockQty,
          unit_id: mlUnit?.id || gramsUnit?.id,
          ingredient: canonical,
          ingredient_allergens: canonical.ingredient_allergens
        });
      }
    }

    return list;
  }, [watchedIngredients, catalogs, watchedRiceQty, watchedVarietyId, watchedStockQty, watchedStockId]);

  const nutritionResult = React.useMemo(() => {
    return calculateNutrition(computedRecipeIngredients as any, catalogs?.units as any, watchedPortions || 1);
  }, [computedRecipeIngredients, catalogs, watchedPortions]);
  
  return (
  <form onSubmit={(e) => e.preventDefault()} className="space-y-8 pb-32">
      {/* Banner de Errores de Validación de Dominio */}
      {validationErrors.length > 0 && (
        <div id="validation-error-banner" className="bg-destructive/10 border border-destructive/30 text-destructive p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-base">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Para publicar la receta, debe estar completa y poder elaborarse de principio a fin:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm pl-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Banner de Errores Técnicos / Red (Separado de las reglas de dominio) */}
      {technicalError && (
        <div id="technical-error-banner" className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{technicalError}</span>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:bg-destructive/10"
            onClick={() => setTechnicalError(null)}
          >
            Cerrar
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <CollapsibleSection id="section-basic" title="Información Básica" defaultOpen={true} forceOpen={openSections.basic}>
          <div className="space-y-2 mb-6">
            <Label>Foto de Portada (Opcional)</Label>
            <RecipeMediaManager 
                initialMedia={recipe.recipe_media || recipe.media || []}
                onChange={setMediaItems}
              />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-recipe-name">Nombre</Label>
              <Input id="field-recipe-name" {...register("name")} />
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

        {/* Technical Details (Combined) */}
        <CollapsibleSection id="section-technical" title="Detalles Técnicos" forceOpen={openSections.technical}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* IZQUIERDA: Arroz y Caldo */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estilo</Label>
                <select {...register("style_id")} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="">Selecciona...</option>
                  {catalogs.styles.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Variedad de arroz</Label>
                  <RiceVarietySelect
                    varietyId={watch("variety_id")}
                    onChange={({ varietyId }) => setValue("variety_id", varietyId || "", { shouldDirty: true, shouldValidate: true })}
                    initialVarieties={catalogs.varieties || []}
                  />
                  <input type="hidden" {...register("variety_id")} />
                </div>
                <div className="space-y-2">
                  <Label className={validationErrors.find(e => e.includes("arroz")) ? "text-destructive" : ""}>Cantidad de arroz (g)</Label>
                  <input type="number" step="any" {...register("rice_qty")} className="w-full h-10 px-3 rounded-md border border-input bg-background" placeholder="Ej. 400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Líquido principal</Label>
                  <StockIngredientSelect
                    ingredientId={watch("stock_ingredient_id")}
                    onChange={({ ingredientId }) => setValue("stock_ingredient_id", ingredientId || "", { shouldDirty: true, shouldValidate: true })}
                    initialIngredients={catalogs.ingredients || []}
                  />
                  <input type="hidden" {...register("stock_ingredient_id")} />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad (ml)</Label>
                  <input type="number" step="any" {...register("stock_qty")} className="w-full h-10 px-3 rounded-md border border-input bg-background" placeholder="Ej. 1600" />
                </div>
              </div>
            </div>

            {/* DERECHA: Recipiente y Cocción */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipiente</Label>
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

              <div className="space-y-2">
                <Label>Material/Acabado (Opcional)</Label>
                <Input {...register("vessel_notes")} placeholder="Ej. Acero pulido, Esmaltada..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 mt-4">
            <div className="space-y-2">
              <Label htmlFor="field-base-servings">Comensales</Label>
              <Input id="field-base-servings" type="number" placeholder="Ej. 4" {...register("base_servings")} />
            </div>
            <div className="space-y-2">
              <Label>Cocción (min)</Label>
              <Input type="number" {...register("cook_time")} />
            </div>
            <div className="space-y-2">
              <Label>Reposo (min)</Label>
              <Input type="number" {...register("rest_time")} />
            </div>
          </div>

          {(() => {
            const wIngredients = watch('ingredients');
            const realRice = extractRealRiceGrams(wIngredients);
            const diaStr = watch('vessel_diameter_cm');
            const diaNum = Number(diaStr);
            if (!realRice) return null;

            const currentLayer = (diaNum > 0) ? calculateLayer(realRice, diaNum) : null;
            const recDia = getRecommendedDiameter(realRice, targetLayer);
            const needsChange = currentLayer !== targetLayer;

            return (
              <div className="mt-8 p-5 bg-muted/30 border border-border rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-1">Capa de Arroz</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Arroz total:</span>
                      <span className="font-bold">{realRice}g</span>
                      {currentLayer && (
                        <>
                          <span className="text-muted-foreground ml-2">Capa actual:</span>
                          <span className="font-bold uppercase">{currentLayer}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">¿CÓMO LA QUIERES?</Label>
                    <div className="flex gap-2">
                      {(['Fina', 'Media', 'Abundante'] as LayerType[]).map((l) => (
                        <Button
                          key={l}
                          type="button"
                          size="sm"
                          variant={targetLayer === l ? 'default' : 'outline'}
                          onClick={() => setTargetLayer(l)}
                        >
                          {l}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {needsChange && recDia > 0 && (
                  <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-between mt-4 border border-primary/20">
                    <span className="text-sm font-semibold">
                      Para capa {targetLayer.toLowerCase()} recomendamos ~{recDia} cm.
                    </span>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => setValue('vessel_diameter_cm', recDia, { shouldValidate: true })}
                    >
                      Usar {recDia} cm
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </CollapsibleSection>

        {/* Ingredients */}
        <CollapsibleSection id="section-ingredients" title="Ingredientes" forceOpen={openSections.ingredients} rightAction={
            <div className="flex items-center gap-1">
              <AddToCartButton recipeId={recipe.id} isAuthenticated={true} layout="icon" />
              <Button type="button" variant="outline" size="sm" onClick={() => {
                console.log("[INGREDIENT-TRACE] A) + Añadir pulsado");
                appendIng({ display_text: "", normalized_quantity: "", unit_id: "", is_scalable: true });
                setTimeout(() => {
                  console.log("[INGREDIENT-TRACE] A) Después de + Añadir (setTimeout):");
                  console.log("- ingFields length previo:", ingFields.length);
                  console.log("- getValues(ingredients):", getValues("ingredients"));
                }, 50);
              }}>
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
                      {(() => {
                        const { onChange: rOnChange, onBlur: rOnBlur, name: rName, ref: rRef } = register(`ingredients.${idx}.normalized_quantity`);
                        return (
                          <Input type="number" step="0.01" placeholder="Cant." name={rName} ref={rRef} onBlur={rOnBlur} defaultValue={field.normalized_quantity ?? ""} onChange={(e) => {
                            console.log("[INGREDIENT-TRACE] D) Cambia normalized_quantity", idx);
                            rOnChange(e);
                            setTimeout(() => {
                              console.log("- getValues(ingredients.idx):", getValues(`ingredients.${idx}`));
                              console.log("- getValues(ingredients) len:", getValues("ingredients")?.length);
                            }, 50);
                          }} />
                        );
                      })()}
                    </div>
                    <div className="col-span-8 md:col-span-3">
                      <select {...register(`ingredients.${idx}.unit_id`)} defaultValue={field.unit_id ?? ""} className="w-full h-10 px-2 rounded-md border border-input bg-background text-sm">
                        <option value="">Unidad (opc)</option>
                        {catalogs.units.map((u: any) => <option key={u.id} value={u.id}>{formatUnitSymbol(u.name)}</option>)}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      {(() => {
                        const { onChange: rOnChange, onBlur: rOnBlur, name: rName, ref: rRef } = register(`ingredients.${idx}.display_text`);
                        return (
                          <Input placeholder="" name={rName} ref={rRef} onBlur={rOnBlur} defaultValue={field.display_text ?? ""} onChange={(e) => {
                            console.log("[INGREDIENT-TRACE] B) Cambia display_text", idx);
                            console.log("- valor:", e.target.value, "nombre field:", rName);
                            rOnChange(e);
                            setTimeout(() => {
                              console.log("- getValues(ingredients.idx):", getValues(`ingredients.${idx}`));
                              console.log("- getValues(ingredients) length:", getValues("ingredients")?.length);
                            }, 50);
                          }} />
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" id={`scale-${idx}`} {...register(`ingredients.${idx}.is_scalable`)} defaultChecked={field.is_scalable ?? false} className="rounded border-input text-primary focus:ring-primary" />
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

        {(() => {
          const combinedEscandalloIngredients = [...ingFields];
          const riceQty = watch("rice_qty");
          const varietyId = watch("variety_id");
          if (riceQty && varietyId) {
            const variety = catalogs.varieties?.find((v: any) => v.id === varietyId);
            combinedEscandalloIngredients.unshift({
              id: "virtual_rice",
              db_id: "virtual_rice",
              display_text: variety?.name || "Arroz",
              normalized_quantity: riceQty,
              unit_id: catalogs.units?.find((u: any) => u.name.toLowerCase() === 'g')?.id || "",
              canonical_ingredient_id: variety?.id, // Utiliza el ID de variedad como id canónico
              is_virtual: true
            } as any);
          }
          const stockQty = watch("stock_qty");
          const stockIngId = watch("stock_ingredient_id");
          if (stockQty && stockIngId) {
            const stockIng = catalogs.ingredients?.find((i: any) => i.id === stockIngId);
            combinedEscandalloIngredients.unshift({
              id: "virtual_stock",
              db_id: "virtual_stock",
              display_text: stockIng?.name || "Caldo",
              normalized_quantity: stockQty,
              unit_id: catalogs.units?.find((u: any) => u.name.toLowerCase() === 'ml')?.id || "",
              canonical_ingredient_id: stockIng?.canonical_ingredient_id || stockIng?.id,
              is_virtual: true
            } as any);
          }
          return <EscandalloSection recipeId={recipe.id} initialIngredients={combinedEscandalloIngredients} catalogs={catalogs} baseServings={Number(watch("base_servings") || 2)} setValue={setValue} />;
        })()}

          {/* Steps */}
        <CollapsibleSection id="section-steps" title="Pasos de Elaboración" forceOpen={openSections.steps} rightAction={<Button type="button" variant="outline" size="sm" onClick={() => appendStep({ instruction: "", duration_minutes: "", notes: "" })}>
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
                      {...register(`steps.${idx}.instruction`)}
                      defaultValue={field.instruction ?? ""}
                      className="flex min-h-[90px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                      placeholder="Ej. Sofreír la carne a fuego medio hasta que esté dorada." 
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input type="number" placeholder="Tiempo (min)" {...register(`steps.${idx}.duration_minutes`)} defaultValue={field.duration_minutes ?? ""} className="sm:w-1/3 rounded-xl bg-background" />
                    <Input placeholder="Notas (ej. Fuego fuerte)" {...register(`steps.${idx}.notes`)} defaultValue={field.notes ?? ""} className="sm:w-2/3 rounded-xl bg-background" />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-1 absolute md:static right-4 top-4 shrink-0">
                  <Button type="button" variant="ghost" size="icon" className="text-primary/70 hover:text-primary hover:bg-primary/10" onClick={() => insertStep(idx + 1, { instruction: "", duration_minutes: "", notes: "" })} title="Insertar paso debajo">
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => removeStep(idx)} title="Eliminar paso">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
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

        <CollapsibleSection title="Información Nutricional">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Los valores nutricionales se calculan automáticamente basándose en los ingredientes canónicos. No es necesario introducirlos a mano.
            </div>
            <NutritionSection result={nutritionResult} servings={watchedPortions || 1} hideTitle />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Alérgenos">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Los alérgenos se detectan automáticamente. Si falta alguno, asegúrate de que el ingrediente esté bien escrito.
            </div>
            <AllergensSection result={nutritionResult} hideTitle />
          </div>
        </CollapsibleSection>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-50">
        <div className="max-w-3xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {/* Left: Revert to draft if currently published */}
          <div>
            {recipe.status === 'PUBLISHED' ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-xl text-muted-foreground hover:text-destructive border-border hover:border-destructive/30"
                onClick={() => submitWithAction('DRAFT')}
                disabled={isSaving}
              >
                Pasar a Borrador
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-xl text-muted-foreground border-border"
                onClick={() => submitWithAction('DRAFT')}
                disabled={isSaving}
              >
                Guardar Borrador
              </Button>
            )}
          </div>

          {/* Right: Primary save/publish action */}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto ml-auto">
            {autosaveStatus === 'saving' && (
              <span className="text-sm text-muted-foreground flex items-center mr-2 animate-pulse">
                Guardando...
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-sm text-muted-foreground flex items-center mr-2">
                <Check className="w-4 h-4 mr-1 text-green-500" />
                Guardado
              </span>
            )}
            {recipe.status === 'PUBLISHED' ? (
              <Button 
                type="button" 
                variant="default"
                className="w-full sm:w-auto h-11 rounded-xl font-bold px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                onClick={() => submitWithAction('UPDATE')}
                disabled={isSaving}
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="default"
                className="w-full sm:w-auto h-11 rounded-xl font-bold px-8 bg-[#E69A21] hover:bg-[#E69A21]/90 text-white shadow-sm" 
                onClick={() => submitWithAction('PUBLISH')}
                disabled={isSaving}
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Publicando..." : "Publicar receta"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}