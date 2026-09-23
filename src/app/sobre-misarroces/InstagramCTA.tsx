"use client"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { Button } from "@/components/ui/button"

export function InstagramCTA() {
  const { user } = useUserSession()

  const handleAction = () => {
    if (user) {
      window.location.href = "/create/recipe#import"
    } else {
      document.cookie = `misarroces_return_to=/create/recipe#import; path=/; max-age=3600`
      window.location.href = "/login"
    }
  }

  return (
    <div className="pt-3">
      <Button 
        onClick={handleAction}
        className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 h-auto shadow-sm w-full md:w-auto"
      >
        Traer mi receta de Instagram
      </Button>
    </div>
  )
}
