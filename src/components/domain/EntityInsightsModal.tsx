"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Eye, Users, Heart, MessageCircle, Share2, ShoppingCart, Loader2, Bookmark, Star, Pointer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function EntityInsightsModal({ 
  isOpen, 
  onClose, 
  entityType, 
  entityId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  entityType: string; 
  entityId: string; 
}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    const supabase = createClient()
    supabase.rpc('get_entity_insights', { 
      entity_type_param: entityType, 
      entity_id_param: entityId 
    }).then(({ data, error }) => {
      if (!error && data) {
        setData(data)
      }
      setLoading(false)
    })
  }, [isOpen, entityType, entityId])

  if (!isOpen) return null

  const renderMetric = (icon: any, value: number, label: string) => (
    <div className="bg-background p-3 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <span className="text-xl font-black">{value || 0}</span>
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{label}</span>
    </div>
  )

  const ctr = data?.views ? ((data.link_clicks / data.views) * 100).toFixed(1) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-bold text-lg">Estadísticas</h2>
          <button onClick={onClose} className="p-2 bg-background rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : data ? (
            <div className="grid grid-cols-3 gap-3">
              {renderMetric(<Eye className="w-5 h-5"/>, data.views, "Vistas")}
              {renderMetric(<Users className="w-5 h-5"/>, data.reach, "Alcance")}
              {renderMetric(<Share2 className="w-5 h-5"/>, data.shares, "Compartido")}
              
              {entityType === 'STORY' && (
                <>
                  {renderMetric(<Pointer className="w-5 h-5"/>, data.link_clicks, "Clics Link")}
                  {renderMetric(<Heart className="w-5 h-5"/>, data.likes, "Likes")}
                  <div className="bg-background p-3 rounded-2xl border border-border flex flex-col items-center justify-center text-center col-span-1">
                    <span className="text-xl font-black text-primary">{ctr}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">CTR</span>
                  </div>
                </>
              )}
              
              {entityType === 'RECIPE' && (
                <>
                  {renderMetric(<Heart className="w-5 h-5"/>, data.likes, "Likes")}
                  {renderMetric(<MessageCircle className="w-5 h-5"/>, data.comments, "Coments")}
                  {renderMetric(<Bookmark className="w-5 h-5"/>, data.saves, "Guardados")}
                  {renderMetric(<Star className="w-5 h-5 text-yellow-500"/>, data.cooked, "Cocinados")}
                  {renderMetric(<ShoppingCart className="w-5 h-5"/>, data.shopping_adds, "Listas")}
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No hay datos suficientes.</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
