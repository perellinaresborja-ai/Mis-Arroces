import { CalculationResult } from "@/lib/nutrition";
import { Info, AlertTriangle } from "lucide-react";

export function NutritionSection({ result, servings }: { result: CalculationResult, servings: number }) {
  if (result.coveragePercent === 0) return null;

  return (
    <div className="bg-card rounded-3xl border border-border p-5 my-6 overflow-hidden">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span>Información Nutricional</span>
      </h3>
      
      {result.isIncomplete && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Estimación parcial:</strong> Faltan datos nutricionales de algunos ingredientes ({result.coveragePercent}% de cobertura).
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        <NutritionCard label="Calorías" value={result.perServing.kcal} unit="kcal" />
        <NutritionCard label="Proteínas" value={result.perServing.protein_g} unit="g" />
        <NutritionCard label="Hidratos" value={result.perServing.carbs_g} unit="g" />
        <NutritionCard label="Grasas" value={result.perServing.fat_g} unit="g" />
        <NutritionCard label="Fibra" value={result.perServing.fiber_g} unit="g" />
        <NutritionCard label="Sal" value={result.perServing.salt_g} unit="g" digits={2} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" /> Valores estimados por ración (basado en {servings} {servings === 1 ? 'ración' : 'raciones'}). Pueden variar según ingredientes, marcas y elaboración.
        </p>
      </div>

      {result.allergens.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-bold text-sm mb-3">Alérgenos Detectados</h4>
          <div className="flex flex-wrap gap-2">
            {result.allergens.map(alg => (
              <span key={alg.id} className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium border border-border">
                {alg.icon && <span>{alg.icon}</span>}
                {alg.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="w-3 h-3" /> Revisa siempre el etiquetado de los productos utilizados.
          </p>
        </div>
      )}
    </div>
  );
}

function NutritionCard({ label, value, unit, digits = 1 }: { label: string, value: number, unit: string, digits?: number }) {
  const formatted = unit === 'kcal' ? Math.round(value) : value.toFixed(digits);
  return (
    <div className="bg-muted/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-border/50">
      <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">{label}</span>
      <span className="font-bold text-lg text-foreground">{formatted} <span className="text-sm font-normal text-muted-foreground">{unit}</span></span>
    </div>
  )
}
