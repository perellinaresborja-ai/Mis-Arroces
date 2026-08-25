"use client"

import Link from "next/link"
import { requestPasswordReset } from "./actions"

export function ForgotPasswordForm({ error, message }: { error?: string, message?: string }) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center">
      <form className="space-y-4 relative z-10" action={requestPasswordReset}>
        
        {message ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <p className="text-sm font-semibold text-charcoal">{message}</p>
            <div className="mt-6">
              <Link href="/login" className="text-sm font-bold text-primary hover:underline underline-offset-4">
                Volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">Recuperar contraseña</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Te enviaremos un enlace mágico para que puedas crear una nueva.
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
                {error}
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
                  type="email" 
                  placeholder="tu@email.com"
                  required 
                  className="w-full h-12 px-4 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-xl outline-none transition-colors text-charcoal text-base" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                type="submit"
                className="w-full h-12 bg-charcoal hover:bg-black text-white rounded-xl font-bold text-base transition-colors shadow-md"
              >
                ENVIAR ENLACE
              </button>
            </div>

            <div className="text-center pt-4">
              <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-charcoal hover:underline underline-offset-4">
                Volver atrás
              </Link>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
