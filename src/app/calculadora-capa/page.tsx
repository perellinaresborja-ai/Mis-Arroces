"use client";

import { useState } from "react";
import { BackButton } from "@/components/domain/BackButton";
import { calculateLayer, getRecommendedDiameter, getRecommendedRice, LayerType, DEFAULT_RICE_PER_PERSON } from "@/lib/paella-calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scaling, Info } from "lucide-react";

export default function LayerCalculatorPage() {
  const [rice, setRice] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [layer, setLayer] = useState<LayerType>('Fina');
  const [servings, setServings] = useState<string>('');
  const [rpp, setRpp] = useState<string>(DEFAULT_RICE_PER_PERSON.toString());

  const riceNum = Number(rice);
  const diaNum = Number(diameter);
  const servNum = Number(servings);
  const rppNum = Number(rpp) || DEFAULT_RICE_PER_PERSON;

  const hasRice = riceNum > 0;
  const hasDia = diaNum > 0;
  const hasServings = servNum > 0;

  // Calculos automÃ¡ticos
  const currentLayer = (hasRice && hasDia) ? calculateLayer(riceNum, diaNum) : null;
  const recDiaTarget = hasRice ? getRecommendedDiameter(riceNum, layer) : null;
  const recRiceTarget = hasDia ? getRecommendedRice(diaNum, layer) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-bold truncate text-foreground">Calculadora de Capa</h1>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-xl mx-auto w-full space-y-6">
        
        {/* INPUTS BLOCKS */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Scaling className="w-6 h-6" />
            <h2 className="text-xl font-bold font-serif">Datos de tu Paella</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arroz total (g)</Label>
                <Input type="number" value={rice} onChange={e => setRice(e.target.value)} placeholder="Ej. 800" />
              </div>
              <div className="space-y-2">
                <Label>DiÃ¡metro (cm)</Label>
                <Input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} placeholder="Ej. 60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Capa deseada</Label>
              <div className="flex gap-2">
                {(['Fina', 'Media', 'Abundante'] as LayerType[]).map((l) => (
                  <Button 
                    key={l} 
                    type="button" 
                    size="sm" 
                    variant={layer === l ? 'default' : 'outline'} 
                    onClick={() => setLayer(l)} 
                    className="flex-1"
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS BLOCK */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Resultado</h3>
          
          <div className="flex flex-col gap-4">
            {!hasRice && !hasDia && (
              <p className="text-muted-foreground text-sm">Introduce el arroz y/o el diÃ¡metro para calcular.</p>
            )}

            {/* CASO 1 & 4: Arroz + DiÃ¡metro */}
            {hasRice && hasDia && currentLayer && (
              <div>
                <span className="text-muted-foreground text-sm">Capa actual:</span>
                <p className="text-3xl font-bold uppercase text-foreground mt-1 mb-4">{currentLayer}</p>
                
                {currentLayer === layer ? (
                  <div className="bg-primary/10 text-primary p-3 rounded-xl border border-primary/20 text-sm font-medium">
                    Â¡Â¡Tu paella es perfecta para una capa {layer.toLowerCase()}!
                  </div>
                ) : (
                  <div className="space-y-2 bg-background p-4 rounded-xl border border-border/50 text-sm">
                    <p className="font-semibold text-charcoal mb-2">Para conseguir tu capa {layer.toLowerCase()}:</p>
                    <p>Paella recomendada: <span className="font-bold text-primary">~{recDiaTarget} cm</span></p>
                  </div>
                )}
              </div>
            )}

            {/* CASO 2: Solo Arroz */}
            {hasRice && !hasDia && (
              <div>
                <span className="text-muted-foreground text-sm">Paella recomendada (Capa {layer}):</span>
                <p className="text-3xl font-bold text-foreground mt-1">~ {recDiaTarget} cm</p>
              </div>
            )}

            {/* CASO 3: Solo DiÃ¡metro */}
            {!hasRice && hasDia && (
              <div>
                <span className="text-muted-foreground text-sm">Arroz recomendado (Capa {layer}):</span>
                <p className="text-3xl font-bold text-foreground mt-1">~ {recRiceTarget} g</p>
              </div>
            )}
          </div>
        </div>

        {/* PERSONAS (SECUNDARIO) */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-charcoal mb-4">Personas (Opcional)</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Raciones</Label>
              <Input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="Ej. 8" />
            </div>
            <div className="space-y-2">
              <Label>Ref. (g/pers)</Label>
              <Input type="number" value={rpp} onChange={e => setRpp(e.target.value)} />
            </div>
          </div>
          
          {hasServings && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm flex flex-col gap-2 mt-2">
              {hasRice ? (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Con {riceNum}g para {servNum} personas, tocan a <span className="font-bold">{Math.round(riceNum / servNum)} g/persona</span>.
                  </span>
                </div>
              ) : (!hasRice && hasDia && recRiceTarget ? (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Usando {recRiceTarget}g para {servNum} personas, tocarÃ­an a <span className="font-bold">{Math.round(recRiceTarget / servNum)} g/persona</span>.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Si usas {rppNum} g/persona:</span>
                  <Button variant="secondary" size="sm" onClick={() => setRice(String(servNum * rppNum))}>
                    Fijar arroz a {servNum * rppNum} g
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
