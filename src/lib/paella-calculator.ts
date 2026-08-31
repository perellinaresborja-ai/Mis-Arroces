/**
 * Calculadora de Paella V1 (Motor Central)
 * 
 * NOTA SOBRE LOS UMBRALES (THRESHOLDS):
 * Estos valores (g/cm²) NO son verdades científicas exactas. Son una referencia
 * práctica para clasificar las capas de arroz cocinado en paella basándonos en
 * las proporciones tradicionales valencianas y de la hostelería.
 */
export const LAYER_THRESHOLDS = {
  FINA_MAX: 0.28,   // Densidad <= 0.28 g/cm²
  MEDIA_MAX: 0.42   // Densidad entre 0.28 y 0.42 g/cm² (mayor es Abundante)
};

export const DEFAULT_RICE_PER_PERSON = 100;

export type LayerType = 'Fina' | 'Media' | 'Abundante';

export function calculateArea(diameterCm: number): number {
  const radius = diameterCm / 2;
  return Math.PI * radius * radius;
}

export function calculateLayer(riceGrams: number, diameterCm: number): LayerType {
  const area = calculateArea(diameterCm);
  if (area === 0) return 'Media';
  const density = riceGrams / area;
  
  if (density <= LAYER_THRESHOLDS.FINA_MAX) return 'Fina';
  if (density <= LAYER_THRESHOLDS.MEDIA_MAX) return 'Media';
  return 'Abundante';
}

/**
 * Encuentra la cantidad real de arroz en los ingredientes de una receta.
 */
export function extractRealRiceGrams(ingredients: any[]): number | null {
  if (!ingredients || ingredients.length === 0) return null;
  
  const riceIng = ingredients.find(ing => 
    ing.ingredient?.normalized_name?.toLowerCase().includes('arroz') || 
    ing.display_text?.toLowerCase().includes('arroz')
  );
  
  if (!riceIng || !riceIng.normalized_quantity) return null;
  
  // Asumimos que la cantidad viene en gramos o kg
  const unit = riceIng.unit?.name?.toLowerCase() || '';
  if (unit === 'kg' || unit === 'kilogramo' || unit === 'kilogramos') {
    return riceIng.normalized_quantity * 1000;
  }
  return riceIng.normalized_quantity; // Gramos por defecto
}

/**
 * Encuentra la cantidad real de caldo en los ingredientes de una receta.
 */
export function extractRealBrothGrams(ingredients: any[]): number | null {
  if (!ingredients || ingredients.length === 0) return null;
  
  const brothIng = ingredients.find(ing => 
    ing.ingredient?.normalized_name?.toLowerCase().includes('caldo') ||
    ing.ingredient?.normalized_name?.toLowerCase().includes('agua') ||
    ing.ingredient?.normalized_name?.toLowerCase().includes('fumet') ||
    ing.display_text?.toLowerCase().includes('caldo') ||
    ing.display_text?.toLowerCase().includes('agua') ||
    ing.display_text?.toLowerCase().includes('fumet')
  );
  
  if (!brothIng || !brothIng.normalized_quantity) return null;
  
  const unit = brothIng.unit?.name?.toLowerCase() || '';
  if (unit === 'l' || unit === 'litro' || unit === 'litros' || unit === 'kg' || unit === 'kilogramo') {
    return brothIng.normalized_quantity * 1000;
  }
  return brothIng.normalized_quantity; // Gramos o mililitros por defecto
}

export function getRecommendedDiameter(riceGrams: number, desiredLayer: LayerType = 'Media'): number {
  // Target density based on desired layer
  let targetDensity = 0.35; // Default middle of Media
  
  if (desiredLayer === 'Fina') {
    targetDensity = 0.24; // Middle of Fina
  } else if (desiredLayer === 'Abundante') {
    targetDensity = 0.50; // Above Media
  }

  const targetArea = riceGrams / targetDensity;
  const radius = Math.sqrt(targetArea / Math.PI);
  return Math.round(radius * 2);
}

export function getRecommendedRice(diameterCm: number, desiredLayer: LayerType = 'Media'): number {
  let targetDensity = 0.35;
  if (desiredLayer === 'Fina') targetDensity = 0.24;
  else if (desiredLayer === 'Abundante') targetDensity = 0.50;

  const area = calculateArea(diameterCm);
  return Math.round((area * targetDensity) / 10) * 10; // Round to nearest 10g
}

export function getBrothRatio(varietyName: string | null): number {
  const name = (varietyName || '').toLowerCase();
  if (name.includes('bomba')) return 3.2;
  if (name.includes('albufera')) return 3.0;
  if (name.includes('senia') || name.includes('sendra') || name.includes('j. sendra')) return 2.5;
  if (name.includes('carnaroli') || name.includes('arborio')) return 3.0; // Risotto, but fallback
  return 3.0; // Default
}
