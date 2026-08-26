"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"

export function LoHeCocinadoButton({ recipeId, isAuthenticated }: { recipeId: string, isAuthenticated: boolean }) {
  const { showAuthPrompt } = useAuthPrompt()

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => showAuthPrompt("Únete a Mis Arroces para compartir cómo te ha quedado.")}
        className="w-full md:w-auto font-bold rounded-xl h-12 px-8 bg-olive hover:bg-olive/90 text-white"
      >
        ¡Lo he cocinado!
      </Button>
    )
  }

  return (
    <Link href={`/recipes/${recipeId}/cook`} className="shrink-0 w-full md:w-auto">
      <Button className="w-full md:w-auto font-bold rounded-xl h-12 px-8 bg-olive hover:bg-olive/90 text-white">
        ¡Lo he cocinado!
      </Button>
    </Link>
  )
}
