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
 * Words indicating qualitative / seasoning ingredients that do not strictly require numerical quantity
 */
const NON_QUANTIFIABLE_KEYWORDS = [
  'al gusto',
  'al gusto.',
  'a gusto',
  'opcional',
  'opcionales',
  'pizca',
  'pizcas',
  'chorrito',
  'chorro',
  'unas gotas',
  'gotas',
  'hebras',
  'rama',
  'ramita',
  'ramitas',
  'hoja',
  'hojas',
  'para decorar',
  'para espolvorear',
  'necesaria',
  'necesario',
  'cantidad necesaria',
  'c/n',
  'cn'
];

/**
 * Checks whether an ingredient is qualitative or does not require an explicit numeric quantity.
 * Examples: "Sal al gusto", "Azafrán en hebras", "Pimienta opcional", "Perejil picado al gusto".
 */
export function isNonQuantifiableIngredient(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return NON_QUANTIFIABLE_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Authoritative validator for PUBLISHED recipes in Mis Arroces.
 * Principle: "Una receta publicada tiene que poder cocinarse."
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
  // - Debe tener al menos 1 ingrediente.
  // - No puede haber ingredientes con nombre vacío.
  // - Si un ingrediente NO es de tipo "al gusto" / no cuantificable, debe tener una cantidad válida > 0
  //   para que pueda cocinarse y escalarse correctamente.
  const rawIngredients = recipe.ingredients || [];
  if (rawIngredients.length === 0) {
    issues.push({
      field: 'ingredients',
      message: 'La receta debe incluir al menos un ingrediente para poder cocinarse.'
    });
  } else {
    let hasValidIngredient = false;
    let hasEmptyNameIngredient = false;
    let hasMissingQuantityIngredient = false;
    const missingQtyNames: string[] = [];

    rawIngredients.forEach((ing, index) => {
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
        // Legitimate non-quantifiable ingredient like "Sal al gusto"
        hasValidIngredient = true;
      } else {
        // Needs quantity for scaling & cooking
        hasMissingQuantityIngredient = true;
        missingQtyNames.push(displayText);
      }
    });

    if (hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Hay ingredientes en la lista con el nombre vacío. Rellénalos o elimínalos.'
      });
    }

    if (hasMissingQuantityIngredient) {
      const examples = missingQtyNames.slice(0, 3).join(', ');
      const more = missingQtyNames.length > 3 ? ` y ${missingQtyNames.length - 3} más` : '';
      issues.push({
        field: 'ingredients',
        message: `Los siguientes ingredientes necesitan una cantidad mayor que 0 para poder cocinarse y escalarse: ${examples}${more}. Si es al gusto, indícalo (ej: "al gusto").`
      });
    }

    if (!hasValidIngredient && !hasMissingQuantityIngredient && !hasEmptyNameIngredient) {
      issues.push({
        field: 'ingredients',
        message: 'Debes añadir al menos un ingrediente válido para publicar la receta.'
      });
    }
  }

  // 4. Pasos de elaboración:
  // - Debe tener al menos 1 paso.
  // - Todos los pasos deben tener instrucción no vacía (sin pasos vacíos intermedios).
  const rawSteps = recipe.steps || [];
  if (rawSteps.length === 0) {
    issues.push({
      field: 'steps',
      message: 'La receta debe tener al menos un paso de elaboración para que pueda cocinarse.'
    });
  } else {
    let hasEmptyStep = false;
    let validStepCount = 0;

    rawSteps.forEach((step, idx) => {
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
        message: 'Debes incluir al menos un paso de elaboración con contenido para publicar la receta.'
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    errorList: issues.map(i => i.message)
  };
}
