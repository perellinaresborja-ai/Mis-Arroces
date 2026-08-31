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
  icon: React.ElementType, 
  placeholder: string, 
  onSelect: (item: { id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }) => void,
  fetchResults: (q: string) => Promise<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>([])
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
    <div className="flex flex-col w-full h-full bg-card rounded-t-2xl p-4 animate-in slide-in-from-bottom">
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
        {loading && <p className="text-center text-sm text-muted-foreground mt-4">Buscando...</p>}
        {!loading && results.length === 0 && query.trim().length < 2 && <p className="text-center text-sm text-muted-foreground mt-4">Escribe para buscar...</p>}
        {!loading && results.length === 0 && query.trim().length >= 2 && <p className="text-center text-sm text-muted-foreground mt-4">No se encontraron resultados.</p>}
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
export function MentionPicker({ onSelect }: { onSelect: (u: { id: string, title: string, subtitle?: string, avatarUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Mención" icon={UserIcon} placeholder="Buscar usuario..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data, error } = await supabase.from('profiles').select('id, username, display_name').ilike('username', `%${q}%`).limit(10)
      if (error) console.error("MentionPicker error:", error)
      return (data || []).map(u => ({
        id: u.id,
        title: u.username,
        subtitle: u.display_name || undefined,
        avatarUrl: undefined
      }))
    }}
  />
}

export function RecipePicker({ onSelect }: { onSelect: (r: { id: string, title: string, subtitle?: string, iconUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Receta" icon={ChefHat} placeholder="Buscar receta..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data, error } = await supabase.from('recipes').select('id, name, profiles(username)').ilike('name', `%${q}%`).limit(10)
      if (error) console.error("RecipePicker error:", error)
      return (data || []).map(r => ({
        id: r.id,
        title: r.name,
        subtitle: ((r.profiles as unknown) as { username?: string })?.username ? `por @${((r.profiles as unknown) as { username?: string }).username}` : '',
        iconUrl: undefined
      }))
    }}
  />
}

export function IngredientPicker({ onSelect }: { onSelect: (i: { id: string, title: string }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Ingrediente" icon={Apple} placeholder="Buscar ingrediente..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data, error } = await supabase.from('ingredients').select('id, canonical_name').ilike('canonical_name', `%${q}%`).limit(15)
      if (error) console.error("IngredientPicker error:", error)
      return (data || []).map(i => ({
        id: i.id,
        title: i.canonical_name
      }))
    }}
  />
}


export function SessionPicker({ onSelect }: { onSelect: (s: { id: string, title: string, subtitle?: string, iconUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Sesión" icon={ChefHat} placeholder="Buscar sesión..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data, error } = await supabase.from('cooking_sessions').select('id, recipe_id').limit(10)
      if (error) console.error("SessionPicker error:", error)
      return (data || []).map((s: { id: string, recipe_id: string }) => ({
        id: s.id,
        title: "Sesión " + s.id.substring(0, 5),
        subtitle: "Receta: " + s.recipe_id.substring(0, 5)
      }))
    }}
  />
}

export function ProfilePicker({ onSelect }: { onSelect: (u: { id: string, title: string, subtitle?: string, avatarUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Perfil" icon={UserIcon} placeholder="Buscar perfil..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data, error } = await supabase.from('profiles').select('id, username, display_name').ilike('username', `%${q}%`).limit(10)
      if (error) console.error("ProfilePicker error:", error)
      return (data || []).map((u: { id: string, username: string, display_name: string | null }) => ({
        id: u.id,
        title: u.username,
        subtitle: u.display_name || '',
      }))
    }}
  />
}

export function LocationPicker({ onSelect }: { onSelect: (loc: { id: string, title: string, subtitle?: string }) => void }) {
  return <GenericSearchPicker 
    title="Ubicación" icon={MapPin} placeholder="Buscar ciudad o lugar..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`, {
          headers: { 'Accept-Language': 'es' }
        });
        const data = await res.json();
        return (data || []).map((place: any) => ({
          id: place.place_id.toString(),
          title: place.name || place.display_name.split(',')[0],
          subtitle: place.display_name
        }));
      } catch (e) {
        console.error("OSM error:", e);
        return [];
      }
    }}
  />
}
