"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type AuthPromptContextType = {
  showAuthPrompt: (message: string) => void
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined)

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext)
  if (!context) {
    throw new Error("useAuthPrompt must be used within an AuthPromptProvider")
  }
  return context
}

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const showAuthPrompt = (msg: string) => {
    setMessage(msg)
    setIsOpen(true)
  }

  const handleAction = (path: string) => {
    // Save current path to cookie so we can return here
    document.cookie = `misarroces_return_to=${window.location.pathname}; path=/; max-age=3600`
    window.location.href = path
  }

  return (
    <AuthPromptContext.Provider value={{ showAuthPrompt }}>
      {children}
      
      {isOpen && typeof window !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="relative w-32 h-8">
                <Image src="/mpng.png" alt="Mis Arroces" fill className="object-contain object-left" />
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold font-serif mb-2 text-foreground">Únete a la comunidad</h2>
              <p className="text-muted-foreground text-sm font-medium">
                {message}
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={() => handleAction("/login")} className="w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white" size="lg">
                Crear cuenta
              </Button>
              <Button onClick={() => handleAction("/login")} variant="outline" className="w-full font-bold rounded-xl" size="lg">
                Iniciar sesión
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AuthPromptContext.Provider>
  )
}
