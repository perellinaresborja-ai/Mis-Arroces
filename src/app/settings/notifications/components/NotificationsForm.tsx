'use client';

import { useState } from "react"
import { updateNotificationPreferences } from "@/app/actions/settings"
import { toast } from "react-hot-toast"

export default function NotificationsForm({ initialPrefs }: { initialPrefs: any }) {
  const [prefs, setPrefs] = useState({
    follows: initialPrefs?.follows ?? true,
    likes: initialPrefs?.likes ?? true,
    comments: initialPrefs?.comments ?? true,
    mentions: initialPrefs?.mentions ?? true,
    messages: initialPrefs?.messages ?? true,
    system: initialPrefs?.system ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = async (key: string, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    
    setSaving(true)
    const formData = new FormData()
    Object.entries(newPrefs).forEach(([k, v]) => formData.append(k, v.toString()))
    
    const res = await updateNotificationPreferences(formData)
    if (res?.error) {
      alert(res.error)
      setPrefs(prefs) // revert
    }
    setSaving(false)
  }

  const items = [
    { key: 'follows', label: 'Nuevos seguidores', description: 'Cuando alguien empiece a seguirte' },
    { key: 'likes', label: 'Me gusta', description: 'Cuando a alguien le guste tu publicación o receta' },
    { key: 'comments', label: 'Comentarios', description: 'Cuando alguien comente en tus publicaciones' },
    { key: 'mentions', label: 'Menciones', description: 'Cuando alguien te mencione en un comentario o publicación' },
    { key: 'messages', label: 'Mensajes directos', description: 'Cuando recibas un nuevo mensaje privado' },
    { key: 'system', label: 'Alertas del sistema', description: 'Novedades de Mis Arroces y actualizaciones de cuenta' },
  ]

  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={item.key} className={"flex items-center justify-between "}>
          <div className="pr-4">
            <h3 className="font-medium">{item.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={prefs[item.key as keyof typeof prefs]}
              disabled={saving}
              onChange={(e) => handleChange(item.key, e.target.checked)}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      ))}
    </div>
  )
}

