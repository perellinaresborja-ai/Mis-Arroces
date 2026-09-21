/**
 * REPRESENTACIÓN DERIVADA DE INGREDIENTES
 * 
 * Principio: Single Source of Truth (SSOT).
 * - Arroz y Caldo se guardan en Datos Técnicos (recipe.rice_qty, recipe.stock_qty).
 * - El resto de ingredientes en V3 (recipe.ingredients).
 * 
 * Regla de Fallback Legacy (Sin duplicados ni regex frágiles):
 * - Si existe el dato técnico (ej. rice_qty), genera el elemento usando el ingredient_id canónico.
 * - Si NO existe el dato técnico, busca el ingrediente legacy en V3 y lo retorna intacto (con su propio ID/estado real).
 * - El resto del array V3 se filtra únicamente por UUID estricto para evitar duplicados si el usuario los guardó en ambos sitios.
 */

// Legacy helper imports for detecting legacy elements in V3 (only used to find the full object now, not just amount)
function isLegacyRice(ing: any) {
  const name = ing.canonical?.normalized_name?.toLowerCase() || ing.ingredient?.normalized_name?.toLowerCase() || '';
  return name.includes('arroz');
}

function isLegacyBroth(ing: any) {
  const name = ing.canonical?.normalized_name?.toLowerCase() || ing.ingredient?.normalized_name?.toLowerCase() || '';
  return ['agua', 'fumet', 'caldo', 'fondo'].some(k => name.includes(k));
}

export function getUnifiedIngredients(recipe: any) {
  const v3Ingredients = recipe.ingredients || [];
  const unifiedList: any[] = [];
  const technicalCanonicalIds = new Set<string>();

  let finalRiceQty: number | null = null;
  let finalStockQty: number | null = null;

  // 1. ARROZ
  if (recipe.rice_qty !== null && recipe.rice_qty !== undefined && Number(recipe.rice_qty) > 0) {
    // A. Existe Dato Técnico
    finalRiceQty = Number(recipe.rice_qty);
    const ingredientId = recipe.variety?.ingredient_id || null;
    const varietyName = recipe.variety?.name || "Arroz";
    
    if (ingredientId) technicalCanonicalIds.add(ingredientId);

    unifiedList.push({
      // Usamos el ingredient_id real. En la UI se identificará así.
      id: ingredientId || "rice-no-id",
      canonical_ingredient_id: ingredientId,
      display_text: varietyName,
      normalized_quantity: finalRiceQty,
      unit: { name: "g", id: "unit-g" },
      is_technical: true, // internal flag
      display_order: -2,
      canonical: recipe.variety?.ingredient || null
    });
  } else {
    // B. Fallback Legacy
    const legacyRiceObj = v3Ingredients.find(isLegacyRice);
    if (legacyRiceObj) {
      finalRiceQty = legacyRiceObj.normalized_quantity;
      unifiedList.push(legacyRiceObj); // Pasamos intacto el objeto real original
      
      const cId = legacyRiceObj.canonical_ingredient_id || legacyRiceObj.canonical?.id;
      if (cId) technicalCanonicalIds.add(cId);
    }
  }

  // 2. LÍQUIDO / CALDO
  if (recipe.stock_qty !== null && recipe.stock_qty !== undefined && Number(recipe.stock_qty) > 0) {
    // A. Existe Dato Técnico
    finalStockQty = Number(recipe.stock_qty);
    const ingredientId = recipe.stock_ingredient_id || null;
    const stockName = recipe.stock_ingredient?.name || recipe.stock_ingredient?.canonical_name || "Líquido / caldo";
    
    if (ingredientId) technicalCanonicalIds.add(ingredientId);

    unifiedList.push({
      id: ingredientId || "stock-no-id",
      canonical_ingredient_id: ingredientId,
      display_text: stockName,
      normalized_quantity: finalStockQty,
      unit: { name: "ml", id: "unit-ml" },
      is_technical: true,
      display_order: -1,
      canonical: recipe.stock_ingredient || null
    });
  } else {
    // B. Fallback Legacy
    const legacyBrothObj = v3Ingredients.find(isLegacyBroth);
    if (legacyBrothObj) {
      finalStockQty = legacyBrothObj.normalized_quantity;
      unifiedList.push(legacyBrothObj); // Pasamos intacto el objeto real original
      
      const cId = legacyBrothObj.canonical_ingredient_id || legacyBrothObj.canonical?.id;
      if (cId) technicalCanonicalIds.add(cId);
    }
  }

  // 3. RESTO DE INGREDIENTES V3 (Deduplicación segura por UUID)
  v3Ingredients.forEach((ing: any) => {
    // Si ya lo procesamos en el fallback legacy, saltar
    if (unifiedList.includes(ing)) return;

    // Si el ingrediente coincide exactamente con el ID canónico de un elemento técnico, saltar
    const canonicalId = ing.canonical_ingredient_id || ing.canonical?.id || ing.ingredient?.id;
    if (canonicalId && technicalCanonicalIds.has(canonicalId)) {
      return; 
    }

    // Agregar a la lista
    unifiedList.push(ing);
  });

  return {
    finalRiceQty,
    finalStockQty,
    unifiedList
  };
}
