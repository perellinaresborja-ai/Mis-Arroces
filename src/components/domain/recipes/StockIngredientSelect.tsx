"use client"

import React, { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ingredient {
  id: string
  normalized_name: string
}

interface StockIngredientSelectProps {
  ingredientId: string | null
  onChange: (data: { ingredientId: string | null }) => void
  initialIngredients?: Ingredient[]
  disabled?: boolean
}

function normalize(str: string | null | undefined) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function StockIngredientSelect({
  ingredientId,
  onChange,
  initialIngredients = [],
  disabled = false
}: StockIngredientSelectProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialIngredients && initialIngredients.length > 0) {
      setIngredients(initialIngredients)
    }
  }, [initialIngredients])

  const selectedIngredient = ingredients.find((i) => i.id === ingredientId)

  useEffect(() => {
    if (!isOpen) {
      if (selectedIngredient) {
        setInputValue(selectedIngredient.normalized_name.charAt(0).toUpperCase() + selectedIngredient.normalized_name.slice(1))
      } else {
        setInputValue("")
      }
    }
  }, [ingredientId, selectedIngredient, isOpen])

  const normInput = normalize(inputValue)
  
  const filteredIngredients = normInput.length < 2 
    ? [] // require 2 chars to search, otherwise too many
    : ingredients.filter((i) => normalize(i.normalized_name).includes(normInput)).slice(0, 15) // max 15 results

  const handleSelect = (i: Ingredient) => {
    setInputValue(i.normalized_name.charAt(0).toUpperCase() + i.normalized_name.slice(1))
    onChange({ ingredientId: i.id })
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue("")
    onChange({ ingredientId: null })
    inputRef.current?.focus()
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder="Escribe 'fumet' o 'caldo'..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-10 px-3 pr-8 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button type="button" onClick={handleClear} className="p-1 rounded-full text-muted-foreground hover:bg-muted">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && inputValue.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl p-1.5 animate-in fade-in zoom-in-95">
          <div className="space-y-0.5">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((i) => {
                const isSelected = i.id === ingredientId
                return (
                  <button
                    key={i.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(i)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-xl flex items-center justify-between cursor-pointer hover:bg-muted",
                      isSelected && "bg-primary/15 text-primary font-semibold"
                    )}
                  >
                    <span className="truncate">{i.normalized_name.charAt(0).toUpperCase() + i.normalized_name.slice(1)}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                No hay coincidencias
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
