"use client"

import React, { useState, useEffect, useRef } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)

  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY

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
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=24&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=24&rating=g`

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
    }, query.trim() ? 350 : 0)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [query, apiKey, isOpen])

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-2 left-0 right-0 max-w-sm sm:max-w-md mx-auto bg-card border border-border rounded-3xl shadow-2xl p-3 z-50 flex flex-col h-72 sm:h-80 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GIPHY</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-2 shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar GIFs..."
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-border bg-muted/40 focus:bg-background outline-none text-xs text-foreground placeholder:text-muted-foreground transition-all"
        />
      </div>

      {/* Contenido / Grid */}
      {!apiKey ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold text-foreground">GIPHY no configurado</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Configura NEXT_PUBLIC_GIPHY_API_KEY para buscar GIFs.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-contain grid grid-cols-3 gap-1.5 pr-1">
          {loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs">Cargando GIFs…</span>
            </div>
          )}
          {!loading && gifs.length === 0 && (
            <div className="col-span-full text-center text-xs text-muted-foreground py-10">
              No se encontraron GIFs.
            </div>
          )}
          {!loading &&
            gifs.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelect(g)}
                className="rounded-xl overflow-hidden aspect-square bg-muted/30 border border-border/40 hover:border-primary/50 transition-all hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={g.url}
                  alt={g.title}
                  loading="lazy"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
