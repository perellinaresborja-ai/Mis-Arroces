"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePostContent } from "@/app/actions/post_options"

export function EditPostClient({ post }: { post: any }) {
  const [content, setContent] = useState(post.content || "")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updatePostContent(post.id, content)
      router.push("/")
    } catch (err) {
      alert("Error al actualizar la publicación")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border p-6 rounded-2xl">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Contenido</label>
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full bg-background border border-border rounded-xl p-3 min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          required
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
