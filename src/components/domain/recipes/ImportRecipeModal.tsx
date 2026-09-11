"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, X, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { importRecipeFromUrlAction } from "@/app/actions/import-recipe"

export function ImportRecipeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string
    existingDraftId: string
  } | null>(null)

  if (!isOpen) return null

  const handleImport = async (forceNew: boolean = false) => {
    const trimmed = url.trim()
    if (!trimmed) {
      setErrorMessage("Por favor, introduce la URL de la receta.")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setDuplicateWarning(null)

    try {
      const result = await importRecipeFromUrlAction(trimmed, forceNew)
      if (result.success && result.recipeId) {
        onClose()
        router.push(`/recipes/${result.recipeId}/edit`)
      } else if (result.existingDraftId) {
        setDuplicateWarning({
          message: result.error || "Ya has importado esta receta anteriormente.",
          existingDraftId: result.existingDraftId,
        })
      } else {
        setErrorMessage(result.error || "No se ha podido importar la receta.")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con la web indicada.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenExisting = () => {
    if (duplicateWarning?.existingDraftId) {
      onClose()
      router.push(`/recipes/${duplicateWarning.existingDraftId}/edit`)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-3xl p-6 md:p-8 w-full max-w-md flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Trae tus arroces</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pega el enlace de una receta y prepararemos un borrador para que puedas revisarlo antes de publicarlo.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="import-url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            URL de la receta
          </label>
          <Input
            id="import-url"
            type="url"
            placeholder="https://ejemplo.com/receta-de-arroz..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (errorMessage) setErrorMessage(null)
              if (duplicateWarning) setDuplicateWarning(null)
            }}
            disabled={isLoading}
            className="h-12 bg-background border-border rounded-xl px-4 text-sm"
            autoFocus
          />
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Duplicate warning notification with action options */}
        {duplicateWarning && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm rounded-2xl space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{duplicateWarning.message}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleOpenExisting}
                className="rounded-xl font-bold text-xs h-9 flex-1"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Abrir borrador existente
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleImport(true)}
                disabled={isLoading}
                className="rounded-xl font-semibold text-xs h-9"
              >
                Importar de nuevo
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl font-bold h-12"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => handleImport(false)}
            disabled={isLoading || !url.trim()}
            className="flex-1 rounded-xl font-bold h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              "IMPORTAR RECETA"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
