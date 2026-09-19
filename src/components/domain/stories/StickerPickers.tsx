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
  fetchResults,
  allowCustom = false
}: { 
  title: string, 
  icon: React.ElementType, 
  placeholder: string, 
  onSelect: (item: { id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }) => void,
  fetchResults: (q: string) => Promise<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>,
  allowCustom?: boolean
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>([])
  const [loading, setLoading] = useState(false)

  // Fetch initial results or search results
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchResults(query.trim()).then(res => {
        if (!isCancelled) {
          setResults(res || []);
          setLoading(false);
        }
      }).catch(err => {
        if (!isCancelled) {
          console.error("Picker search error:", err);
          setLoading(false);
        }
      });
    }, query.trim().length === 0 ? 0 : 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onSelect({
      id: 'custom_' + Date.now(),
      title: query.trim()
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-card p-3 animate-in slide-in-from-bottom duration-200">
      <form onSubmit={handleCustomSubmit} className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          autoFocus
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder={placeholder} 
          className="w-full h-10 pl-9 pr-20 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
        />
        {allowCustom && query.trim().length > 0 && (
          <button 
            type="submit" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-lg shadow-sm"
          >
            Usar
          </button>
        )}
      </form>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pb-4">
        {loading && <p className="text-center text-xs text-muted-foreground py-4">Buscando...</p>}
        {!loading && results.length === 0 && query.trim().length > 0 && !allowCustom && (
          <p className="text-center text-xs text-muted-foreground py-4">No se encontraron resultados.</p>
        )}
        {!loading && results.length === 0 && query.trim().length > 0 && allowCustom && (
          <button 
            onClick={() => handleCustomSubmit()} 
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 hover:bg-muted text-left transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="font-semibold text-sm">Usar &quot;{query.trim()}&quot;</span>
              <span className="text-xs text-muted-foreground">Crear sticker con este texto</span>
            </div>
          </button>
        )}
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
    allowCustom={true}
    onSelect={onSelect}
    fetchResults={async (q) => {
      let queryBuilder = supabase.from('profiles').select('id, username, display_name').limit(10)
      if (q) {
        queryBuilder = queryBuilder.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      }
      const { data, error } = await queryBuilder
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
      let queryBuilder = supabase.from('recipes').select('id, name, profiles!recipes_owner_id_fkey(username)').eq('status', 'PUBLISHED').limit(10)
      if (q) {
        queryBuilder = queryBuilder.ilike('name', `%${q}%`)
      }
      const { data, error } = await queryBuilder
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
    allowCustom={true}
    onSelect={onSelect}
    fetchResults={async (q) => {
      let queryBuilder = supabase.from('ingredients').select('id, canonical_name').limit(15)
      if (q) {
        queryBuilder = queryBuilder.ilike('canonical_name', `%${q}%`)
      }
      const { data, error } = await queryBuilder
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
    allowCustom={true}
    onSelect={onSelect}
    fetchResults={async (q) => {
      let queryBuilder = supabase.from('profiles').select('id, username, display_name').limit(10)
      if (q) {
        queryBuilder = queryBuilder.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      }
      const { data, error } = await queryBuilder
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
    allowCustom={true}
    onSelect={onSelect}
    fetchResults={async (q) => {
      if (!q) {
        return [
          { id: 'valencia', title: 'Valencia, España', subtitle: 'Comunidad Valenciana' },
          { id: 'albufera', title: 'La Albufera, Valencia', subtitle: 'Parque Natural de la Albufera' },
          { id: 'alicante', title: 'Alicante, España', subtitle: 'Costa Blanca' },
          { id: 'castellon', title: 'Castellón, España', subtitle: 'Comunidad Valenciana' }
        ]
      }
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
