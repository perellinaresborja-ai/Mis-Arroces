"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Plus, Image as ImageIcon, Clock, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"

export function GlobalCreateMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const options = [
    {
      label: "Publicación",
      icon: ImageIcon,
      href: "/create/post"
    },
    {
      label: "Subir historia",
      icon: Clock,
      href: "/create/story"
    },
    {
      label: "Nueva Receta",
      icon: ChefHat,
      href: "/create/recipe"
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 hover:opacity-80 shrink-0 cursor-pointer select-none",
          "bg-primary text-primary-foreground border-primary"
        )}
        aria-label="Crear nuevo contenido"
        aria-expanded={isOpen}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop transparente para capturar toques/clicks fuera de forma inmediata */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-12 w-56 bg-card border border-border shadow-lg rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex flex-col gap-1">
              {options.map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors text-left font-semibold text-sm cursor-pointer select-none touch-manipulation"
                >
                  <option.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{option.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
