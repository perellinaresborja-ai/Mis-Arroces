"use client"

import { useEffect, useState } from "react"
import { getStoryInsights } from "@/app/actions/stories"
import { Eye, MousePointerClick, MessageCircle, BarChart, TrendingUp, X } from "lucide-react"

export function StoryInsightsModal({ storyId, onClose }: { storyId: string, onClose: () => void }) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoryInsights(storyId).then(data => {
      setInsights(data);
      setLoading(false);
    }).catch(console.error);
  }, [storyId]);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-background/95 text-foreground backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-lg font-serif">Actividad</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-10 opacity-50">Cargando estadísticas...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-1">
                <Eye className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-2xl font-bold">{insights.views}</span>
                <span className="text-xs text-muted-foreground font-medium">Visualizaciones</span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-1">
                <TrendingUp className="w-5 h-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{insights.reach}</span>
                <span className="text-xs text-muted-foreground font-medium">Cuentas únicas</span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-1">
                <MessageCircle className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-2xl font-bold">{insights.replies}</span>
                <span className="text-xs text-muted-foreground font-medium">Respuestas (DM)</span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-1">
                <MousePointerClick className="w-5 h-5 text-green-500 mb-1" />
                <span className="text-2xl font-bold">{insights.recipeClicks}</span>
                <span className="text-xs text-muted-foreground font-medium">Clics en Receta</span>
              </div>
            </div>

            {insights.polls?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2"><BarChart className="w-4 h-4"/> Encuestas</h4>
                {insights.polls.map((p: any, i: number) => (
                  <div key={i} className="bg-card border border-border p-4 rounded-2xl space-y-3">
                    <p className="font-semibold text-sm">{p.question}</p>
                    <div className="space-y-2">
                      <div className="relative h-8 bg-muted rounded-xl overflow-hidden flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 bg-primary/20" style={{ width: `${p.percentA}%`}} />
                        <div className="relative w-full flex justify-between px-3 text-xs font-bold">
                          <span>{p.optionA}</span>
                          <span>{p.percentA}%</span>
                        </div>
                      </div>
                      <div className="relative h-8 bg-muted rounded-xl overflow-hidden flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 bg-primary/20" style={{ width: `${p.percentB}%`}} />
                        <div className="relative w-full flex justify-between px-3 text-xs font-bold">
                          <span>{p.optionB}</span>
                          <span>{p.percentB}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{p.total} votos</p>
                  </div>
                ))}
              </div>
            )}
            
            {insights.sliders?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm">Sliders</h4>
                {insights.sliders.map((s: any, i: number) => (
                  <div key={i} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{s.prompt || 'Sin pregunta'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.total} respuestas</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="font-bold text-lg">{s.average}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
