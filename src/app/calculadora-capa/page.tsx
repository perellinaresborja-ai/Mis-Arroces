"use client";

import { useState } from "react";
import { BackButton } from "@/components/domain/BackButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scaling, Info } from "lucide-react";
import { 
  calculateLayer, 
  getRecommendedDiameter, 
  getRecommendedRice, 
  LayerType,
  DEFAULT_RICE_PER_PERSON
} from "@/lib/paella-calculator";

type CalcMode = 'LAYER' | 'DIAMETER' | 'RICE';

export default function CalculadoraCapaPage() {
  const [mode, setMode] = useState<CalcMode>('LAYER');
  const [rice, setRice] = useState<string>('');
  const [diameter, setDiameter] = useState<string>('');
  const [layer, setLayer] = useState<LayerType>('Media');
  
  const [servings, setServings] = useState<string>('');
  const [customRicePerPerson, setCustomRicePerPerson] = useState<string>(DEFAULT_RICE_PER_PERSON.toString());

  const riceNum = Number(rice);
  const diaNum = Number(diameter);
  const servNum = Number(servings);
  const rppNum = Number(customRicePerPerson) || DEFAULT_RICE_PER_PERSON;

  const calculatedLayer = (mode === 'LAYER' && riceNum > 0 && diaNum > 0) ? calculateLayer(riceNum, diaNum) : layer;
  const calculatedDiameter = (mode === 'DIAMETER' && riceNum > 0) ? getRecommendedDiameter(riceNum, layer) : diaNum;
  const calculatedRice = (mode === 'RICE' && diaNum > 0) ? getRecommendedRice(diaNum, layer) : riceNum;

  const effectiveRice = mode === 'RICE' ? calculatedRice : riceNum;
  const computedRicePerPerson = (servNum > 0 && effectiveRice > 0) ? Math.round(effectiveRice / servNum) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-bold truncate text-foreground">Calculadora de Capa</h1>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-xl mx-auto w-full">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Scaling className="w-6 h-6" />
            <h2 className="text-xl font-bold font-serif">¿Qué quieres calcular?</h2>
          </div>

          <div className="flex flex-col gap-2 mb-8">
            <Button variant={mode === 'LAYER' ? 'default' : 'outline'} onClick={() => setMode('LAYER')} className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-bold">Capa Actual</div>
                <div className="text-xs opacity-80 font-normal">Tengo arroz y diámetro</div>
              </div>
            </Button>
            <Button variant={mode === 'DIAMETER' ? 'default' : 'outline'} onClick={() => setMode('DIAMETER')} className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-bold">Diámetro Recomendado</div>
                <div className="text-xs opacity-80 font-normal">Tengo arroz y quiero una capa</div>
              </div>
            </Button>
            <Button variant={mode === 'RICE' ? 'default' : 'outline'} onClick={() => setMode('RICE')} className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-bold">Arroz Recomendado</div>
                <div className="text-xs opacity-80 font-normal">Tengo diámetro y quiero una capa</div>
              </div>
            </Button>
          </div>

          <div className="space-y-6">
            {(mode === 'LAYER' || mode === 'DIAMETER') && (
              <div className="space-y-2">
                <Label>Arroz total (g)</Label>
                <Input type="number" value={rice} onChange={e => setRice(e.target.value)} placeholder="Ej. 800" />
              </div>
            )}

            {(mode === 'LAYER' || mode === 'RICE') && (
              <div className="space-y-2">
                <Label>Diámetro de paella (cm)</Label>
                <Input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} placeholder="Ej. 60" />
              </div>
            )}

            {(mode === 'DIAMETER' || mode === 'RICE') && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Capa deseada</Label>
                <div className="flex gap-2">
                  {(['Fina', 'Media', 'Abundante'] as LayerType[]).map((l) => (
                    <Button key={l} type="button" size="sm" variant={layer === l ? 'default' : 'outline'} onClick={() => setLayer(l)} className="flex-1">{l}</Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Resultado</h3>
          
          <div className="flex flex-col gap-4">
            {mode === 'LAYER' && (
              <>
                {riceNum > 0 && diaNum > 0 ? (
                  <div>
                    <span className="text-muted-foreground text-sm">Capa estimada:</span>
                    <p className="text-3xl font-bold uppercase text-foreground mt-1">{calculatedLayer}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Introduce arroz y diámetro para calcular la capa.</p>
                )}
              </>
            )}

            {mode === 'DIAMETER' && (
              <>
                {riceNum > 0 ? (
                  <div>
                    <span className="text-muted-foreground text-sm">Diámetro recomendado para capa {layer.toLowerCase()}:</span>
                    <p className="text-3xl font-bold text-foreground mt-1">~ {calculatedDiameter} cm</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Introduce el arroz para calcular el diámetro.</p>
                )}
              </>
            )}

            {mode === 'RICE' && (
              <>
                {diaNum > 0 ? (
                  <div>
                    <span className="text-muted-foreground text-sm">Arroz recomendado para capa {layer.toLowerCase()}:</span>
                    <p className="text-3xl font-bold text-foreground mt-1">~ {calculatedRice} g</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Introduce el diámetro para calcular el arroz.</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-charcoal">Personas (Opcional)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>Raciones</Label>
                <Input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="Ej. 8" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Ref. (g/pers)</Label>
                <Input type="number" value={customRicePerPerson} onChange={e => setCustomRicePerPerson(e.target.value)} />
              </div>
            </div>
            
            {servNum > 0 && effectiveRice > 0 && (
              <div className="p-3 bg-muted/50 rounded-xl border border-border text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span>
                  Con {effectiveRice}g para {servNum} personas, tocan a <span className="font-bold">{computedRicePerPerson} g/persona</span>.
                </span>
              </div>
            )}

            {servNum > 0 && (!effectiveRice || effectiveRice === 0) && mode === 'DIAMETER' && (
              <div className="p-3 bg-muted/50 rounded-xl border border-border text-sm flex flex-col gap-2">
                <span>Si usas {rppNum} g/persona:</span>
                <Button variant="secondary" onClick={() => setRice(String(servNum * rppNum))}>
                  Fijar arroz a {servNum * rppNum} g
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
