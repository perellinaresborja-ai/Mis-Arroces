"use client";

import { useState } from "react";
import { BackButton } from "@/components/domain/BackButton";
import { calculateLayer, getRecommendedDiameter, getRecommendedRice, calculateArea, LayerType } from "@/lib/paella-calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scaling, Info, ChefHat, Droplet, Share2 } from "lucide-react";

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

  // Helpers
  const calcLayer = (r: number, d: number) => calculateLayer(r * multiplier, d);
  const calcDia = (r: number, l: LayerType) => getRecommendedDiameter(r * multiplier, l);
  const calcRice = (d: number, l: LayerType) => Math.round(getRecommendedRice(d, l) / multiplier);

  // Calculos derivados
  const assumedRice = hasRice ? riceNum : (hasServ ? servNum * 100 : 0);
  const brothRatio = (hasRice && hasBroth) ? (brothNum / riceNum).toFixed(2).replace(/\.00$/, '') : null;
  const currentLayer = (hasRice && hasDia) ? calcLayer(riceNum, diaNum) : null;
  
  const area = hasDia ? calculateArea(diaNum) : 0;
  const realDensity = (hasRice && area > 0) ? ((riceNum * multiplier) / area).toFixed(3) : null;

  // Resumen dinamico
  const summaryParts = [];
  if (hasRice) summaryParts.push(`${riceNum} g`);
  if (hasServ) summaryParts.push(`${servNum} pers`);
  if (hasRice && hasServ) summaryParts.push(`${Math.round(riceNum/servNum)} g/pers`);
  if (hasDia) summaryParts.push(`Paella ${diaNum} cm`);
  const summaryText = summaryParts.join(' · ');

  const handleShare = async () => {
    const text = `🥘 misarroces\n${summaryText}\nCapa: ${currentLayer}\n${brothRatio ? 'Arroz/caldo: 1:' + brothRatio : ''}\n\n${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'misarroces',
          text: text
        });
      } catch (e) {}
    } else {
      alert("Texto copiado para compartir:\n\n" + text);
    }
  };

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
            <h2 className="text-xl font-bold">Tus Datos</h2>
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
              <Button type="button" size="sm" variant={style === 'A_BANDA' ? 'default' : 'outline'} onClick={() => setStyle('A_BANDA')} className="flex-1 justify-start h-auto py-2.5 px-4">
                <div className="text-left">
                  <div className="font-bold text-sm">Arroz Limpio</div>
                  <div className={`text-[10px] font-normal mt-0.5 ${style === 'A_BANDA' ? 'opacity-90' : 'text-muted-foreground'}`}>A banda, Senyoret...</div>
                </div>
              </Button>
              <Button type="button" size="sm" variant={style === 'TRADICIONAL' ? 'default' : 'outline'} onClick={() => setStyle('TRADICIONAL')} className="flex-1 justify-start h-auto py-2.5 px-4">
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
                Introduce arroz, caldo, diámetro o raciones y te diré cómo hacer la paella a tu gusto.
              </p>
            )}

            {/* CASO 1: ARROZ + DIÁMETRO (EL PROTAGONISTA) */}
            {hasRice && hasDia && currentLayer && (
              <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* HEADLINE */}
                <div>
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest block mb-2">Capa actual</span>
                  <h2 className="text-5xl font-black uppercase text-primary tracking-tight leading-none mb-4">{currentLayer}</h2>
                  
                  <div className="inline-flex items-center justify-center bg-background border border-border px-4 py-2.5 rounded-full shadow-sm text-sm font-medium text-charcoal">
                    {summaryText}
                  </div>
                </div>

                {/* FILA TÉCNICA */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  {hasBroth && (
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      Arroz/caldo: 1:{brothRatio}
                    </div>
                  )}
                  {realDensity && (
                    <div className="bg-muted px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground">
                      Densidad: {realDensity} g/cm²
                    </div>
                  )}
                </div>

                {/* ALTERNATIVAS */}
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {(['Fina', 'Media', 'Abundante'] as LayerType[]).filter(l => l !== currentLayer).map(l => (
                    <div key={l} className="bg-background p-4 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        MÁS {l.toUpperCase()}
                      </span>
                      <div className="text-lg font-black text-charcoal leading-tight">
                        {calcDia(riceNum, l)} cm
                      </div>
                      <div className="text-xs text-muted-foreground my-1">o</div>
                      <div className="text-lg font-black text-charcoal leading-tight">
                        {calcRice(diaNum, l)} g
                      </div>
                    </div>
                  ))}
                </div>

                {/* COMPARTIR */}
                <Button onClick={handleShare} className="w-full sm:w-auto mt-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all" size="lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartir resultado
                </Button>
              </div>
            )}

            {/* CASOS INCOMPLETOS: SOLO CALDO */}
            {hasRice && hasBroth && !hasDia && (
              <div className="flex items-center justify-between bg-primary/10 text-primary p-4 rounded-2xl border border-primary/20">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block mb-0.5">Arroz/caldo</span>
                  <span className="text-2xl font-black">1:{brothRatio}</span>
                </div>
                <Droplet className="w-8 h-8 opacity-50" />
              </div>
            )}

            {/* NOTA RACIONES (solo si no estamos en el CASO 1 que ya tiene resumen) */}
            {hasServ && (hasRice || assumedRice > 0) && (!hasRice || !hasDia) && (
              <div className="flex items-start gap-2 text-sm bg-background p-3 rounded-xl border border-border">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {hasRice 
                    ? `Con ${riceNum}g tocan a ${Math.round(riceNum / servNum)} g/persona.`
                    : `Calculando ${assumedRice}g de arroz en total (${Math.round(assumedRice / servNum)} g/persona).`}
                </span>
              </div>
            )}

            {/* CASO 2: SOLO ARROZ (O SOLO RACIONES calculadas) Y NO DIAMETRO */}
            {assumedRice > 0 && !hasDia && (
              <div>
                <span className="text-muted-foreground text-sm block mb-3">Diámetro recomendado para {assumedRice}g:</span>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Fina</span>
                    <span className="font-bold text-base sm:text-lg text-primary">~{calcDia(assumedRice, 'Fina')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-lg sm:text-xl text-primary">~{calcDia(assumedRice, 'Media')} cm</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-base sm:text-lg text-primary">~{calcDia(assumedRice, 'Abundante')} cm</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 3: SOLO DIÁMETRO Y NO ARROZ */}
            {hasDia && !hasRice && !hasServ && (
              <div>
                <span className="text-muted-foreground text-sm block mb-3">Arroz recomendado para {diaNum}cm:</span>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Fina</span>
                    <span className="font-bold text-base sm:text-lg text-primary">~{calcRice(diaNum, 'Fina')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm border-primary/30">
                    <span className="block text-xs uppercase text-muted-foreground mb-1 font-bold text-primary">Media</span>
                    <span className="font-bold text-lg sm:text-xl text-primary">~{calcRice(diaNum, 'Media')} g</span>
                  </div>
                  <div className="bg-background p-3 rounded-xl border border-border/50">
                    <span className="block text-xs uppercase text-muted-foreground mb-1">Abundante</span>
                    <span className="font-bold text-base sm:text-lg text-primary">~{calcRice(diaNum, 'Abundante')} g</span>
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
