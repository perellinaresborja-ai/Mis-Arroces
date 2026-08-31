"use client";

import { useState } from "react";
import { Users, Droplet, Scaling, Info, ArrowRight } from "lucide-react";
import { 
  DEFAULT_RICE_PER_PERSON, 
  calculateLayer, 
  getRecommendedDiameter, 
  getBrothRatio,
  LayerType
} from "@/lib/paella-calculator";
import Link from "next/link";

export default function CalculadoraPaella() {
  const [personas, setPersonas] = useState(4);
  const [gramosPersona, setGramosPersona] = useState(DEFAULT_RICE_PER_PERSON);
  const [diametro, setDiametro] = useState<number | ''>('');
  const [variedad, setVariedad] = useState('bomba');

  // Cálculos en vivo
  const arrozTotal = personas * gramosPersona;
  
  // Si no ha puesto diámetro, le recomendamos uno para capa Media
  const diametroCalculado = diametro || getRecommendedDiameter(arrozTotal, 'Media');
  
  const capaEstimada = calculateLayer(arrozTotal, diametroCalculado);
  
  const ratioCaldo = getBrothRatio(variedad);
  const caldoTotal = arrozTotal * ratioCaldo;

  const layerColors = {
    'Fina': 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
    'Media': 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
    'Abundante': 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="max-w-xl mx-auto pt-8 px-4">
        <h1 className="text-3xl font-bold font-serif text-charcoal mb-2">Calculadora de Paella</h1>
        <p className="text-muted-foreground mb-8">Calcula las cantidades exactas de arroz, caldo y el tamaño de paella ideal.</p>

        {/* Inputs */}
        <div className="space-y-6 mb-10">
          
          <div className="bg-card border border-border p-5 rounded-3xl shadow-sm">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Personas</label>
            <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-2xl">
              <button onClick={() => setPersonas(Math.max(1, personas - 1))} className="w-12 h-12 flex items-center justify-center rounded-xl bg-card border border-border hover:bg-muted text-2xl transition-colors">-</button>
              <div className="flex-1 text-center font-bold text-2xl">{personas}</div>
              <button onClick={() => setPersonas(personas + 1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-card border border-border hover:bg-muted text-2xl transition-colors">+</button>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-3xl shadow-sm grid grid-cols-1 gap-5">
            <div>
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Gramos por persona</label>
              <input 
                type="number" 
                value={gramosPersona} 
                onChange={e => setGramosPersona(Number(e.target.value) || 0)}
                className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-lg font-bold outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Tu Paella (Diámetro en cm)</label>
              <input 
                type="number" 
                value={diametro} 
                placeholder={`Ej. ${getRecommendedDiameter(arrozTotal, 'Media')}`}
                onChange={e => setDiametro(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-lg font-bold outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><Info className="w-4 h-4"/> Déjalo en blanco para ver el recomendado.</p>
            </div>

            <div>
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Variedad de Arroz</label>
              <select 
                value={variedad} 
                onChange={e => setVariedad(e.target.value)}
                className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-lg font-bold outline-none focus:border-primary appearance-none"
              >
                <option value="bomba">Bomba (3:1)</option>
                <option value="albufera">Albufera (3:1)</option>
                <option value="senia">Senia / J. Sendra (2.5:1)</option>
                <option value="otro">Otro (3:1 default)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <h2 className="text-xl font-bold font-serif text-charcoal mb-4 pl-2">Resultados</h2>
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 grid grid-cols-2 gap-y-8 gap-x-4">
          <div>
            <p className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-1">Arroz Total</p>
            <p className="font-bold text-3xl text-primary">{Math.round(arrozTotal)} g</p>
          </div>
          <div>
            <p className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-1">Caldo Total</p>
            <p className="font-bold text-3xl text-primary flex items-center gap-2">
              {Math.round(caldoTotal)} ml
            </p>
            <p className="text-sm text-primary/70 font-semibold mt-1">Ratio {ratioCaldo}:1</p>
          </div>

          <div className="col-span-2 h-px bg-primary/10 my-1"></div>

          <div>
            <p className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-1">Diámetro {diametro ? 'Actual' : 'Ideal'}</p>
            <p className="font-bold text-2xl text-charcoal">{diametroCalculado} cm</p>
          </div>
          <div>
            <p className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-1">Grosor Capa</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${layerColors[capaEstimada]}`}>
              {capaEstimada}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/cookbook" className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-white rounded-2xl font-bold hover:bg-charcoal/90 transition-colors">
            Ir al Recetario <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
