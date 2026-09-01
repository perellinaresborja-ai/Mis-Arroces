'use client';

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteUserAccount } from "@/app/actions/settings"
import { toast } from "react-hot-toast"

export default function DeleteAccountRow({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'ELIMINAR') return;
    
    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      const res = await deleteUserAccount(formData)
      if (res?.error) {
        alert(res.error)
        setIsDeleting(false)
      } else {
        // Redirection happens in server action
      }
    } catch (err: any) {
      alert('Error eliminando la cuenta')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition text-red-500"
      >
        <div className="flex items-center gap-3">
          <Trash2 className="w-5 h-5" /> 
          <span className="font-medium">Eliminar cuenta</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-red-500">Eliminar cuenta</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Esta acción es <strong>irreversible</strong>. Se eliminará tu perfil, publicaciones sociales, comentarios, likes, seguidores, y todos tus datos personales. Tus recetas compartidas se mantendrán de forma anónima para no romper el recetario comunitario, pero perderás acceso a ellas.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Escribe ELIMINAR para continuar</label>
              <input 
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="ELIMINAR"
              />
            </div>

            <div className="flex gap-3">
              <button 
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-muted hover:bg-muted/80 transition"
              >
                Cancelar
              </button>
              <button 
                disabled={isDeleting || confirmText !== 'ELIMINAR'}
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

