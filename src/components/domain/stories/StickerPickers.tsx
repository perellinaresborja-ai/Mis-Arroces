"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, ChefHat, User as UserIcon, Apple } from 'lucide-react'

// Common Search Picker
export function GenericSearchPicker({ 
  title, 
  icon: Icon, 
  placeholder, 
  onSelect,
  fetchResults
}: { 
  title: string, 
  icon: any, 
  placeholder: string, 
  onSelect: (item: any) => void,
  fetchResults: (q: string) => Promise<any[]>
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setLoading(true)
        fetchResults(query).then(res => {
          setResults(res)
          setLoading(false)
        })
      } else {
        setResults([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="flex flex-col w-full h-full bg-background rounded-t-2xl p-4 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          autoFocus
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder={placeholder} 
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-safe">
        {loading && <p className="text-center text-sm text-muted-foreground">Buscando...</p>}
        {!loading && results.length === 0 && query.length >= 2 && <p className="text-center text-sm text-muted-foreground">No se encontraron resultados.</p>}
        {!loading && results.map(item => (
          <button 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left transition-colors"
          >
            {item.avatarUrl ? (
              <img src={item.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-border" />
            ) : item.iconUrl ? (
              <img src={item.iconUrl} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="font-semibold text-sm truncate">{item.title}</span>
              {item.subtitle && <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Specialized Pickers that just inject fetchLogic
export function MentionPicker({ onSelect }: { onSelect: (u: any) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Mención" icon={UserIcon} placeholder="Buscar usuario..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data } = await supabase.from('profiles').select('id, username, display_name, media:media_assets!fk_profiles_avatar(storage_path)').ilike('username', `%${q}%`).limit(10)
      return (data || []).map(u => ({
        id: u.id,
        title: u.username,
        subtitle: u.display_name,
        avatarUrl: (u.media as any)?.storage_path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${(u.media as any).storage_path}` : null
      }))
    }}
  />
}

export function RecipePicker({ onSelect }: { onSelect: (r: any) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Receta" icon={ChefHat} placeholder="Buscar receta..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data } = await supabase.from('recipes').select('id, name, profiles(username), recipe_media(media:media_assets(storage_path))').ilike('name', `%${q}%`).limit(10)
      return (data || []).map(r => ({
        id: r.id,
        title: r.name,
        subtitle: (r.profiles as any)?.username ? `por @${(r.profiles as any).username}` : '',
        iconUrl: ((r.recipe_media?.[0] as any)?.media as any)?.storage_path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${((r.recipe_media?.[0] as any)?.media as any)?.storage_path}` : null
      }))
    }}
  />
}

export function IngredientPicker({ onSelect }: { onSelect: (i: any) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Ingrediente" icon={Apple} placeholder="Buscar ingrediente..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data } = await supabase.from('ingredients').select('id, canonical_name').ilike('canonical_name', `%${q}%`).limit(15)
      return (data || []).map(i => ({
        id: i.id,
        title: i.canonical_name
      }))
    }}
  />
}

export function LocationPicker({ onSelect }: { onSelect: (loc: any) => void }) {
  // Mock manual location since Places API is blocked
  const [loc, setLoc] = useState('')
  return (
    <div className="flex flex-col w-full h-full bg-background rounded-t-2xl p-4 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Ubicación Manual</h3>
      </div>
      <div className="flex gap-2">
        <input 
          autoFocus
          type="text" 
          value={loc} 
          onChange={e => setLoc(e.target.value)} 
          placeholder="Escribe el lugar..." 
          className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none"
        />
        <button onClick={() => { if(loc.trim()) onSelect({ id: loc, title: loc }) }} className="px-4 bg-primary text-primary-foreground rounded-xl font-bold">Añadir</button>
      </div>
    </div>
  )
}
