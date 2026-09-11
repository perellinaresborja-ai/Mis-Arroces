"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportRecipeModal } from "@/components/domain/recipes/ImportRecipeModal"

export function CookbookHeaderActions() {
  const [showImportModal, setShowImportModal] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <Button
          variant="outline"
          onClick={() => setShowImportModal(true)}
          className="h-10 px-4 rounded-full font-medium text-xs sm:text-sm border-border hover:bg-muted/80 flex items-center gap-1.5"
          title="Importar una receta desde un enlace web"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span>Traer de la web</span>
        </Button>

        <Link href="/create/recipe" className="flex-1 md:flex-initial">
          <Button className="h-10 px-5 w-full md:w-auto font-bold rounded-full">
            <Plus className="w-5 h-5 mr-1" /> Nueva receta
          </Button>
        </Link>
      </div>

      <ImportRecipeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </>
  )
}
