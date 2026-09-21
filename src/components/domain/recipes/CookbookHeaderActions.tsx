"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookbookHeaderActions() {
  return (
    <div className="flex items-center gap-2.5 w-full md:w-auto">
      <Link href="/create/recipe" className="flex-1 md:flex-initial">
        <Button className="h-10 px-5 w-full md:w-auto font-bold rounded-full">
          <Plus className="w-5 h-5 mr-1" /> Nueva receta
        </Button>
      </Link>
    </div>
  )
}
