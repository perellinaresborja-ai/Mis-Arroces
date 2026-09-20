"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

export default function DownloadDataRow() {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/download-data', { method: 'POST' })
      if (!res.ok) throw new Error("Fallo en la descarga")
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `misarroces_datos_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      alert("Hubo un error al descargar tus datos. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition text-left">
      <div className="flex items-center gap-3">
        {loading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Download className="w-5 h-5 text-muted-foreground" />}
        <span className="font-medium text-foreground">Descargar mis datos</span>
      </div>
    </button>
  )
}
