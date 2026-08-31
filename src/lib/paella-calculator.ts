export const LAYER_THRESHOLDS = {
  FINA_MAX: 0.185,
  MEDIA_MAX: 0.285
};

export const DEFAULT_RICE_PER_PERSON = 100;
export type LayerType = 'Fina' | 'Media' | 'Abundante';

export function calculateArea(diameterCm: number): number {
  return Math.PI * (diameterCm / 2) * (diameterCm / 2);
}

export function calculateLayer(riceGrams: number, diameterCm: number): LayerType {
  const area = calculateArea(diameterCm);
  if (area === 0) return 'Media';
  const density = riceGrams / area;
  
  if (density <= LAYER_THRESHOLDS.FINA_MAX) return 'Fina';
  if (density <= LAYER_THRESHOLDS.MEDIA_MAX) return 'Media';
  return 'Abundante';
}

export function extractRealRiceGrams(ingredients: any[]): number | null {
  if (!ingredients || ingredients.length === 0) return null;
  const riceIng = ingredients.find((ing: any) => {
    const isCanonical = ing.canonical?.normalized_name?.toLowerCase().includes('arroz') || ing.ingredient?.normalized_name?.toLowerCase().includes('arroz');
    if (isCanonical) return true;
    return ing.display_text?.toLowerCase().includes('arroz');
  });
  if (!riceIng || !riceIng.normalized_quantity) return null;
  const unit = riceIng.unit?.name?.toLowerCase() || '';
  if (unit === 'kg' || unit === 'kilogramo' || unit === 'kilogramos') {
    return Number(riceIng.normalized_quantity) * 1000;
  }
  return Number(riceIng.normalized_quantity);
}

export function extractRealBrothGrams(ingredients: any[]): number | null {
  if (!ingredients || ingredients.length === 0) return null;
  const brothKeywords = ['caldo', 'agua', 'fumet', 'fondo'];
  const brothIng = ingredients.find((ing: any) => {
    const canonicalName = ing.canonical?.normalized_name?.toLowerCase() || ing.ingredient?.normalized_name?.toLowerCase() || '';
    if (brothKeywords.some(k => canonicalName.includes(k))) return true;
    const text = ing.display_text?.toLowerCase() || '';
    return brothKeywords.some(k => text.includes(k));
  });
  if (!brothIng || !brothIng.normalized_quantity) return null;
  const unit = brothIng.unit?.name?.toLowerCase() || '';
  if (unit === 'l' || unit === 'litro' || unit === 'litros' || unit === 'kg' || unit === 'kilogramo') {
    return Number(brothIng.normalized_quantity) * 1000;
  }
  return Number(brothIng.normalized_quantity);
}

export function getRecommendedDiameter(riceGrams: number, desiredLayer: LayerType = 'Media'): number {
  let targetDensity = 0.24;
  if (desiredLayer === 'Fina') targetDensity = 0.17;
  else if (desiredLayer === 'Abundante') targetDensity = 0.32;
  const targetArea = riceGrams / targetDensity;
  return Math.round(Math.sqrt(targetArea / Math.PI) * 2);
}

export function getRecommendedRice(diameterCm: number, desiredLayer: LayerType = 'Media'): number {
  let targetDensity = 0.24;
  if (desiredLayer === 'Fina') targetDensity = 0.17;
  else if (desiredLayer === 'Abundante') targetDensity = 0.32;
  const area = calculateArea(diameterCm);
  return Math.round((area * targetDensity) / 10) * 10;
}

export function calculateRealBrothRatio(riceGrams: number, brothGrams: number): number | null {
  if (!riceGrams || !brothGrams) return null;
  return Number((brothGrams / riceGrams).toFixed(2));
}
