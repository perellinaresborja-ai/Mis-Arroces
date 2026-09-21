"use client"

import React, { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiceVariety {
  id: string
  name: string
}

interface RiceVarietySelectProps {
  varietyId?: string | null
  
  onChange: (val: { varietyId: string | null;  }) => void
  initialVarieties: RiceVariety[]
  disabled?: boolean
}

function normalize(str: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function RiceVarietySelect({
  varietyId,
  
  onChange,
  initialVarieties = [],
  disabled = false }: RiceVarietySelectProps) {
  const [varieties, setVarieties] = useState<RiceVariety[]>(initialVarieties)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep varieties updated if parent catalogs change
  useEffect(() => {
    if (initialVarieties && initialVarieties.length > 0) {
      setVarieties((prev) => {
        const map = new Map<string, RiceVariety>()
        prev.forEach((v) => map.set(v.id, v))
        initialVarieties.forEach((v) => map.set(v.id, v))
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"))
      })
    }
  }, [initialVarieties])

  // Selected catalog variety if varietyId is provided
  const selectedCatalogVariety = varieties.find((v) => v.id === varietyId)

  // Sync input text with prop values when not open
  useEffect(() => {
    if (!isOpen) {
      if (selectedCatalogVariety) {
        setInputValue(selectedCatalogVariety.name)
      } else {
        setInputValue("")
      }
    }
  }, [varietyId,  selectedCatalogVariety, isOpen])

  const normInput = normalize(inputValue)
  const isInputMatchingSelected =
    (selectedCatalogVariety && normalize(selectedCatalogVariety.name) === normInput) 

  // Filter list: if input matches current selection or is empty, show all. Otherwise filter.
  const filteredVarieties =
    normInput.length === 0 || isInputMatchingSelected
      ? varieties
      : varieties.filter((v) => normalize(v.name).includes(normInput))

  const handleSelect = (v: RiceVariety) => {
    setInputValue(v.name)
    onChange({ varietyId: v.id })
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue("")
    onChange({ varietyId: null })
    inputRef.current?.focus()
  }

  const handleInputChange = (text: string) => {
    setInputValue(text)
    if (!isOpen) setIsOpen(true)

    const trimmed = text.trim()
    if (!trimmed) {
      onChange({ varietyId: null })
      return
    }

    // Check if what the user typed directly matches a catalog variety
    const match = varieties.find((v) => normalize(v.name) === normalize(trimmed))
    if (match) {
      onChange({ varietyId: match.id })
    } else {
      // It's a custom variety written by the user
      onChange({ varietyId: null })
    }
  }

  // Handle click outside to close dropdown & resolve final value
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        const trimmed = inputValue.trim()
        if (!trimmed) {
          setInputValue("")
          onChange({ varietyId: null })
        } else {
          const match = varieties.find((v) => normalize(v.name) === normalize(trimmed))
          if (match) {
            setInputValue(match.name)
            onChange({ varietyId: match.id })
          } else {
            // Keep the custom variety typed by user
            setInputValue(trimmed)
            onChange({ varietyId: null })
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [inputValue, varieties, onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmed = inputValue.trim()
      const exactMatch = varieties.find((v) => normalize(v.name) === normalize(trimmed))
      if (exactMatch) {
        handleSelect(exactMatch)
      } else if (filteredVarieties.length === 1 && normalize(filteredVarieties[0].name) === normInput) {
        handleSelect(filteredVarieties[0])
      } else {
        // Leave as custom variety and close dropdown
        setIsOpen(false)
        if (trimmed) {
          onChange({ varietyId: null })
        } else {
          onChange({ varietyId: null })
        }
      }
      inputRef.current?.blur()
    } else if (e.key === "Escape") {
      setIsOpen(false)
      if (selectedCatalogVariety) {
        setInputValue(selectedCatalogVariety.name)
      } else {
        setInputValue("")
      }
    } else if (e.key === "ArrowDown") {
      if (!isOpen) setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder="Selecciona o escribe una variedad..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-10 px-3 pr-14 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Limpiar variedad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!disabled) {
                setIsOpen((prev) => !prev)
                if (!isOpen) inputRef.current?.focus()
              }
            }}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            title="Desplegar opciones"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {filteredVarieties.length > 0 ? (
              filteredVarieties.map((v) => {
                const isSelected = v.id === varietyId
                return (
                  <button
                    key={v.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevent premature blur
                    onClick={() => handleSelect(v)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer",
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{v.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                {inputValue.trim()
                  ? `Se guardará "${inputValue.trim()}" en tu receta`
                  : "No hay variedades disponibles"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
