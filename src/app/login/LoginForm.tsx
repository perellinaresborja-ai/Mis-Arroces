"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { login, signup } from "./actions"

export function LoginForm({ error, message }: { error?: string, message?: string }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
      <form className="space-y-4 relative z-10">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-500/10 rounded-lg text-center font-medium">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-charcoal block">
              Correo electrónico
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" autoComplete="email" 
              placeholder="tu@email.com"
              required 
              className="w-full h-12 px-4 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base" 
            />
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-charcoal block">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} autoComplete="current-password" 
                placeholder="••••••••"
                required 
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
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" name="remember" className="peer appearance-none w-5 h-5 border-2 border-border/80 rounded checked:bg-primary checked:border-primary transition-colors cursor-pointer" defaultChecked />
              <svg className="absolute w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-charcoal transition-colors">Recuérdame</span>
          </label>

          <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline underline-offset-4">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

          <div className="pt-2">
            <button 
              formAction={login}
              className="w-full h-12 bg-charcoal hover:bg-black text-white rounded-xl font-bold text-base transition-colors shadow-md"
            >
              VAMOS AL GRANO
            </button>
          </div>

        <div className="relative py-2 flex items-center">
          <div className="flex-grow border-t border-border/80"></div>
          <span className="shrink-0 px-4 text-sm text-muted-foreground bg-sand">o</span>
          <div className="flex-grow border-t border-border/80"></div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            formAction={signup}
            className="w-full h-12 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl font-bold text-base transition-colors"
          >
            CREAR CUENTA NUEVA
          </button>
        </div>
      </form>
    </div>
  )
}
