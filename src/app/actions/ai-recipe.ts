"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export async function parseRecipeFreeText(text: string) {
  const cleanText = text.trim()
  if (!cleanText || cleanText.length < 15) {
    return { error: "El texto es muy corto para extraer una receta." }
  }

  const systemPrompt = `Eres un asistente que extrae datos técnicos de recetas de cocina para la base de datos "Mis Arroces".
La receta suele ser de arroz o paella, pero puede ser de cualquier cosa.

REGLAS OBLIGATORIAS:
1. Tienes prohibido inventar información (ingredientes, cantidades, pasos o tiempos) que no esté en el texto.
2. Si un dato dudoso o falta, devuélvelo como null.
3. ESTRICTA SEPARACIÓN DE SSOT (Single Source of Truth):
   - El ingrediente principal (arroz, pasta, etc.) y su cantidad van EN EXCLUSIVA a \`rice_qty\` y \`rice_variety_hint\`. NO los incluyas en \`ingredients\`.
   - El líquido (caldo, agua, fondo) y su cantidad van EN EXCLUSIVA a \`stock_qty\` y \`stock_ingredient_hint\`. NO los incluyas en \`ingredients\`.
   - El resto de ingredientes (carnes, verduras, especias, aceite) van a \`ingredients\`.
4. El título debe ser conciso. Si no hay, infiere uno corto (ej: "Paella de marisco").
5. La descripción SÓLO debe contener texto descriptivo (historia, consejos). NO metas aquí el recipiente, dificultad, estilo, ni ningún dato que ya tenga su propio campo.
6. DESGLOSE SECUENCIAL LÓGICO DE PASOS Y TIEMPOS: Si el texto original contiene varias fases temporales o cambios de acción en una misma frase (ej. "Cocinar 8 min a fuego fuerte y luego 9 min a fuego medio-bajo", o "hervir 10 min y reposar 5 min"), DIVÍDELO OBLIGATORIAMENTE en pasos independientes.
   - Paso X: "Cocinar a fuego fuerte." -> duration_minutes: 8
   - Paso X+1: "Bajar a fuego medio-bajo y continuar la cocción." -> duration_minutes: 9
   - Paso X+2: "Apagar y dejar reposar." -> duration_minutes: 5
   Reposos con tiempo siempre van en su propio paso. Cada cambio de fuego/acción que lleve tiempo es un paso distinto con su propio \`duration_minutes\`.
7. Responde ÚNICAMENTE con un JSON válido.`

  const baseSchema = {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string", nullable: true, description: "Solo descripción real o consejos. Nada de parámetros técnicos." },
      base_servings: { type: "number", nullable: true },
      rice_qty: { type: "number", nullable: true, description: "Cantidad del ingrediente principal (arroz) en gramos." },
      rice_variety_hint: { type: "string", nullable: true, description: "Nombre de la variedad de arroz (ej: Bomba, Albufera) para buscar su ID luego." },
      stock_qty: { type: "number", nullable: true, description: "Cantidad de líquido/caldo en mililitros (ml)." },
      stock_ingredient_hint: { type: "string", nullable: true, description: "Nombre del caldo o fondo (ej: Caldo de pescado) para buscar su ID luego." },
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
            raw_text: { type: "string", description: "El nombre y cantidad del ingrediente (ej. '1 cebolla pequeña', '200g de pollo')" }
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

  async function callGemini(text: string) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No hay clave de API configurada para Gemini.");
    let lastError = null;
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nTexto libre de la receta:\n${text}` }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema: toGeminiSchema(baseSchema) }
        })
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429 || res.status === 503 || res.status === 500) {
          lastError = new Error(`Gemini temporary error ${res.status}: ${err}`);
          if (i < 3) { await new Promise(r => setTimeout(r, i * 1000)); continue; }
        }
        throw new Error(`Gemini error ${res.status}: ${err}`);
      }
      const json = await res.json();
      const str = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!str) throw new Error("Respuesta vacía de la IA.");
      return JSON.parse(str);
    }
    throw lastError;
  }

  async function callOpenAI(text: string) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("No hay clave de API configurada para OpenAI.");
    const prompt = `${systemPrompt}\n\nDebes responder en formato JSON que cumpla ESTRICTAMENTE este esquema:\n${JSON.stringify(baseSchema, null, 2)}`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }, { role: "user", content: `Texto libre de la receta:\n${text}` }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
    const json = await res.json();
    const str = json.choices?.[0]?.message?.content;
    if (!str) throw new Error("Respuesta vacía de la IA.");
    return JSON.parse(str);
  }

  try {
    const parsed = await callGemini(cleanText);
    return { data: parsed };
  } catch (err: any) {
    console.error("Gemini failed, falling back to OpenAI:", err);
    try {
      const parsed = await callOpenAI(cleanText);
      return { data: parsed };
    } catch (err2: any) {
      console.error("OpenAI fallback failed:", err2);
      return { error: "La IA está ocupada en este momento. Inténtalo de nuevo en unos segundos." };
    }
  }
}

export async function createAiRecipeDraft(text: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: aiData, error: aiError } = await parseRecipeFreeText(text)
  if (aiError || !aiData) throw new Error(aiError || "Unknown AI Error")

  const slug = "receta-ia-" + Date.now()

  // 1. Fetch catalogs for proper matching
  const { getCatalogs } = await import("@/app/actions/recipes");
  const { parseAndMatchIngredient } = await import("@/lib/recipe-importer/matcher");
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

  if (insertError || !recipe) throw new Error("Error creando el borrador.")

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
    const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingInserts)
    if (ingError) console.error("Error inserting ingredients:", ingError)
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
    await supabase.from('recipe_steps').insert(stepInserts)
  }

  return { recipeId: recipe.id }
}
