"use server"

export const maxDuration = 60;

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { getCatalogs } from "@/app/actions/recipes"
import { parseAndMatchIngredient } from "@/lib/recipe-importer/matcher"

export async function parseRecipeFreeText(text: string, mediaBase64?: string, mimeType?: string) {
  const cleanText = text.trim()
  if (!cleanText || cleanText.length < 15) {
    return { error: "El texto es muy corto para extraer una receta." }
  }

  const systemPrompt = `Eres un asistente que extrae datos técnicos de recetas de cocina para la base de datos "Mis Arroces".
La receta suele ser de arroz o paella, pero puede ser de cualquier cosa.

REGLAS OBLIGATORIAS:
1. Tienes prohibido inventar información (ingredientes, cantidades, pasos o tiempos) que no esté en el texto o en el audio/vídeo proporcionado.
2. Si un dato dudoso o falta, devuélvelo como null.
3. ESTRICTA SEPARACIÓN DE SSOT (Single Source of Truth):
   - El ingrediente principal (arroz, pasta, etc.) y su cantidad van EN EXCLUSIVA a \`rice_qty\` y \`rice_variety_hint\`. NO los incluyas en \`ingredients\`.
   - El líquido (caldo, agua, fondo) y su cantidad van EN EXCLUSIVA a \`stock_qty\` y \`stock_ingredient_hint\`. NO los incluyas en \`ingredients\`.
   - El resto de ingredientes (carnes, verduras, especias, aceite) van a \`ingredients\`.
4. El título debe ser conciso. Si no hay, infiere uno corto (ej: "Paella de marisco").
5. La descripción SÓLO debe contener texto descriptivo (historia, consejos). NO metas aquí el recipiente, dificultad, estilo, ni ningún dato que ya tenga su propio campo.
6. DESGLOSE SECUENCIAL LÓGICO DE PASOS Y TIEMPOS: Si el texto original o el audio contiene varias fases temporales o cambios de acción en una misma frase (ej. "Cocinar 8 min a fuego fuerte y luego 9 min a fuego medio-bajo", o "hervir 10 min y reposar 5 min"), DIVÍDELO OBLIGATORIAMENTE en pasos independientes.
   - Paso X: "Cocinar a fuego fuerte." -> duration_minutes: 8
   - Paso X+1: "Bajar a fuego medio-bajo y continuar la cocción." -> duration_minutes: 9
   - Paso X+2: "Apagar y dejar reposar." -> duration_minutes: 5
   Reposos con tiempo siempre van en su propio paso. Cada cambio de fuego/acción que lleve tiempo es un paso distinto con su propio \`duration_minutes\`.
7. Fusiona inteligentemente el texto escrito y el audio/vídeo (si se adjunta). El texto y el audio se complementan. NO dupliques ingredientes y combina los pasos en orden cronológico real.
8. Responde ÚNICAMENTE con un JSON válido.`

  const baseSchema = {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string", nullable: true, description: "Solo descripción real o consejos. Nada de parámetros técnicos." },
      base_servings: { type: "number", nullable: true },
      rice_qty: { type: "number", nullable: true, description: "Cantidad del ingrediente principal (arroz) en gramos." },
      rice_variety_hint: { type: "string", nullable: true, description: "Nombre de la variedad de arroz (ej: Bomba, Albufera) para buscar su ID luego." },
      rice_detected_price: { type: "number", nullable: true, description: "Precio normalizado a número si se menciona (ej: 3.80)." },
      rice_detected_price_unit: { type: "string", nullable: true, description: "Unidad del precio del arroz (ej: 'kg', 'L', 'unidad')." },
      stock_qty: { type: "number", nullable: true, description: "Cantidad de líquido/caldo en mililitros (ml)." },
      stock_ingredient_hint: { type: "string", nullable: true, description: "Nombre del caldo o fondo (ej: Caldo de pescado) para buscar su ID luego." },
      stock_detected_price: { type: "number", nullable: true, description: "Precio normalizado a número si se menciona (ej: 3.80)." },
      stock_detected_price_unit: { type: "string", nullable: true, description: "Unidad del precio del caldo (ej: 'kg', 'L', 'unidad')." },
      rest_time_minutes: { type: "number", nullable: true, description: "Tiempo de reposo en minutos si se especifica." },
      cook_time_minutes: { type: "number", nullable: true, description: "Tiempo de cocción en minutos." },
      difficulty: { type: "string", nullable: true, enum: ["EASY", "MEDIUM", "HARD"] },
      style_hint: { type: "string", nullable: true, description: "Estilo (ej: Seco, Meloso, Caldoso)." },
      heat_source_hint: { type: "string", nullable: true, description: "Fuente de calor (ej: Gas, Leña, Inducción)." },
      vessel_type_hint: { type: "string", nullable: true, description: "Tipo de recipiente (ej: Paella, Olla, Cazuela)." },
      vessel_diameter_cm: { type: "number", nullable: true, description: "Diámetro en cm." },
      vessel_notes: { type: "string", nullable: true, description: "Material o notas del recipiente (ej: Pulida, Esmaltada)." },
      ingredients: {
        type: "array",
        description: "Lista de ingredientes SIN INCLUIR el arroz ni el caldo.",
        items: {
          type: "object",
          properties: {
            raw_text: { type: "string", description: "El nombre y cantidad del ingrediente (ej. '1 cebolla pequeña', '200g de pollo')" },
            detected_price: { type: "number", nullable: true, description: "Precio normalizado a número si se menciona expresamente (ej: 3.80). Si no se dice, null." },
            detected_price_unit: { type: "string", nullable: true, description: "Unidad a la que se refiere el precio (ej: 'kg', 'L', 'unidad'). Si no se dice, null." }
          },
          required: ["raw_text"]
        }
      },
      instructions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            instruction: { type: "string", description: "El paso de elaboraciÃ³n." },
            duration_minutes: { type: "number", nullable: true, description: "Tiempo de duraciÃ³n de este paso en minutos, solo si el texto lo menciona explÃ­citamente (ej. sofreÃ­r 5 minutos, reposo de 5 min). No inventes tiempos." }
          },
          required: ["instruction"]
        }
      }
    },
    required: ["title", "ingredients", "instructions"]
  };

  function toGeminiSchema(s: any): any {
    if (Array.isArray(s)) return s.map(toGeminiSchema);
    if (s !== null && typeof s === 'object') {
      const res: any = {};
      for (const k in s) {
        if (k === 'type' && typeof s[k] === 'string') res[k] = s[k].toUpperCase();
        else res[k] = toGeminiSchema(s[k]);
      }
      return res;
    }
    return s;
  }

  try {
    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) return { error: "No hay clave de API configurada para Gemini." };
    const key = rawKey.trim().replace(/['"]/g, '');
    
    let lastError = null;
    let parsedData = null;
    
    const fallbackModels = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"];
    let currentModelIndex = 0;

    const parts: any[] = [{ text: `${systemPrompt}\n\nTexto libre de la receta:\n${cleanText}` }];
    
    if (mediaBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: mediaBase64
        }
      });
    }

    for (let i = 1; i <= 3; i++) {
      try {
        const model = fallbackModels[currentModelIndex];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for audio processing

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema: toGeminiSchema(baseSchema) }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const status = res.status;
          const err = await res.text();
          if ([429, 500, 502, 503, 504].includes(status)) {
            lastError = `Gemini temp error ${status}`;
            if (i < 3) {
              if (currentModelIndex < fallbackModels.length - 1) {
                currentModelIndex++; // Fallback to next model
              } else {
                await new Promise(r => setTimeout(r, i * 1500));
              }
              continue;
            }
          }
          let cleanErr = err;
          try { cleanErr = JSON.parse(err).error.message; } catch(e) {}
          return { error: `Gemini (${status}) con modelo ${model}: ${cleanErr}` };
        }
        
        const json = await res.json();
        const str = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!str) return { error: "Respuesta vacía de la IA." };
        
        const cleanedStr = str.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        parsedData = JSON.parse(cleanedStr);
        break;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          lastError = "Timeout de Gemini superado";
          if (i < 3) {
            if (currentModelIndex < fallbackModels.length - 1) {
              currentModelIndex++; // Fallback to next model
            }
            continue;
          }
          return { error: "La IA tardó demasiado en responder (timeout). Inténtalo de nuevo." };
        }
        console.error("Gemini fetch exception:", err);
        return { error: "Fallo inesperado de red al conectar con IA." };
      }
    }
    
    if (!parsedData) return { error: "La IA está ocupada en este momento. Inténtalo de nuevo en unos segundos." };
    
    return { data: parsedData };
  } catch (err: any) {
    console.error("Gemini failed:", err);
    return { error: "Fallo inesperado al procesar la receta con IA." };
  }
}

