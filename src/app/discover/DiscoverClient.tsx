"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DiscoverClient({ 
  initialQ, 
  initialTab, 
  varieties, 
  styles 
}: { 
  initialQ: string, 
  initialTab: string, 
  varieties: any[], 
  styles: any[] 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(initialQ)
  const [showFilters, setShowFilters] = useState(false)

  // Sync state with URL if it changes (e.g. back button)
  useEffect(() => {
    setQ(initialQ)
  }, [initialQ])

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQ = searchParams.get("q") || ""
      if (q !== currentQ) {
        updateUrl(q, searchParams.get("tab") || "todo")
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [q, searchParams])

  const updateUrl = (newQ: string, newTab: string, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newQ) params.set("q", newQ)
    else params.delete("q")
    
    if (newTab && newTab !== "todo") params.set("tab", newTab)
    else params.delete("tab")

    Object.entries(extraParams).forEach(([key, val]) => {
      if (val) params.set(key, val)
      else params.delete(key)
    })

    router.push(`/discover?${params.toString()}`)
  }

  const tabs = [
    { id: "todo", label: "Todo" },
    { id: "arroces", label: "Arroces" },
    { id: "personas", label: "Personas" },
    { id: "publicaciones", label: "Publicaciones" },
    { id: "cocinados", label: "Cocinados" }
  ]

  const activeTab = initialTab || "todo"

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca arroces, personas, ingredientes..." 
            className="pl-10 h-12 bg-card rounded-xl shadow-sm border-border" 
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs (solo si hay búsqueda activa) */}
      {(initialQ || initialTab !== "todo") && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => updateUrl(q, t.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === t.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "arroces" && (
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="rounded-full ml-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          )}
        </div>
      )}

      {/* Panel de Filtros */}
      {showFilters && activeTab === "arroces" && (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Filtros</h3>
            <button onClick={() => {
              updateUrl(q, activeTab, { variety: "", style: "" })
            }} className="text-sm text-primary hover:underline">
              Limpiar
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Variedad de Arroz</label>
              <div className="flex flex-wrap gap-2">
                {varieties.map(v => {
                  const isActive = searchParams.get("variety") === v.id
                  return (
                    <button 
                      key={v.id} 
                      onClick={() => updateUrl(q, activeTab, { variety: isActive ? "" : v.id })}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isActive ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {v.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Estilo</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => {
                  const isActive = searchParams.get("style") === s.id
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => updateUrl(q, activeTab, { style: isActive ? "" : s.id })}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isActive ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
