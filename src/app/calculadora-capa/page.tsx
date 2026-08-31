"use client";

import { useState } from "react";
import { BackButton } from "@/components/domain/BackButton";
import { calculateLayer, getRecommendedDiameter, getRecommendedRice, LayerType } from "@/lib/paella-calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scaling, Info, ChefHat, Droplet } from "lucide-react";

export default function LayerCalculatorPage() {
  const [rice, setRice] = useState<string>('');
  const [broth, setBroth] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [style, setStyle] = useState<'A_BANDA' | 'TRADICIONAL'>('A_BANDA');

  const riceNum = Number(rice);
  const brothNum = Number(broth);
  const diaNum = Number(diameter);
  const servNum = Number(servings);

  const hasRice = riceNum > 0;
  const hasBroth = brothNum > 0;
  const hasDia = diaNum > 0;
  const hasServ = servNum > 0;

  // Factor de volumen para ingredientes mezclados (30% de volumen extra)
  const VOLUME_FACTOR = 1.30;
  const multiplier = style === 'TRADICIONAL' ? VOLUME_FACTOR : 1.0;

  // Helpers para encapsular el multiplicador
  const calcLayer = (r: number, d: number) => calculateLayer(r * multiplier, d);
  const calcDia = (r: number, l: LayerType) => getRecommendedDiameter(r * multiplier, l);
  const calcRice = (d: number, l: LayerType) => Math.round(getRecommendedRice(d, l) / multiplier);

  // Calculos derivados
  const assumedRice = hasRice ? riceNum : (hasServ ? servNum * 100 : 0);
  const brothRatio = (hasRice && hasBroth) ? (brothNum / riceNum).toFixed(2).replace(/\.00$/, '') : null;
  const currentLayer = (hasRice && hasDia) ? calcLayer(riceNum, diaNum) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-bold truncate text-foreground">Calculadora de Capa</h1>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-xl mx-auto w-full space-y-6">
        
        {/* ÚNICA TARJETA DE INPUTS */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Scaling className="w-6 h-6" />
            <h2 className="text-xl font-bold font-serif">Tus Datos</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arroz (g)</Label>
              <Input type="number" value={rice} onChange={e => setRice(e.target.value)} placeholder="Ej. 800" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Caldo (ml)</Label>
              <Input type="number" value={broth} onChange={e => setBroth(e.target.value)} placeholder="Ej. 2400" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Diámetro (cm)</Label>
              <Input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} placeholder="Ej. 60" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Raciones</Label>
              <Input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="Ej. 8" className="bg-background" />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/50">
            <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1.5 mb-3">
              <ChefHat className="w-3.5 h-3.5" />
              Volumen de ingredientes
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                size="sm" 
                variant={style === 'A_BANDA' ? 'default' : 'outline'} 
                onClick={() => setStyle('A_BANDA')} 
                className="flex-1 justify-start h-auto py-2.5 px-4"
              >
                <div className="text-left">
                  <div className="font-bold text-sm">Arroz Limpio</div>
                  <div className={`text-[10px] font-normal mt-0.5 ${style === 'A_BANDA' ? 'opacity-90' : 'text-muted-foreground'}`}>A banda, Senyoret...</div>
                </div>
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant={style === 'TRADICIONAL' ? 'default' : 'outline'} 
                onClick={() => setStyle('TRADICIONAL')} 
                className="flex-1 justify-start h-auto py-2.5 px-4"
              >
                <div className="text-left">
                  <div className="font-bold text-sm">Con Tropezones</div>
                  <div className={`text-[10px] font-normal mt-0.5 ${style === 'TRADICIONAL' ? 'opacity-90' : 'text-muted-foreground'}`}>Valenciana (carne/verdura)</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* TARJETA DE RESULTADOS */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm min-h-[250px]">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Resultados</h3>
          
          <div className="flex flex-col gap-5">
            {!hasRice && !hasDia && !hasServ && !hasBroth && (
              <p className="text-muted-foreground text-sm italic">
                Introduce arroz, caldo, diámetro o raciones y te diré cómo hacer la paella perfecta.
              </p>
            )}

            {/* PROPORCIÓN DE CALDO */}
            {hasRice && hasBroth && (
              <div className="flex items-center justify-between bg-primary/10 text-primary p-4 rounded-2xl border border-primary/20">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block mb-0.5">Proporción de Caldo</span>
                  <span className="text-2xl font-black">1 : {brothRatio}</span>
                </div>
                <Droplet className="w-8 h-8 opacity-50" />
              </div>
            )}

            {/* NOTA RACIONES */}
            {hasServ && (hasRice || assumedRice > 0) && (
              <div className="flex items-start gap-2 text-sm bg-background p-3 rounded-xl border border-border">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {hasRice 
                    ? `Con ${riceNum}g tocan a ${Math.round(riceNum / servNum)} g/persona.`
                    : `Calculando ${assumedRice}g de arroz en total (${Math.round(assumedRice / servNum)} g/persona).`}
                </span>
              </div>
            )}

            {/* CASO 1: ARROZ + DIÁMETRO */}
            {hasRice && hasDia && currentLayer && (
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">Con estos datos tu capa será:</span>
                  <p className="text-4xl font-bold uppercase text-foreground">{currentLayer}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {currentLayer !== 'Fina' && (
                    <div className="bg-background p-4 rounded-xl border border-border/50 text-sm">
                      <span className="font-bold text-charcoal block mb-1">Si la quieres Fina:</span>
                      Usa paella de <span className="font-bold text-primary">~{calcDia(riceNum, 'Fina')} cm</span> o pon <span className="font-bold text-primary">~{calcRice(diaNum, 'Fina')}g</span> de arroz.
                    </div>
                  )}
                  {currentLayer !== 'Media' && (
                    <div className="bg-background p-4 rounded-xl border border-border/50 text-sm">
                      <span className="font-bold text-charcoal block mb-1">Si la quieres Media:</span>
                      Usa paella de <span className="font-bold text-primary">~{calcDia(riceNum, 'Media')} cm</span> o pon <span className="font-bold text-primary">~{calcRice(diaNum, 'Media')}g</span> de arroz.
                    </div>
                  )}
                  {currentLayer !== 'Abundante' && (
                    <div className="bg-background p-4 rounded-xl border border-border/50 text-sm">
                      <span className="font-bold text-charcoal block mb-1">Si la quieres Abundante:</span>
                      Usa paella de <span className="font-bold text-primary">~{calcDia(riceNum, 'Abundante')} cm</span> o pon <span className="font-bold text-primary">~{calcRice(diaNum, 'Abundante')}g</span> de arroz.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASO 2: SOLO ARROZ (O SOLO RACIONES calculadas) Y NO DIAMETRO */}
            {assumedRice > 0 && !hasDia && (
              <div>
                <span className="text-muted-foreground text-sm block mb-3">Diámetro recomendado para {assumedRice}g:</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Fina</span>
                    <span className="font-bold text-lg text-primary">~{calcDia(assumedRice, 'Fina')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-xl text-primary">~{calcDia(assumedRice, 'Media')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-lg text-primary">~{calcDia(assumedRice, 'Abundante')} cm</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 3: SOLO DIÁMETRO Y NO ARROZ */}
            {hasDia && !hasRice && !hasServ && (
              <div>
                <span className="text-muted-foreground text-sm block mb-3">Arroz recomendado para {diaNum}cm:</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Fina</span>
                    <span className="font-bold text-lg text-primary">~{calcRice(diaNum, 'Fina')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-xl text-primary">~{calcRice(diaNum, 'Media')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-lg text-primary">~{calcRice(diaNum, 'Abundante')} g</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
