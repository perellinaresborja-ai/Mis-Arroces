"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateSessionContent } from "@/app/actions/post_options"
import { Flame, Star } from "lucide-react"

export function EditSessionClient({ session }: { session: any }) {
  const [notes, setNotes] = useState(session.notes || "")
  const [rating, setRating] = useState(session.rating || 0)
  const [socarrat, setSocarrat] = useState(session.socarrat_level || 0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateSessionContent(session.id, notes, rating, socarrat)
      router.push("/")
    } catch (err) {
      alert("Error al actualizar el cocinado")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-2xl">
      
      <div className="space-y-3">
        <label className="text-sm font-semibold">Valoración General (0-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              className="p-2 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${val <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold">Nivel de Socarrat (0-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setSocarrat(val)}
              className="p-2 transition-transform hover:scale-110 focus:outline-none"
            >
              <Flame
                className={`w-8 h-8 ${val <= socarrat ? "fill-orange-500 text-orange-500" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Notas del cocinado</label>
        <textarea 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-background border border-border rounded-xl p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-semibold hover:bg-muted rounded-full transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
