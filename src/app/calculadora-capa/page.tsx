"use client";

import { useState } from "react";
import { BackButton } from "@/components/domain/BackButton";
import { calculateLayer, getRecommendedDiameter, getRecommendedRice, LayerType } from "@/lib/paella-calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scaling, Info, Sparkles } from "lucide-react";

export default function LayerCalculatorPage() {
  const [rice, setRice] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [servings, setServings] = useState<string>('');

  const riceNum = Number(rice);
  const diaNum = Number(diameter);
  const servNum = Number(servings);

  const hasRice = riceNum > 0;
  const hasDia = diaNum > 0;
  const hasServ = servNum > 0;

  // Calculos derivados
  const assumedRice = hasRice ? riceNum : (hasServ ? servNum * 100 : 0);
  const currentLayer = (hasRice && hasDia) ? calculateLayer(riceNum, diaNum) : null;

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Arroz total (g)</Label>
              <Input type="number" value={rice} onChange={e => setRice(e.target.value)} placeholder="Ej. 800" className="bg-background" />
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
        </div>

        {/* TARJETA DE RESULTADOS MÁGICA */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm min-h-[250px]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">La magia</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            {!hasRice && !hasDia && !hasServ && (
              <p className="text-muted-foreground text-sm italic">
                Introduce el arroz, el diámetro o las raciones y te diré cómo hacer la paella perfecta.
              </p>
            )}

            {/* NOTA RACIONES */}
            {hasServ && (hasRice || assumedRice > 0) && (
              <div className="flex items-start gap-2 text-sm bg-primary/10 text-primary p-3 rounded-xl border border-primary/20">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
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
                      Usa paella de <span className="font-bold text-primary">~{getRecommendedDiameter(riceNum, 'Fina')} cm</span> o pon <span className="font-bold text-primary">~{getRecommendedRice(diaNum, 'Fina')}g</span> de arroz.
                    </div>
                  )}
                  {currentLayer !== 'Media' && (
                    <div className="bg-background p-4 rounded-xl border border-border/50 text-sm">
                      <span className="font-bold text-charcoal block mb-1">Si la quieres Media:</span>
                      Usa paella de <span className="font-bold text-primary">~{getRecommendedDiameter(riceNum, 'Media')} cm</span> o pon <span className="font-bold text-primary">~{getRecommendedRice(diaNum, 'Media')}g</span> de arroz.
                    </div>
                  )}
                  {currentLayer !== 'Abundante' && (
                    <div className="bg-background p-4 rounded-xl border border-border/50 text-sm">
                      <span className="font-bold text-charcoal block mb-1">Si la quieres Abundante:</span>
                      Usa paella de <span className="font-bold text-primary">~{getRecommendedDiameter(riceNum, 'Abundante')} cm</span> o pon <span className="font-bold text-primary">~{getRecommendedRice(diaNum, 'Abundante')}g</span> de arroz.
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
                    <span className="font-bold text-lg text-primary">~{getRecommendedDiameter(assumedRice, 'Fina')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-xl text-primary">~{getRecommendedDiameter(assumedRice, 'Media')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-lg text-primary">~{getRecommendedDiameter(assumedRice, 'Abundante')} cm</span>
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
                    <span className="font-bold text-lg text-primary">~{getRecommendedRice(diaNum, 'Fina')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-xl text-primary">~{getRecommendedRice(diaNum, 'Media')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-lg text-primary">~{getRecommendedRice(diaNum, 'Abundante')} g</span>
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