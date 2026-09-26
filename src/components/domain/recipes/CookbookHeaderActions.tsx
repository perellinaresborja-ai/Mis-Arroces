"use client"

import Link from "next/link"
import { Plus, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookbookHeaderActions() {
  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <Link href="/calculadora-capa" className="flex-1 md:flex-initial">
        <Button 
          variant="outline" 
          className="h-10 px-4 w-full md:w-auto font-semibold rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm text-xs sm:text-sm"
          title="Calculadora de capa"
        >
          <Calculator className="w-4 h-4 mr-1.5 text-muted-foreground" /> Calculadora de capa
        </Button>
      </Link>
      <Link href="/create/recipe" className="flex-1 md:flex-initial">
        <Button className="h-10 px-5 w-full md:w-auto font-bold rounded-full text-xs sm:text-sm shadow-sm">
          <Plus className="w-4 h-4 mr-1" /> Nueva receta
        </Button>
      </Link>
    </div>
  )
}
