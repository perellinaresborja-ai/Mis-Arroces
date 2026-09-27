"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Search, X, Sparkles, Loader2 } from "lucide-react"

export interface GifItem {
  id: string
  title: string
  url: string
  aspectRatio: number
}

interface CommentGifPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (gif: GifItem) => void
}

export function CommentGifPicker({ isOpen, onClose, onSelect }: CommentGifPickerProps) {
  const [query, setQuery] = useState("")
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false

    if (!apiKey) {
      setGifs([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const endpoint = query.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=30&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=30&rating=g`

        const res = await fetch(endpoint)
        const json = await res.json()
        if (!isCancelled && json.data) {
          setGifs(
            json.data.map((item: any) => ({
              id: item.id,
              title: item.title || "GIF",
              url:
                item.images?.fixed_height?.url ||
                item.images?.downsized?.url ||
                item.images?.original?.url,
              aspectRatio:
                item.images?.fixed_height?.width && item.images?.fixed_height?.height
                  ? item.images.fixed_height.width / item.images.fixed_height.height
                  : 1,
            }))
          )
        }
      } catch (err) {
        console.error("Giphy gifs fetch error:", err)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }, query.trim() ? 300 : 0)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [query, apiKey, isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Container: Bottom sheet on mobile, centered modal on desktop */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Seleccionar GIF"
        className="relative z-10 w-full bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[82dvh] h-[78dvh] sm:h-[500px] sm:max-h-[85vh] sm:max-w-md animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle drag pill */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3 shrink-0 sm:hidden" />

        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-black uppercase tracking-wider text-foreground">
              GIFs de GIPHY
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en GIPHY..."
            className="w-full h-10 pl-10 pr-9 rounded-2xl border border-border bg-muted/40 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Contenido / Grid */}
        {!apiKey ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-bold text-foreground">GIPHY no configurado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Configura NEXT_PUBLIC_GIPHY_API_KEY para buscar GIFs.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain grid grid-cols-3 gap-2 pr-0.5">
            {loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Cargando GIFs…</span>
              </div>
            )}
            {!loading && gifs.length === 0 && (
              <div className="col-span-full text-center text-xs text-muted-foreground py-16">
                No se encontraron GIFs para esta búsqueda.
              </div>
            )}
            {!loading &&
              gifs.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelect(g)}
                  className="rounded-2xl overflow-hidden aspect-square bg-muted/40 border border-border/50 hover:border-primary active:scale-95 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    loading="lazy"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform"
                  />
                </button>
              ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
