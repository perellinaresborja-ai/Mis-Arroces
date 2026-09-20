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
      let queryBuilder = supabase.from('profiles').select('id, username, display_name').limit(15)
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
  const [tab, setTab] = useState<'MY' | 'SEARCH'>('MY')
  const [myRecipes, setMyRecipes] = useState<Array<{ id: string, title: string, subtitle?: string }>>([])
  const [loadingMy, setLoadingMy] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadMyRecipes() {
      setLoadingMy(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingMy(false)
        return
      }
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, updated_at')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) console.error("Error loading user recipes:", error)
      setMyRecipes((data || []).map(r => ({
        id: r.id,
        title: r.name,
        subtitle: 'Mi receta'
      })))
      setLoadingMy(false)
    }
    loadMyRecipes()
  }, [])

  return (
    <div className="flex flex-col h-full w-full bg-card">
      <div className="flex border-b border-border bg-muted/40 p-1 m-3 rounded-2xl">
        <button
          type="button"
          onClick={() => setTab('MY')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'MY'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Mis recetas
        </button>
        <button
          type="button"
          onClick={() => setTab('SEARCH')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'SEARCH'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Buscar recetas
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'MY' ? (
          <div className="p-3 h-full overflow-y-auto flex flex-col gap-1">
            {loadingMy ? (
              <p className="text-center text-xs text-muted-foreground py-6">Cargando tus recetas...</p>
            ) : myRecipes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <ChefHat className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No tienes recetas creadas</p>
                <p className="text-xs text-muted-foreground mt-1">Busca recetas públicas de la comunidad en la otra pestaña.</p>
              </div>
            ) : (
              myRecipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ChefHat className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="font-semibold text-sm truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <GenericSearchPicker 
            title="Receta" 
            icon={ChefHat} 
            placeholder="Buscar recetas públicas..."
            onSelect={onSelect}
            fetchResults={async (q) => {
              let queryBuilder = supabase
                .from('recipes')
                .select('id, name, profiles!recipes_owner_id_fkey(username)')
                .eq('status', 'PUBLISHED')
                .limit(15)
              if (q) {
                queryBuilder = queryBuilder.ilike('name', `%${q}%`)
              }
              const { data, error } = await queryBuilder
              if (error) console.error("RecipePicker error:", error)
              return (data || []).map(r => ({
                id: r.id,
                title: r.name,
                subtitle: ((r.profiles as unknown) as { username?: string })?.username ? `por @${((r.profiles as unknown) as { username?: string }).username}` : 'Receta de Mis Arroces',
                iconUrl: undefined
              }))
            }}
          />
        )}
      </div>
    </div>
  )
}

export function IngredientPicker({ onSelect }: { onSelect: (i: { id: string, title: string }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Ingrediente" icon={Apple} placeholder="Buscar o escribir ingrediente..."
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

export function LocationPicker({ onSelect }: { onSelect: (loc: { id: string, title: string, subtitle?: string }) => void }) {
  return <GenericSearchPicker 
    title="Ubicación" icon={MapPin} placeholder="Escribe cualquier ciudad o lugar..."
    allowCustom={true}
    onSelect={onSelect}
    fetchResults={async (q) => {
      if (!q || q.length < 2) {
        return []
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6`, {
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

// GIF Picker with GIPHY API or fallback
export function GifPicker({ onSelect }: { onSelect: (gif: { id: string, title: string, url: string, aspectRatio: number }) => void }) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<Array<{ id: string, title: string, url: string, aspectRatio: number }>>([])
  const [loading, setLoading] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY

  const FALLBACK_GIFS = [
    { id: 'rice-1', title: 'Paella cooking', url: 'https://media.giphy.com/media/l41JRsph73VokN6ik/giphy.gif', aspectRatio: 1 },
    { id: 'rice-2', title: 'Delicious Rice', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', aspectRatio: 1 },
    { id: 'rice-3', title: 'Chef cooking', url: 'https://media.giphy.com/media/demgpwJ6rs2DS/giphy.gif', aspectRatio: 1.3 },
    { id: 'rice-4', title: 'Fire cooking', url: 'https://media.giphy.com/media/26FPy3QZLnLCyHIyY/giphy.gif', aspectRatio: 1 },
    { id: 'rice-5', title: 'Yum food', url: 'https://media.giphy.com/media/12uXi1GXBibALC/giphy.gif', aspectRatio: 1.2 },
    { id: 'rice-6', title: 'Bon Appetit', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', aspectRatio: 1 }
  ]

  useEffect(() => {
    let isCancelled = false
    setLoading(true)

    const timer = setTimeout(async () => {
      if (!apiKey) {
        if (!isCancelled) {
          if (query.trim()) {
            setGifs(FALLBACK_GIFS.filter(g => g.title.toLowerCase().includes(query.toLowerCase())))
          } else {
            setGifs(FALLBACK_GIFS)
          }
          setLoading(false)
        }
        return
      }

      try {
        const endpoint = query.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=18&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=18&rating=g`
        const res = await fetch(endpoint)
        const json = await res.json()
        if (!isCancelled && json.data) {
          setGifs(json.data.map((item: any) => ({
            id: item.id,
            title: item.title || 'GIF',
            url: item.images?.fixed_height?.url || item.images?.original?.url,
            aspectRatio: (item.images?.fixed_height?.width && item.images?.fixed_height?.height)
              ? item.images.fixed_height.width / item.images.fixed_height.height
              : 1
          })))
        }
      } catch (err) {
        console.error("Giphy fetch error:", err)
        if (!isCancelled) setGifs(FALLBACK_GIFS)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }, query.trim() ? 350 : 0)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [query, apiKey])

  return (
    <div className="flex flex-col h-full w-full bg-card p-3 animate-in slide-in-from-bottom duration-200">
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          autoFocus
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Buscar GIFs en GIPHY..." 
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
        />
      </div>

      {!apiKey && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
          Mostrando GIFs recomendados (añade NEXT_PUBLIC_GIPHY_API_KEY para catálogo completo).
        </div>
      )}

      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4">
        {loading && <p className="col-span-full text-center text-xs text-muted-foreground py-6">Cargando GIFs...</p>}
        {!loading && gifs.map(g => (
          <button 
            key={g.id}
            onClick={() => onSelect(g)}
            className="rounded-xl overflow-hidden bg-muted aspect-square relative hover:opacity-80 transition-opacity border border-border"
          >
            <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// Link Picker (URL + optional display title)
export function LinkPicker({ onSelect }: { onSelect: (link: { id: string, title: string, url: string }) => void }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setError('Introduce una URL válida.')
      return
    }

    let parsedUrl = trimmedUrl
    if (!/^https?:\/\//i.test(parsedUrl)) {
      parsedUrl = `https://${parsedUrl}`
    }

    try {
      const u = new URL(parsedUrl)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        setError('El enlace debe ser http:// o https://')
        return
      }
    } catch {
      setError('Formato de URL inválido.')
      return
    }

    onSelect({
      id: 'link_' + Date.now(),
      title: title.trim() || '',
      url: parsedUrl
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-card p-4 gap-4 animate-in slide-in-from-bottom duration-200">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL del enlace</label>
        <input 
          autoFocus
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          className="w-full h-11 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Texto a mostrar (opcional)</label>
        <input 
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ver sitio web, comprar arroz..."
          maxLength={40}
          className="w-full h-11 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={!url.trim()}
        className="mt-auto py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-colors disabled:opacity-50"
      >
        Añadir enlace
      </button>
    </form>
  )
}

// Question Picker
export function QuestionPicker({ onSelect }: { onSelect: (q: { id: string, title: string }) => void }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    onSelect({
      id: 'question_' + Date.now(),
      title: question.trim()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-card p-4 gap-4 animate-in slide-in-from-bottom duration-200">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Haz una pregunta</label>
        <textarea 
          autoFocus
          rows={3}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Pregúntame lo que quieras sobre esta receta..."
          maxLength={100}
          className="w-full p-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground resize-none"
        />
        <div className="text-right text-[11px] text-muted-foreground">
          {question.length}/100
        </div>
      </div>

      <button
        type="submit"
        disabled={!question.trim()}
        className="mt-auto py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-colors disabled:opacity-50"
      >
        Añadir pregunta
      </button>
    </form>
  )
}

// Poll Picker
export function PollPicker({ onSelect }: { onSelect: (poll: { id: string, title: string, optionA: string, optionB: string }) => void }) {
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('Sí')
  const [optionB, setOptionB] = useState('No')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !optionA.trim() || !optionB.trim()) return
    onSelect({
      id: 'poll_' + Date.now(),
      title: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-card p-4 gap-3 animate-in slide-in-from-bottom duration-200 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pregunta de la votación</label>
        <input 
          autoFocus
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="¿Te gusta más caldoso o seco?"
          maxLength={80}
          className="w-full h-11 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Opción A</label>
          <input 
            type="text"
            value={optionA}
            onChange={e => setOptionA(e.target.value)}
            placeholder="Opción 1"
            maxLength={25}
            className="w-full h-10 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Opción B</label>
          <input 
            type="text"
            value={optionB}
            onChange={e => setOptionB(e.target.value)}
            placeholder="Opción 2"
            maxLength={25}
            className="w-full h-10 px-3 rounded-xl border border-border bg-muted/50 focus:bg-background outline-none text-sm text-foreground"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!question.trim() || !optionA.trim() || !optionB.trim()}
        className="mt-auto py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-colors disabled:opacity-50"
      >
        Añadir votación
      </button>
    </form>
  )
}

// Backward-compatible pickers preserved for legacy stories
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
