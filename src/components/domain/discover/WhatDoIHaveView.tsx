"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, X, Check, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { MediaImage } from "@/components/domain/MediaImage"
import { searchIngredientsAction, findRecipesByIngredientsAction } from "@/app/actions/recipes"
import type { MatchedRecipeResult } from "@/lib/matching"

interface IngredientItem {
  id: string
  canonical_name: string
  normalized_name: string
}

export function WhatDoIHaveView({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<IngredientItem[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientItem[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSearchingRecipes, setIsSearchingRecipes] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<MatchedRecipeResult[]>([])
  const [onlyExact, setOnlyExact] = useState(false)

  // Debounced ingredient search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsLoadingSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    const handler = setTimeout(async () => {
      try {
        const found = await searchIngredientsAction(searchQuery)
        // Filter out already selected ingredients
        const selectedIds = new Set(selectedIngredients.map(i => i.id))
        setSuggestions(found.filter((item: IngredientItem) => !selectedIds.has(item.id)))
      } catch (err) {
        console.error("Error searching ingredients:", err)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 250)

    return () => clearTimeout(handler)
  }, [searchQuery, selectedIngredients])

  const handleAddIngredient = (ingredient: IngredientItem) => {
    if (!selectedIngredients.some(i => i.id === ingredient.id)) {
      setSelectedIngredients(prev => [...prev, ingredient])
    }
    setSearchQuery("")
    setSuggestions([])
  }

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.id !== id))
  }

  const handleSearchRecipes = async (forceOnlyExact?: boolean) => {
    if (selectedIngredients.length === 0) return
    const exactMode = forceOnlyExact !== undefined ? forceOnlyExact : onlyExact
    setIsSearchingRecipes(true)
    setHasSearched(true)
    try {
      const ids = selectedIngredients.map(i => i.id)
      const data = await findRecipesByIngredientsAction(ids, exactMode)
      setResults(data as MatchedRecipeResult[])
    } catch (err) {
      console.error("Error matching recipes:", err)
      setResults([])
    } finally {
      setIsSearchingRecipes(false)
    }
  }

  const handleToggleExact = (val: boolean) => {
    setOnlyExact(val)
    if (hasSearched && selectedIngredients.length > 0) {
      handleSearchRecipes(val)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top bar with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver a Descubrir"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>¿Qué tengo?</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Dinos qué tienes y te mostramos qué arroces puedes preparar.
          </p>
        </div>
      </div>

      {/* Ingredient Autocomplete Input & Selected Chips */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe un ingrediente (ej. Pollo, Calamar, Garrofó...)"
            className="w-full pl-11 pr-10 h-12 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {isLoadingSuggestions ? (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
              {suggestions.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => handleAddIngredient(ing)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/80 flex items-center justify-between text-foreground transition-colors"
                >
                  <span className="font-medium">{ing.canonical_name}</span>
                  <span className="text-xs text-primary font-semibold">+ Añadir</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Ingredients Chips */}
        {selectedIngredients.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ingredientes seleccionados ({selectedIngredients.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedIngredients([])
                  setResults([])
                  setHasSearched(false)
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Borrar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ing) => (
                <span
                  key={ing.id}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium animate-in zoom-in-95 duration-150"
                >
                  <span>{ing.canonical_name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Eliminar ${ing.canonical_name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter toggle & Search Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyExact}
              onChange={(e) => handleToggleExact(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background"
            />
            <span className="text-sm font-medium text-foreground">Solo con lo que tengo</span>
          </label>

          <button
            type="button"
            onClick={() => handleSearchRecipes()}
            disabled={selectedIngredients.length === 0 || isSearchingRecipes}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isSearchingRecipes ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando recetas...
              </>
            ) : (
              "BUSCAR RECETAS"
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {isSearchingRecipes ? (
        <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Buscando arroces compatibles...</p>
        </div>
      ) : hasSearched ? (
        results.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Arroces que puedes preparar ({results.length})
              </h2>
              {onlyExact && (
                <span className="text-xs text-primary font-medium">
                  Filtro activo: 100% completo
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((r) => {
                const coverUrl = r.cover_image
                  ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${r.cover_image}`
                  : null

                const hasAll = r.missing_count === 0

                return (
                  <Link
                    key={r.id}
                    href={`/recipes/${r.id}`}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-sm"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <MediaImage
                        src={coverUrl}
                        alt={r.name}
                        variant="feed"
                        fallbackType="recipe"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      
                      {/* Compatibility Badge on image */}
                      <div className="absolute top-2.5 left-2.5">
                        {hasAll ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Tienes todo
                          </span>
                        ) : (
                          <span className="bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                            Te falta{r.missing_count === 1 ? " 1 ingrediente" : ` ${r.missing_count} ingredientes`}
                          </span>
                        )}
                      </div>

                      {/* Style badge */}
                      {r.style_name && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="text-[10px] bg-background/85 backdrop-blur-md px-2 py-0.5 rounded-full font-semibold">
                            {r.style_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content info */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {r.name}
                        </h3>
                        {r.author && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            por {r.author.display_name || r.author.username}
                          </p>
                        )}
                      </div>

                      {/* Missing ingredients list if any */}
                      {!hasAll && r.missing_ingredients.length > 0 && (
                        <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Te faltan: </span>
                          <span className="text-muted-foreground">
                            {r.missing_ingredients.slice(0, 3).join(" · ")}
                            {r.missing_ingredients.length > 3 ? ` (+${r.missing_ingredients.length - 3})` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-card border border-border rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              🍳
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-bold text-lg">
                {onlyExact
                  ? "No hay recetas completas con lo que tienes"
                  : "No hemos encontrado arroces compatibles"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {onlyExact
                  ? "Prueba a desactivar el filtro de coincidencia exacta para ver recetas a las que les falta pocos ingredientes."
                  : "Prueba a añadir más ingredientes para encontrar recetas que puedas cocinar."}
              </p>
            </div>
            {onlyExact && (
              <button
                type="button"
                onClick={() => handleToggleExact(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Desactivar "Solo con lo que tengo"
              </button>
            )}
          </div>
        )
      ) : null}
    </div>
  )
}
