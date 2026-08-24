import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Compass } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 pb-24">
      <div className="w-full max-w-sm space-y-8 bg-card p-6 rounded-2xl shadow-sm border border-border">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bienvenido a Mis Arroces</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión o crea tu cuenta para guardar tus recetas.
          </p>
        </div>

        {resolvedParams.error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center">
            {resolvedParams.error}
          </div>
        )}

        <form className="space-y-4 pt-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="h-12" />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required className="h-12" />
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button formAction={login} className="w-full h-12 text-base">
              Iniciar Sesión
            </Button>
            <Button formAction={signup} variant="outline" className="w-full h-12 text-base">
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
