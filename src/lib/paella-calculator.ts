export const LAYER_THRESHOLDS = {
  FINA_MAX: 0.185,
  MEDIA_MAX: 0.285
};

export const DEFAULT_RICE_PER_PERSON = 100;
export type LayerType = 'Fina' | 'Media' | 'Abundante';

export function calculateArea(diameterCm: number): number {
  return Math.PI * (diameterCm / 2) * (diameterCm / 2);
}

// LÓGICA DINÁMICA DE TAMAÑOS
// Las paellas gigantes permiten mayor grosor físico y se siguen considerando "Fina"
const DYNAMIC_SLOPE = 0.0014; // Aumento de densidad (g/cm2) por cada cm que pasa de 50

export function getThresholds(diameterCm: number) {
  const shift = (diameterCm - 50) * DYNAMIC_SLOPE;
  return {
    FINA_MAX: 0.185 + shift,
    MEDIA_MAX: 0.285 + shift
  };
}

export function getTargetDensity(diameterCm: number, layer: LayerType): number {
  const shift = (diameterCm - 50) * DYNAMIC_SLOPE;
  if (layer === 'Fina') return 0.17 + shift;
  if (layer === 'Media') return 0.24 + shift;
  return 0.32 + shift; // Abundante
}

export function calculateLayer(riceGrams: number, diameterCm: number): LayerType {
  const area = calculateArea(diameterCm);
  if (area === 0) return 'Media';
  const density = riceGrams / area;
  const thresholds = getThresholds(diameterCm);
  
  if (density <= thresholds.FINA_MAX) return 'Fina';
  if (density <= thresholds.MEDIA_MAX) return 'Media';
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
  let minD = 20;
  let maxD = 200;
  let bestD = 50;

  for (let i = 0; i < 20; i++) {
    const midD = (minD + maxD) / 2;
    const targetDens = getTargetDensity(midD, desiredLayer);
    const capacity = calculateArea(midD) * targetDens;

    if (capacity < riceGrams) {
      minD = midD; 
    } else {
      maxD = midD; 
    }
    bestD = midD;
  }
  return Math.round(bestD);
}

export function getRecommendedRice(diameterCm: number, desiredLayer: LayerType = 'Media'): number {
  const targetDensity = getTargetDensity(diameterCm, desiredLayer);
  const area = calculateArea(diameterCm);
  return Math.round((area * targetDensity) / 10) * 10;
}

export function calculateRealBrothRatio(riceGrams: number, brothGrams: number): number | null {
  if (!riceGrams || !brothGrams) return null;
  return Number((brothGrams / riceGrams).toFixed(2));
}