export async function createAiRecipeDraft(text: string, mediaBase64?: string, mimeType?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Debes iniciar sesión para usar esta función." }

    const { data: aiData, error: aiError } = await parseRecipeFreeText(text, mediaBase64, mimeType)
    if (aiError || !aiData) return { error: aiError || "No se pudo procesar la receta con IA." }

    const slug = "receta-ia-" + Date.now()

    // 1. Fetch catalogs for proper matching
    const catalogs = await getCatalogs();

  let riceVarietyId = null;
  let stockIngredientId = null;

  if (aiData.rice_variety_hint && catalogs.varieties) {
    const hint = aiData.rice_variety_hint.toLowerCase();
    const match = catalogs.varieties.find((v:any) => hint.includes(v.name?.toLowerCase() || 'XXXXX'));
    if (match) riceVarietyId = match.id;
  }

  if (aiData.stock_ingredient_hint && catalogs.ingredients) {
    const hint = aiData.stock_ingredient_hint.toLowerCase();
    const match = catalogs.ingredients.find((i:any) => hint.includes(i.normalized_name?.toLowerCase() || 'XXXXX'));
    if (match) stockIngredientId = match.id;
  }

  let styleId = null;
  if (aiData.style_hint && catalogs.styles) {
    const hint = aiData.style_hint.toLowerCase();
    const match = catalogs.styles.find((s:any) => hint.includes(s.name?.toLowerCase() || 'XXXXX'));
    if (match) styleId = match.id;
  }

  let heatSourceId = null;
  if (aiData.heat_source_hint && catalogs.heats) {
    const hint = aiData.heat_source_hint.toLowerCase();
    const match = catalogs.heats.find((h:any) => hint.includes(h.name?.toLowerCase() || 'XXXXX'));
    if (match) heatSourceId = match.id;
  }

  let vesselTypeId = null;
  if (aiData.vessel_type_hint && catalogs.vessels) {
    const hint = aiData.vessel_type_hint.toLowerCase();
    const match = catalogs.vessels.find((v:any) => hint.includes(v.name?.toLowerCase() || 'XXXXX'));
    if (match) vesselTypeId = match.id;
  }

  // 2. Insert Base Recipe as DRAFT
  const { data: recipe, error: insertError } = await supabase.from('recipes').insert({
    owner_id: user.id,
    name: aiData.title || "Receta sin título",
    description: aiData.description || null,
    base_servings: aiData.base_servings || null,
    rice_qty: aiData.rice_qty || null,
    variety_id: riceVarietyId,
    stock_qty: aiData.stock_qty || null,
    stock_ingredient_id: stockIngredientId,
    rest_time: aiData.rest_time_minutes || null,
    cook_time: aiData.cook_time_minutes || null,
    difficulty: aiData.difficulty || null,
    style_id: styleId,
    heat_source_id: heatSourceId,
    slug,
    status: 'DRAFT'
  }).select().single()

  if (insertError || !recipe) return { error: "Error creando el borrador en la base de datos." }

  // 2b. Insert Vessel
  if (vesselTypeId || aiData.vessel_diameter_cm || aiData.vessel_notes) {
    const finalVesselTypeId = vesselTypeId || catalogs.vessels[0]?.id;
    if (finalVesselTypeId) {
      await supabase.from('recipe_vessels').insert({
        recipe_id: recipe.id,
        vessel_type_id: finalVesselTypeId,
        diameter_cm: aiData.vessel_diameter_cm || null,
        notes: aiData.vessel_notes || null
      });
    }
  }

  // 3. Insert Ingredients via Matcher
  const detectedPrices: any[] = [];
  if (aiData.ingredients && aiData.ingredients.length > 0) {
    const ingInserts = aiData.ingredients.map((ing: any, idx: number) => {
      const parsed = parseAndMatchIngredient(ing.raw_text, catalogs);
      return {
        recipe_id: recipe.id,
        display_text: parsed.displayText || ing.raw_text,
        canonical_ingredient_id: parsed.canonicalIngredientId,
        normalized_quantity: parsed.normalizedQuantity,
        unit_id: parsed.unitId,
        display_order: idx + 1
      }
    })
    const { data: insertedIngs, error: ingError } = await supabase.from('recipe_ingredients').insert(ingInserts).select()
    if (ingError) {
      console.error("Error inserting ingredients:", ingError)
      await supabase.from('recipes').delete().eq('id', recipe.id)
      return { error: "Fallo al guardar los ingredientes. OperaciÃ³n cancelada." }
    }
    
    // Guardar precios detectados (tanto para DB como para localStorage del cliente)
    const costInserts: any[] = [];
    insertedIngs?.forEach((insertedIng, idx) => {
       const aiIng = aiData.ingredients[idx];
       if (aiIng.detected_price != null) {
          let purchaseUnitId = insertedIng.unit_id;
          if (aiIng.detected_price_unit) {
             const hintLower = aiIng.detected_price_unit.toLowerCase();
             const matchedUnit = catalogs.units?.find((u:any) => hintLower.includes(u.name?.toLowerCase()));
             if (matchedUnit) purchaseUnitId = matchedUnit.id;
          }
          if (purchaseUnitId) {
            costInserts.push({
               id: insertedIng.id,
               recipe_id: recipe.id,
               owner_id: user.id,
               purchase_amount: 1,
               purchase_unit_id: purchaseUnitId,
               purchase_price: aiIng.detected_price
            });
          }
          detectedPrices.push({
             canonicalId: insertedIng.canonical_ingredient_id,
             name: insertedIng.display_text,
             price: aiIng.detected_price,
             unitId: purchaseUnitId
          });
       }
    });
    if (costInserts.length > 0) {
      const { error: costError } = await supabase.from('recipe_ingredient_costs').insert(costInserts);
      if (costError) console.error("Error inserting costs:", costError);
    }
  }

  // Precios para arroz y caldo (Solo para localStorage, DB no permite FK sin recipe_ingredients)
  if (aiData.rice_detected_price != null) {
     let unitId = catalogs.units?.find((u:any) => u.name?.toLowerCase() === 'kg')?.id;
     if (aiData.rice_detected_price_unit) {
         const matched = catalogs.units?.find((u:any) => aiData.rice_detected_price_unit!.toLowerCase().includes(u.name?.toLowerCase()));
         if (matched) unitId = matched.id;
     }
     detectedPrices.push({
         canonicalId: riceVarietyId,
         name: catalogs.varieties?.find((v:any) => v.id === riceVarietyId)?.name || 'Arroz',
         price: aiData.rice_detected_price,
         unitId
     });
  }
  
  if (aiData.stock_detected_price != null) {
     let unitId = catalogs.units?.find((u:any) => u.name?.toLowerCase() === 'l')?.id;
     if (aiData.stock_detected_price_unit) {
         const matched = catalogs.units?.find((u:any) => aiData.stock_detected_price_unit!.toLowerCase().includes(u.name?.toLowerCase()));
         if (matched) unitId = matched.id;
     }
     detectedPrices.push({
         canonicalId: stockIngredientId,
         name: catalogs.ingredients?.find((i:any) => i.id === stockIngredientId)?.normalized_name || 'Caldo',
         price: aiData.stock_detected_price,
         unitId
     });
  }

  if (detectedPrices.length > 0) {
     for (const dp of detectedPrices) {
       if (dp.price == null || !dp.unitId) continue;
       const upsertData: any = {
         user_id: user.id,
         purchase_price: dp.price,
         purchase_unit_id: dp.unitId,
         updated_at: new Date().toISOString()
       };
       if (dp.canonicalId) {
          upsertData.canonical_ingredient_id = dp.canonicalId;
       } else {
          upsertData.raw_name = dp.name;
       }
       await supabase.from('user_ingredient_prices').upsert(upsertData, {
         onConflict: dp.canonicalId ? 'user_id,canonical_ingredient_id' : 'user_id,raw_name'
       });
     }
  }

  // 4. Insert Steps
  if (aiData.instructions && aiData.instructions.length > 0) {
    const stepInserts = aiData.instructions.map((inst: any, idx: number) => {
      // Compatibility fallback in case LLM ignored the object schema and returned strings
      const isString = typeof inst === 'string';
      return {
        recipe_id: recipe.id,
        instruction: isString ? inst : (inst.instruction || ''),
        duration_minutes: isString ? null : (inst.duration_minutes || null),
        step_number: idx + 1
      };
    })
    const { error: stepError } = await supabase.from('recipe_steps').insert(stepInserts)
    if (stepError) {
      console.error("Error inserting steps:", stepError)
      await supabase.from('recipes').delete().eq('id', recipe.id)
      return { error: "Fallo al guardar los pasos. Operación cancelada." }
    }
  }

  return { recipeId: recipe.id, detectedPrices }
  } catch (err: any) {
    console.error("Server Action Exception (createAiRecipeDraft):", err)
    return { error: err.message || "Excepción interna del servidor." }
  }
}
