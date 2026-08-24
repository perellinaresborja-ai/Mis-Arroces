import { completeProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

export default async function OnboardingPage({
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
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Completa tu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Crea tu identidad de chef arrocer@.
          </p>
        </div>

        {resolvedParams.error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center">
            {resolvedParams.error}
          </div>
        )}

        <form className="space-y-4 pt-2">
          <div className="space-y-2 text-left">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input 
              id="username" 
              name="username" 
              type="text" 
              placeholder="paellero_pro" 
              required 
              minLength={3}
              maxLength={30}
              pattern="^[a-z0-9_]{3,30}$"
              title="Solo minúsculas, números y guiones bajos (3-30 caracteres)"
              className="h-12" 
            />
            <p className="text-xs text-muted-foreground">
              Solo minúsculas, números y _
            </p>
          </div>
          
          <div className="space-y-2 text-left">
            <Label htmlFor="display_name">Nombre para mostrar</Label>
            <Input 
              id="display_name" 
              name="display_name" 
              type="text" 
              placeholder="Juan Pérez" 
              required 
              className="h-12" 
            />
          </div>
          
          <div className="pt-4">
            <Button formAction={completeProfile} className="w-full h-12 text-base">
              Terminar y entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
