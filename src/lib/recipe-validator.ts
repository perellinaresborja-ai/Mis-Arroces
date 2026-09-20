export interface RecipeValidationData {
  name?: string | null;
  base_servings?: number | string | null;
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
  field: 'name' | 'base_servings' | 'ingredients' | 'steps';
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
 * Matches words like "arroz", "arroz bomba", "arroz senia", "arroz albufera", "arroz redondo", "arroz basmati", etc.
 * Avoids false substrings via word boundary regex.
 */
export function hasRiceIngredient(ingredients: Array<{ display_text?: string | null }> | null | undefined): boolean {
  if (!ingredients || ingredients.length === 0) return false;
  return ingredients.some(ing => {
    const text = (ing.display_text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return /\barroz(es)?\b/.test(text);
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

  // 3. Ingredientes:
  // - Debe incluir al menos un ingrediente.
  // - Debe contener obligatoriamente arroz entre los ingredientes.
  // - No puede haber ingredientes con nombre vacío.
  // - Si un ingrediente NO tiene expresión de cantidad ("al gusto", "pizca", etc.), debe tener una cantidad numérica > 0.
  const rawIngredients = recipe.ingredients || [];
  if (rawIngredients.length === 0) {
    issues.push({
      field: 'ingredients',
      message: 'Añade todos los ingredientes necesarios, con sus cantidades cuando corresponda.'
    });
    // Si no hay ningún ingrediente, también falta el arroz
    issues.push({
      field: 'ingredients',
      message: 'Añade arroz a los ingredientes.'
    });
  } else {
    let hasValidIngredient = false;
    let hasEmptyNameIngredient = false;
    const missingQtyNames: string[] = [];

    // Verificación obligatoria de presencia de arroz
    if (!hasRiceIngredient(rawIngredients)) {
      issues.push({
        field: 'ingredients',
        message: 'Añade arroz a los ingredientes.'
      });
    }

    rawIngredients.forEach((ing) => {
      const displayText = (ing.display_text || '').trim();
      if (!displayText) {
        hasEmptyNameIngredient = true;
        return;
      }

      const qty = ing.normalized_quantity !== null && ing.normalized_quantity !== undefined && ing.normalized_quantity !== ''
        ? Number(ing.normalized_quantity)
        : null;

      const isNonQuantifiable = isNonQuantifiableIngredient(displayText);

      if (qty !== null && !isNaN(qty) && qty > 0) {
        hasValidIngredient = true;
      } else if (isNonQuantifiable) {
        // Legitimate non-quantifiable ingredient like "Sal al gusto" or "Unas hebras de azafrán"
        hasValidIngredient = true;
      } else {
        // Needs quantity for scaling & cooking
        missingQtyNames.push(displayText);
      }
    });

    if (hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Hay ingredientes en la lista con el nombre vacío. Rellénalos o elimínalos.'
      });
    }

    if (missingQtyNames.length > 0) {
      const examples = missingQtyNames.slice(0, 3).join(', ');
      const more = missingQtyNames.length > 3 ? ` y ${missingQtyNames.length - 3} más` : '';
      issues.push({
        field: 'ingredients',
        message: `Falta indicar la cantidad de: ${examples}${more}. Si es al gusto, indícalo (ej: "al gusto").`
      });
    }

    if (!hasValidIngredient && missingQtyNames.length === 0 && !hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Añade todos los ingredientes necesarios, con sus cantidades cuando corresponda.'
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
