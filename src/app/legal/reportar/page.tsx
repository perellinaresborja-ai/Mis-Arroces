"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"

export default function DSAReportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/legal/report-dsa', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || "Ocurrió un error al enviar el informe. Inténtalo de nuevo.")
      }
    } catch (err) {
      setError("Error de red. Por favor, comprueba tu conexión.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-8 pt-24 min-h-screen text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Informe Recibido</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Hemos recibido tu notificación. Nuestro equipo de moderación la revisará a la mayor brevedad y tomará las medidas oportunas de acuerdo a la legislación vigente. Si has proporcionado un correo electrónico, nos pondremos en contacto contigo si necesitamos más información o para informarte de la resolución.
        </p>
        <Link href="/" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Volver a MisArroces
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <div className="flex items-center gap-3 mb-4">
        <ShieldAlert className="w-8 h-8 text-destructive" />
        <h1 className="text-4xl font-black tracking-tight text-foreground">Reportar contenido ilícito</h1>
      </div>
      
      <p className="text-muted-foreground mb-8 text-lg">
        Utiliza este formulario exclusivamente para notificar contenido que consideres ilegal de acuerdo a la normativa vigente (Ley de Servicios Digitales - DSA). Si se trata de un comportamiento molesto que incumple nuestras normas pero no es un delito, por favor utiliza la opción "Reportar" integrada dentro de la propia aplicación.
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-2xl">
        
        <div>
          <label htmlFor="url" className="block text-sm font-bold text-foreground mb-2">
            URL o identificador exacto del contenido *
          </label>
          <input 
            type="url" 
            name="url" 
            id="url"
            required 
            placeholder="https://www.misarroces.es/post/..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Proporciona la dirección exacta para que podamos localizar el contenido sin ambigüedad.
          </p>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-bold text-foreground mb-2">
            Motivo de la presunta ilicitud *
          </label>
          <textarea 
            name="reason" 
            id="reason"
            required 
            rows={4}
            placeholder="Explica detalladamente por qué consideras que el contenido es ilegal..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          ></textarea>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
            Tu correo electrónico (opcional)
          </label>
          <input 
            type="email" 
            name="email" 
            id="email"
            placeholder="tu@email.com"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Solo lo usaremos para comunicarnos contigo sobre este reporte.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-xl flex gap-3 items-start border border-border">
          <input 
            type="checkbox" 
            name="goodFaith" 
            id="goodFaith"
            required 
            className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary shrink-0"
          />
          <label htmlFor="goodFaith" className="text-sm text-foreground">
            <strong>Declaración de buena fe:</strong> Confirmo que creo de buena fe que la información y las alegaciones que presento en esta notificación son precisas y completas. *
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 bg-destructive text-destructive-foreground font-bold rounded-xl hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando notificación..." : "Enviar notificación legal"}
        </button>

      </form>
    </div>
  )
}
