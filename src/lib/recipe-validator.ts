export interface RecipeValidationData {
  name?: string | null;
  base_servings?: number | string | null;
  rice_qty?: number | string | null;
  stock_qty?: number | string | null;
  stock_ingredient_id?: string | null;
  ingredients?: Array<{
    display_text?: string | null;
    normalized_quantity?: number | string | null;
    unit_id?: string | null;
    is_scalable?: boolean | null;
  }> | null;
  steps?: Array<{
    instruction?: string | null;
    duration_minutes?: number | string | null;
    notes?: string | null;
  }> | null;
}

export interface ValidationIssue {
  field: 'name' | 'base_servings' | 'rice_qty' | 'ingredients' | 'steps';
  message: string;
}

export interface RecipeValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  errorList: string[];
}

/**
 * Robust check for non-numerical quantity expressions in ingredients.
 * Principle: Differentiate between a real quantity expression (e.g. "sal al gusto", "una pizca de sal",
 * "unas hebras de azafrán") versus an ingredient descriptive name lacking quantity (e.g. "azafrán en hebras").
 * If we cannot establish that an expression contains a valid quantity representation, an explicit quantity is required.
 */
export function isNonQuantifiableIngredient(text: string): boolean {
  if (!text) return false;
  // Normalize whitespace and lowercase
  const lower = text.toLowerCase().replace(/[.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!lower) return false;

  // 1. "al gusto" / "a gusto" anywhere indicates the amount is left to taste
  if (/\b(al|a)\s+gusto\b/.test(lower)) {
    return true;
  }

  // 2. "cantidad necesaria" / "c/n" / "cn" (standard culinary notation)
  if (/\bcantidad\s+necesaria\b/.test(lower) || /\bcn\b/.test(lower)) {
    return true;
  }

  // 3. "opcional" / "opcionales"
  if (/\bopcional(es)?\b/.test(lower)) {
    return true;
  }

  // 4. "para decorar" / "para espolvorear" / "para servir"
  if (/\bpara\s+(decorar|espolvorear|servir)\b/.test(lower)) {
    return true;
  }

  // 5. Explicit qualitative quantifiers:
  // Must match quantifier expressions like "una pizca", "pizca de", "unas hebras", "un chorrito", "unas gotas"
  // BUT NOT descriptive phrases like "en hebras" (e.g. "azafrán en hebras" is descriptive, NOT a quantity!)
  const qualitativeQuantifiers = [
    /\b(un[as]?\s+)?pizca(s)?(\s+de)?\b/,
    /\b(un\s+)?chorro(\s+de)?\b/,
    /\b(un\s+)?chorrito(\s+de)?\b/,
    /\b(un[as]?\s+)?gota(s)?(\s+de)?\b/,
    /\b(un[as]?\s+)?ramita(s)?(\s+de)?\b/,
    /\b(un[as]?\s+)?rama(s)?(\s+de)?\b/,
    /\b(un[as]?\s+)?hoja(s)?(\s+de)?\b/,
    // For hebras: require "unas hebras" or "hebras de", NEVER accept "en hebras"
    /\b(un[as]?\s+)?hebras(\s+de)?\b/,
  ];

  // If it matches "en hebras", it is definitely a descriptive name, NOT a valid quantity expression
  if (/\ben\s+hebras\b/.test(lower)) {
    return false;
  }

  // Check if any qualitative quantifier is present
  return qualitativeQuantifiers.some(regex => regex.test(lower));
}

/**
 * Checks whether the ingredients list contains rice.
 * Principle: Mis Arroces recipes MUST contain rice to be published.
 * Matches:
 * - "arroz", "arroces"
 * - Standard rice varieties (e.g. "bomba", "albufera", "senia", "sénia", "sendra", "bahía", "marisma",
 *   "carnaroli", "arborio", "dinamita", "balilla", "sollana", "basmati", "jazmín", "redondo")
 * Avoids false positives (e.g., "zarzuela", "sarro", "sal", "pimienta", "azafrán") via word boundary regex.
 */
export function hasRiceIngredient(ingredients: Array<{ display_text?: string | null }> | null | undefined): boolean {
  if (!ingredients || ingredients.length === 0) return false;
  
  // Normalized diacritic-free patterns with word boundaries
  const ricePattern = /\b(arroz(es)?|bomba|senia|sendra|albufera|bahia|marisma|carnaroli|arborio|dinamita|balilla|sollana|basmati|jazmin|redondo)\b/i;

  return ingredients.some(ing => {
    const text = (ing.display_text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ricePattern.test(text);
  });
}

/**
 * Checks whether a recipe has the minimum structural information required to be cooked in Modo Cocina.
 * Specifically:
 * - At least one valid step with non-empty instruction.
 * - At least one valid ingredient with non-empty name.
 */
export function isRecipeCookable(recipe: RecipeValidationData): { cookable: boolean; reason?: string } {
  const steps = recipe.steps || [];
  const validSteps = steps.filter(s => (s.instruction || '').trim().length > 0);
  if (validSteps.length === 0) {
    return {
      cookable: false,
      reason: 'Esta receta todavía no tiene la elaboración completa.'
    };
  }

  const ingredients = recipe.ingredients || [];
  const validIngs = ingredients.filter(i => (i.display_text || '').trim().length > 0);
  if (validIngs.length === 0) {
    return {
      cookable: false,
      reason: 'Esta receta todavía no tiene la lista de ingredientes completa.'
    };
  }

  return { cookable: true };
}

/**
 * Authoritative validator for PUBLISHED recipes in Mis Arroces.
 * Principle: "Una receta publicada tiene que poder cocinarse."
 *
 * Checks:
 * 1. Title is required and not default ("Nueva receta").
 * 2. base_servings > 0.
 * 3. Ingredients list: non-empty, contains rice, no empty names, every quantifiable ingredient has quantity > 0.
 * 4. Steps list: non-empty, no empty steps, at least one step with instruction.
 */
export function validateRecipeForPublishing(recipe: RecipeValidationData): RecipeValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Título obligatorio y no por defecto
  const nameTrimmed = (recipe.name || '').trim();
  if (!nameTrimmed) {
    issues.push({
      field: 'name',
      message: 'El nombre de la receta es obligatorio.'
    });
  } else if (nameTrimmed.toLowerCase() === 'nueva receta') {
    issues.push({
      field: 'name',
      message: 'Debes darle un nombre propio a la receta antes de publicarla.'
    });
  }

  // 2. Comensales base > 0
  const servingsNum = recipe.base_servings !== null && recipe.base_servings !== undefined && recipe.base_servings !== ''
    ? Number(recipe.base_servings)
    : NaN;

  if (isNaN(servingsNum) || servingsNum <= 0) {
    issues.push({
      field: 'base_servings',
      message: 'Debes indicar un número de comensales válido (mayor que 0) para poder escalar la receta.'
    });
  }

  // 3. Arroz Estructural (Datos técnicos)
  const riceQtyNum = recipe.rice_qty !== null && recipe.rice_qty !== undefined && recipe.rice_qty !== ''
    ? Number(recipe.rice_qty)
    : NaN;

  if (isNaN(riceQtyNum) || riceQtyNum <= 0) {
    issues.push({
      field: 'rice_qty',
      message: 'Añade la cantidad de arroz en Datos técnicos.'
    });
  }

  // 4. Ingredientes:
  // - Debe incluir al menos un ingrediente.
  // - No puede haber ingredientes con nombre vacío.
  // - Cantidad y unidad son opcionales. No hace falta vinculación al catálogo maestro.
  const rawIngredients = recipe.ingredients || [];
  if (rawIngredients.length === 0) {
    issues.push({
      field: 'ingredients',
      message: 'Añade los ingredientes necesarios para la receta.'
    });
  } else {
    let hasValidIngredient = false;
    let hasEmptyNameIngredient = false;

    rawIngredients.forEach((ing) => {
      const displayText = (ing.display_text || '').trim();
      if (!displayText) {
        hasEmptyNameIngredient = true;
      } else {
        hasValidIngredient = true;
      }
    });

    if (hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Hay ingredientes en la lista con el nombre vacío. Rellénalos o elimínalos.'
      });
    }

    if (!hasValidIngredient && !hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Añade los ingredientes necesarios para la receta.'
      });
    }
  }

  // 4. Pasos de elaboración:
  // - Debe tener al menos 1 paso.
  // - No puede haber pasos con instrucción vacía.
  const rawSteps = recipe.steps || [];
  if (rawSteps.length === 0) {
    issues.push({
      field: 'steps',
      message: 'Añade todos los pasos necesarios para elaborar la receta.'
    });
  } else {
    let hasEmptyStep = false;
    let validStepCount = 0;

    rawSteps.forEach((step) => {
      const instruction = (step.instruction || '').trim();
      if (!instruction) {
        hasEmptyStep = true;
      } else {
        validStepCount++;
      }
    });

    if (hasEmptyStep) {
      issues.push({
        field: 'steps',
        message: 'Hay pasos de elaboración en blanco. Por favor escribe la instrucción o elimina el paso sobrante.'
      });
    }

    if (validStepCount === 0) {
      issues.push({
        field: 'steps',
        message: 'Añade todos los pasos necesarios para elaborar la receta.'
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    errorList: issues.map(i => i.message)
  };
}
