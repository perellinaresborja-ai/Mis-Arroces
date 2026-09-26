'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[misarroces error boundary]:', error)
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message || 'Unknown application error',
          stack: error.stack || null,
          digest: error.digest || null,
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      }).catch(() => {})
    } catch {
      // Ignorar fallo de reporte de error
    }
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Algo no ha salido como esperábamos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Se ha producido una incidencia inesperada. El equipo técnico ha sido notificado automáticamente para resolverlo.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
