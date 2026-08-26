"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { updatePassword } from "./actions"

export function UpdatePasswordForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
      <form className="space-y-4 relative z-10" action={updatePassword}>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Nueva contraseña</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Introduce tu nueva contraseña a continuación.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5 relative">
            <label htmlFor="password" className="text-sm font-semibold text-charcoal block">
              Nueva contraseña
            </label>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                required 
                minLength={6}
                className="w-full h-12 pl-4 pr-12 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base font-medium tracking-wide" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-charcoal transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-charcoal block">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                required 
                minLength={6}
                className="w-full h-12 pl-4 pr-12 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base font-medium tracking-wide" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-charcoal transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            type="submit"
            className="w-full h-12 bg-charcoal hover:bg-black text-white rounded-xl font-bold text-base transition-colors shadow-md"
          >
            GUARDAR CONTRASEÑA
          </button>
        </div>
      </form>
    </div>
  )
}
