"use client"

import React, { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Plus, Loader2, X } from "lucide-react"
import { getOrCreateRiceVariety } from "@/app/actions/recipes"
import { cn } from "@/lib/utils"

interface RiceVariety {
  id: string
  name: string
}

interface RiceVarietySelectProps {
  value?: string
  onChange: (value: string) => void
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
  value,
  onChange,
  initialVarieties = [],
  disabled = false,
}: RiceVarietySelectProps) {
  const [varieties, setVarieties] = useState<RiceVariety[]>(initialVarieties)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
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

  // Find currently selected variety
  const selectedVariety = varieties.find((v) => v.id === value)

  // Sync display text when value or selectedVariety changes while dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedVariety ? selectedVariety.name : "")
    }
  }, [value, selectedVariety, isOpen])

  const normSearch = normalize(searchTerm)
  const isInputMatchingSelected = selectedVariety && normalize(selectedVariety.name) === normSearch

  // Filter list: if search matches current selection or is empty, show all. Otherwise filter.
  const filteredVarieties =
    normSearch.length === 0 || isInputMatchingSelected
      ? varieties
      : varieties.filter((v) => normalize(v.name).includes(normSearch))

  const exactMatch = varieties.find((v) => normalize(v.name) === normSearch)

  const handleSelect = (v: RiceVariety) => {
    onChange(v.id)
    setSearchTerm(v.name)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
    inputRef.current?.focus()
  }

  const handleCreateNew = async (nameToCreate?: string) => {
    const rawName = nameToCreate !== undefined ? nameToCreate : searchTerm
    const trimmed = rawName.trim()
    if (!trimmed || isCreating) return

    // If an exact match already exists in list, just select it
    const existing = varieties.find((v) => normalize(v.name) === normalize(trimmed))
    if (existing) {
      handleSelect(existing)
      return
    }

    try {
      setIsCreating(true)
      const newVar = await getOrCreateRiceVariety(trimmed)
      if (newVar) {
        setVarieties((prev) => {
          if (!prev.some((v) => v.id === newVar.id)) {
            return [...prev, newVar].sort((a, b) => a.name.localeCompare(b.name, "es"))
          }
          return prev
        })
        onChange(newVar.id)
        setSearchTerm(newVar.name)
        setIsOpen(false)
      }
    } catch (err) {
      console.error("Error creating rice variety:", err)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle click outside to close dropdown & resolve unsubmitted typed value
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        const trimmed = searchTerm.trim()
        if (!trimmed) {
          onChange("")
          setSearchTerm("")
        } else {
          const match = varieties.find((v) => normalize(v.name) === normalize(trimmed))
          if (match) {
            onChange(match.id)
            setSearchTerm(match.name)
          } else if (selectedVariety && normalize(selectedVariety.name) === normalize(trimmed)) {
            setSearchTerm(selectedVariety.name)
          } else if (trimmed.length >= 2) {
            // Auto-create newly typed variety on click outside
            handleCreateNew(trimmed)
          } else {
            setSearchTerm(selectedVariety ? selectedVariety.name : "")
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [searchTerm, selectedVariety, varieties])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (exactMatch) {
        handleSelect(exactMatch)
      } else if (filteredVarieties.length === 1 && !exactMatch && normalize(filteredVarieties[0].name) === normSearch) {
        handleSelect(filteredVarieties[0])
      } else if (searchTerm.trim().length > 0) {
        await handleCreateNew()
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setSearchTerm(selectedVariety ? selectedVariety.name : "")
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
          disabled={disabled || isCreating}
          placeholder="Selecciona o escribe una variedad..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-10 px-3 pr-20 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <>
              {searchTerm.trim().length > 0 && !exactMatch && (
                <button
                  type="button"
                  onClick={() => handleCreateNew()}
                  className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  title="Añadir variedad"
                >
                  Añadir
                </button>
              )}
              {searchTerm && !disabled && exactMatch && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Limpiar selección"
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
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Option to create new variety when typed text doesn't exist */}
          {searchTerm.trim().length > 0 && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()} // Prevent premature blur
              onClick={() => handleCreateNew()}
              disabled={isCreating}
              className="w-full mb-1 px-3 py-2 text-left text-sm font-medium rounded-xl text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Plus className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">
                Añadir &quot;<strong className="text-primary font-bold">{searchTerm.trim()}</strong>&quot; como nueva variedad
              </span>
            </button>
          )}

          {/* List of existing/filtered varieties */}
          <div className="space-y-0.5">
            {filteredVarieties.length > 0 ? (
              filteredVarieties.map((v) => {
                const isSelected = v.id === value
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
            ) : !searchTerm.trim() ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No hay variedades disponibles
              </div>
            ) : null}

            {filteredVarieties.length === 0 && searchTerm.trim() && exactMatch && (
              <div className="px-3 py-2 text-center text-xs text-muted-foreground">
                Variedad ya seleccionada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
