"use client";

import { CalculationResult, NutritionInfo } from "@/lib/nutrition";
import { Info, AlertTriangle } from "lucide-react";
import { useState } from "react";

const DAILY_REFS = {
  kcal: 2000,
  protein_g: 50,
  carbs_g: 260,
  sugar_g: 90,
  fat_g: 70,
  saturated_fat_g: 20,
  salt_g: 6,
  fiber_g: 25 // EFSA recommendation
};

export function NutritionSection({ result, servings }: { result: CalculationResult, servings: number }) {
  const [mode, setMode] = useState<'serving' | 'total'>('serving');

  if (result.coveragePercent === 0) return null;

  const data = mode === 'serving' ? result.perServing : result.total;

  return (
    <div className="bg-card rounded-3xl border border-border p-5 my-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span>Información Nutricional</span>
        </h3>
        
        <div className="flex bg-muted p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode('serving')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              mode === 'serving' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Por ración
          </button>
          <button
            onClick={() => setMode('total')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              mode === 'total' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Receta completa
          </button>
        </div>
      </div>
      
      {result.isIncomplete && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Estimación parcial:</strong> Faltan datos nutricionales de algunos ingredientes ({result.coveragePercent}% de cobertura).
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3 mb-6">
        <NutritionCard label="Energía" value={data.kcal} unit="kcal" refValue={DAILY_REFS.kcal} isServing={mode === 'serving'} />
        <NutritionCard label="Proteínas" value={data.protein_g} unit="g" refValue={DAILY_REFS.protein_g} isServing={mode === 'serving'} />
        <NutritionCard label="Hidratos" value={data.carbs_g} unit="g" refValue={DAILY_REFS.carbs_g} isServing={mode === 'serving'} />
        <NutritionCard label="Azúcares" value={data.sugar_g} unit="g" refValue={DAILY_REFS.sugar_g} isServing={mode === 'serving'} />
        <NutritionCard label="Grasas" value={data.fat_g} unit="g" refValue={DAILY_REFS.fat_g} isServing={mode === 'serving'} />
        <NutritionCard label="Saturadas" shortLabel="Sat." value={data.saturated_fat_g} unit="g" refValue={DAILY_REFS.saturated_fat_g} isServing={mode === 'serving'} />
        <NutritionCard label="Fibra" value={data.fiber_g} unit="g" refValue={DAILY_REFS.fiber_g} isServing={mode === 'serving'} />
        <NutritionCard label="Sal" value={data.salt_g} unit="g" refValue={DAILY_REFS.salt_g} digits={2} isServing={mode === 'serving'} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <h4 className="font-bold text-sm">¿Qué aporta una ración?</h4>
        <p className="text-xs text-muted-foreground">
          Los porcentajes muestran la contribución a la Ingesta de Referencia (IR) de un adulto medio (8400 kJ / 2000 kcal) según el Reglamento (UE) nº 1169/2011.
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
          <Info className="w-4 h-4 shrink-0" />
          <span>Valores nutricionales estimados. Pueden variar según ingredientes, marcas y elaboración.</span>
        </p>
      </div>

      {result.allergens.length > 0 ? (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-bold text-sm mb-3">Alérgenos Detectados</h4>
          <div className="flex flex-wrap gap-2">
            {result.allergens.map(alg => (
              <span key={alg.id} className="bg-background text-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium border border-border shadow-sm">
                {alg.icon && <span>{alg.icon}</span>}
                {alg.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
            <Info className="w-4 h-4 shrink-0" />
            <span>Revisa siempre el etiquetado de los productos utilizados.</span>
          </p>
        </div>
      ) : result.isIncomplete ? (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-bold text-sm mb-3">Alérgenos Detectados</h4>
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Información de alérgenos incompleta.</strong> No podemos asegurar que esta receta esté libre de alérgenos.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-bold text-sm mb-3">Alérgenos Detectados</h4>
          <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm flex items-start gap-2">
            <p>
              <strong>Sin alérgenos detectados.</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function NutritionCard({ label, shortLabel, value, unit, digits = 1, refValue, isServing }: { label: string, shortLabel?: string, value: number, unit: string, digits?: number, refValue?: number, isServing?: boolean }) {
  const formatted = unit === 'kcal' ? Math.round(value) : value.toFixed(digits);
  const percent = refValue && isServing ? Math.round((value / refValue) * 100) : null;
  
  return (
    <div className="bg-muted/40 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider block truncate w-full">
        <span className="md:hidden">{shortLabel || label}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
      <div className="font-bold text-[15px] sm:text-lg text-foreground mt-0.5">
        {formatted}
        <span className="text-[10px] sm:text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>
      </div>
      {percent !== null && (
        <span className="text-[10px] sm:text-xs text-muted-foreground/80 font-medium mt-1">{percent}% IR</span>
      )}
    </div>
  )
}
