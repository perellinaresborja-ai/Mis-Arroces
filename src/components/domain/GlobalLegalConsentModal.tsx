"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { acceptActiveLegalDocuments } from "@/app/actions/legal"
import Link from "next/link"

export function GlobalLegalConsentModal() {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!accepted) return
    setLoading(true)
    try {
      await acceptActiveLegalDocuments()
      setDone(true) // will unmount because layout will revalidate and remove the component
    } catch (err) {
      console.error(err)
      alert("Error al guardar la aceptación.")
      setLoading(false)
    }
  }

  if (done) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">Actualización Legal</h2>
        <p className="text-muted-foreground mb-6">
          Para crear una cuenta en MisArroces, o continuar utilizando tu cuenta existente, debes aceptar nuestras Condiciones de uso y confirmar que has leído nuestra Política de privacidad.
        </p>

        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input 
                type="checkbox"
                className="peer sr-only"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <div className="w-5 h-5 rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-sm font-medium leading-relaxed select-none text-foreground group-hover:text-foreground/80">
              He leído y acepto las <Link href="/legal/terms" target="_blank" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>Condiciones de uso</Link> y confirmo que he leído la <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>Política de privacidad</Link>.
            </span>
          </label>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!accepted || loading} 
          className="w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white" 
          size="lg"
        >
          {loading ? "Guardando..." : "ACEPTAR Y CONTINUAR"}
        </Button>
      </div>
    </div>
  )
}
