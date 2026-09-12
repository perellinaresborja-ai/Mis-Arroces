import Link from "next/link"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-card border border-border p-8 rounded-3xl text-center max-w-sm w-full shadow-sm">
        <ChefHat className="w-12 h-12 mx-auto text-primary mb-4 opacity-80" />
        <h1 className="text-2xl font-bold mb-2 font-serif text-foreground">Página no encontrada</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          El grano se nos ha perdido. El contenido que buscas no existe o ha sido retirado.
        </p>
        <Link href="/">
          <Button className="w-full rounded-2xl font-bold">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
