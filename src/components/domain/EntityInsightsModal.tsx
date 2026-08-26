"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Eye, Users, Heart, MessageCircle, Share2, ShoppingCart, Loader2 } from "lucide-react"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                <Eye className="w-5 h-5 text-muted-foreground mb-2" />
                <span className="text-2xl font-black">{data.views || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Vistas</span>
              </div>
              <div className="bg-background p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                <Users className="w-5 h-5 text-muted-foreground mb-2" />
                <span className="text-2xl font-black">{data.reach || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Alcance</span>
              </div>
              <div className="bg-background p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                <Share2 className="w-5 h-5 text-muted-foreground mb-2" />
                <span className="text-2xl font-black">{data.shares || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Compartido</span>
              </div>
              {entityType === 'STORY' ? (
                <div className="bg-background p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                  <Heart className="w-5 h-5 text-muted-foreground mb-2" />
                  <span className="text-2xl font-black">{data.link_clicks || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Clics Link</span>
                </div>
              ) : (
                <div className="bg-background p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground mb-2" />
                  <span className="text-2xl font-black">{data.shopping_adds || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">En listas</span>
                </div>
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
