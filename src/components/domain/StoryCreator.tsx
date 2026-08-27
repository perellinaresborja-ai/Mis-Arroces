"use client"

import { useState, useRef, useEffect, useCallback, PointerEvent as ReactPointerEvent } from "react"
import { StoryOverlay, StoryTransform, StoryBackground } from "@/types/stories"
import { SharedStoryRenderer } from "./SharedStoryRenderer"
import { Type, MapPin, AtSign, Image as ImageIcon, Smile, X, ArrowRight, Check, Undo2, Redo2, Loader2, PaintBucket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDraft, saveDraft, clearDraft } from "@/lib/idbDrafts"
import { createStory } from "@/app/actions/stories"
import { uploadMedia } from "@/services/media/client"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface StoryCreatorProps {
  initialRecipeId?: string
  initialSessionId?: string
}

type EditorState = {
  overlays: StoryOverlay[];
  transform: StoryTransform;
  background: StoryBackground;
}

export function StoryCreator({ initialRecipeId, initialSessionId }: StoryCreatorProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  
  // State
  const [transform, setTransform] = useState<StoryTransform>({ scale: 1, translateX: 0, translateY: 0, rotation: 0 })
  const [background, setBackground] = useState<StoryBackground>({ type: 'blur', value: '' })
  const [overlays, setOverlays] = useState<StoryOverlay[]>([])
  
  // Undo/Redo
  const [history, setHistory] = useState<EditorState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [mode, setMode] = useState<'EDITOR' | 'PREVIEW'>('EDITOR')
  const [isPublishing, setIsPublishing] = useState(false)
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionResults, setMentionResults] = useState<any[]>([])
  const [showMentionPicker, setShowMentionPicker] = useState(false)
  
  const [guides, setGuides] = useState<{x?: number, y?: number}>({})
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    return () => {
      // Prevent memory leaks
      if (mediaUrl && !mediaUrl.startsWith('http')) {
        URL.revokeObjectURL(mediaUrl)
      }
    }
  }, [mediaUrl])

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('username, display_name, avatar_url, avatar_id').eq('id', data.user.id).single().then(res => {
          if (res.data) setCurrentUser(res.data)
        })
      }
    })
  }, [supabase])

  // Save history state
  const pushState = useCallback((newState: EditorState) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1)
      return [...sliced, newState]
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  // Save draft locally
  useEffect(() => {
    const save = setTimeout(() => {
      saveDraft({
        id: 'current_draft',
        mediaFile: mediaFile || undefined,
        transform,
        background,
        overlays,
        updatedAt: Date.now()
      })
    }, 1000)
    return () => clearTimeout(save)
  }, [mediaFile, transform, background, overlays])

  // Load draft & initial recipe
  useEffect(() => {
    getDraft().then(draft => {
      if (draft) {
        if (draft.mediaFile) {
          setMediaFile(draft.mediaFile)
          setMediaUrl(URL.createObjectURL(draft.mediaFile))
        }
        if (draft.transform) setTransform(draft.transform)
        if (draft.background) setBackground(draft.background)
        if (draft.overlays) setOverlays(draft.overlays)
        
        pushState({
          overlays: draft.overlays || [],
          transform: draft.transform || { scale: 1, translateX: 0, translateY: 0, rotation: 0 },
          background: draft.background || { type: 'blur', value: '' }
        })
      } else {
        pushState({ overlays: [], transform: { scale: 1, translateX: 0, translateY: 0, rotation: 0 }, background: { type: 'blur', value: '' } })
      }
      
      // Load initial recipe overlay if requested
      if (initialRecipeId && (!draft || draft.overlays.length === 0)) {
        supabase.from('recipes').select('id, name').eq('id', initialRecipeId).single().then(res => {
          if (res.data) {
            const newOverlay: StoryOverlay = {
              id: 'initial_recipe',
              type: 'RECIPE',
              x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: 0,
              payload: { recipeId: res.data.id, title: res.data.name }
            }
            setOverlays([newOverlay])
            pushState({ overlays: [newOverlay], transform, background })
          }
        })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setOverlays(prevState.overlays)
      setTransform(prevState.transform)
      setBackground(prevState.background)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setOverlays(nextState.overlays)
      setTransform(nextState.transform)
      setBackground(nextState.background)
      setHistoryIndex(historyIndex + 1)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      setMediaUrl(URL.createObjectURL(file))
      pushState({ overlays, transform, background })
    }
  }

  const addText = () => {
    const text = prompt("Escribe tu texto:")
    if (!text) return
    const newOverlay: StoryOverlay = {
      id: Math.random().toString(36).substring(7),
      type: 'TEXT',
      x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length,
      payload: { text, color: '#FFFFFF', align: 'center' }
    }
    const newOverlays = [...overlays, newOverlay]
    setOverlays(newOverlays)
    pushState({ overlays: newOverlays, transform, background })
  }

  const searchMentions = async (q: string) => {
    setMentionSearch(q)
    if (q.length > 1) {
      const { data } = await supabase.from('profiles').select('id, username, display_name').ilike('username', `%${q}%`).limit(5)
      setMentionResults(data || [])
    } else {
      setMentionResults([])
    }
  }

  const addMention = (user: any) => {
    const newOverlay: StoryOverlay = {
      id: Math.random().toString(36).substring(7),
      type: 'MENTION',
      x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length,
      payload: { userId: user.id, username: user.username }
    }
    const newOverlays = [...overlays, newOverlay]
    setOverlays(newOverlays)
    pushState({ overlays: newOverlays, transform, background })
    setShowMentionPicker(false)
  }

  // --- Pointer Drag / Pinch-To-Zoom Logic ---
  const pointers = useRef<Map<number, {x: number, y: number}>>(new Map())
  const initialDist = useRef<number | null>(null)
  const initialScale = useRef<number>(1)
  const isDragging = useRef(false)
  const lastPos = useRef<{x: number, y: number} | null>(null)

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (mode !== 'EDITOR') return
    // Allow clicking buttons inside canvas (like delete/check)
    if ((e.target as HTMLElement).closest('button')) return;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    
    if (pointers.current.size === 1) {
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    } else if (pointers.current.size === 2) {
      isDragging.current = false
      const pts = Array.from(pointers.current.values())
      initialDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (selectedOverlayId) {
        const o = overlays.find(x => x.id === selectedOverlayId)
        initialScale.current = o ? o.scale : 1
      } else {
        initialScale.current = transform.scale
      }
    }
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (mode !== 'EDITOR') return
    if (!pointers.current.has(e.pointerId)) return

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 2 && initialDist.current) {
      const pts = Array.from(pointers.current.values())
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const scaleDelta = dist / initialDist.current
      const newScale = Math.max(0.1, Math.min(initialScale.current * scaleDelta, 10))
      
      if (selectedOverlayId) {
        setOverlays(prev => prev.map(o => o.id === selectedOverlayId ? { ...o, scale: newScale } : o))
      } else {
        setTransform(prev => ({ ...prev, scale: newScale }))
      }
    } 
    else if (pointers.current.size === 1 && isDragging.current && lastPos.current && containerRef.current) {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }

      if (selectedOverlayId) {
        const rect = containerRef.current.getBoundingClientRect()
        setOverlays(prev => prev.map(o => {
          if (o.id !== selectedOverlayId) return o
          let nx = o.x + (dx / rect.width)
          let ny = o.y + (dy / rect.height)
          
          // Snapping logic
          let snapX = undefined, snapY = undefined
          if (Math.abs(nx - 0.5) < 0.03) { nx = 0.5; snapX = 0.5 }
          if (Math.abs(ny - 0.5) < 0.03) { ny = 0.5; snapY = 0.5 }
          setGuides({ x: snapX, y: snapY })
          
          return { ...o, x: nx, y: ny }
        }))
      } else {
        setTransform(prev => ({
          ...prev,
          translateX: prev.translateX + dx,
          translateY: prev.translateY + dy
        }))
      }
    }
  }

  const handlePointerUp = (e: ReactPointerEvent) => {
    if (mode !== 'EDITOR') return
    pointers.current.delete(e.pointerId)
    
    if (pointers.current.size === 0) {
      if (isDragging.current || initialDist.current) {
        pushState({ overlays, transform, background }) // Save state after drag/zoom
      }
      isDragging.current = false
      initialDist.current = null
      setGuides({})
    }
  }

  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      
      let mediaId: string | undefined;
      if (mediaFile) {
        mediaId = await uploadMedia(mediaFile, 'stories', Date.now().toString());
      }

      await createStory({
        mediaTransform: transform,
        overlays,
        background,
        recipeId: initialRecipeId,
        sessionId: initialSessionId,
        mediaId
      })
      await clearDraft()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error al publicar")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden w-full relative">
      <header className="flex-none p-4 flex items-center justify-between z-20">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => router.back()}>
          <X className="w-6 h-6" />
        </Button>
        <div className="flex gap-2">
          {mode === 'PREVIEW' ? (
            <>
              <Button variant="secondary" onClick={() => setMode('EDITOR')} className="rounded-full font-bold">
                Editar
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {isPublishing ? <Loader2 className="w-5 h-5 animate-spin"/> : "Publicar"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 mr-4">
                <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}><Undo2 className="w-5 h-5"/></Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo2 className="w-5 h-5"/></Button>
              </div>
              <Button variant="secondary" onClick={() => setMode('PREVIEW')} className="rounded-full font-bold text-black bg-white hover:bg-gray-200">
                Siguiente <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center overflow-hidden p-2 touch-none relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{ width: '100%', maxWidth: '400px', height: '100%', maxHeight: 'calc(100dvh - 180px)', aspectRatio: '9/16' }}
        >
          {!mediaUrl && mode === 'EDITOR' && overlays.length === 0 && (
             <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/20 rounded-3xl m-4 z-20">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <ImageIcon className="w-12 h-12 mb-2 text-white/50" />
                <span className="text-white/50 font-medium">Toca para añadir foto</span>
             </label>
          )}
          
          <SharedStoryRenderer 
            mode={mode}
            mediaUrl={mediaUrl}
            transform={transform}
            background={background}
            overlays={overlays}
            onOverlayClick={(o) => setSelectedOverlayId(o.id)}
            selectedOverlayId={selectedOverlayId}
          />
          {/* ACCESSIBILITY CONTROLS */}
          {mode === 'EDITOR' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 bg-black/50 p-2 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] text-center font-bold uppercase text-white/50 mb-1">A11y</span>
              {!selectedOverlayId ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, scale: prev.scale + 0.1}))} title="Zoom In Media">+</Button>
                  <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, scale: Math.max(0.1, prev.scale - 0.1)}))} title="Zoom Out Media">-</Button>
                  <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, translateY: prev.translateY - 20}))} title="Move Up">↑</Button>
                  <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, translateY: prev.translateY + 20}))} title="Move Down">↓</Button>
                </>
              ) : (
                <>
                  <Button variant="destructive" size="icon" onClick={() => setOverlays(prev => prev.filter(o => o.id !== selectedOverlayId))} title="Delete Overlay"><X className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setOverlays(prev => prev.map(o => o.id === selectedOverlayId ? {...o, scale: o.scale + 0.1} : o))} title="Scale Up Overlay">+</Button>
                  <Button variant="ghost" size="icon" onClick={() => setOverlays(prev => prev.map(o => o.id === selectedOverlayId ? {...o, scale: Math.max(0.1, o.scale - 0.1)} : o))} title="Scale Down Overlay">-</Button>
                  <Button variant="ghost" size="icon" onClick={() => setOverlays(prev => prev.map(o => o.id === selectedOverlayId ? {...o, y: o.y - 0.05} : o))} title="Move Up">↑</Button>
                  <Button variant="ghost" size="icon" onClick={() => setOverlays(prev => prev.map(o => o.id === selectedOverlayId ? {...o, y: o.y + 0.05} : o))} title="Move Down">↓</Button>
                </>
              )}
            </div>
          )}
          {/* END ACCESSIBILITY CONTROLS */}



          {/* SAFE AREAS INDICATORS */}
          {mode === 'EDITOR' && (
            <div className="absolute inset-0 pointer-events-none z-30 opacity-40">
              <div className="absolute top-0 left-0 w-full h-24 border-b border-dashed border-red-500 bg-red-500/10 flex items-start justify-center pt-2">
                <span className="text-[10px] text-red-500 font-bold uppercase">Safe Area: Header & Progress</span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-32 border-t border-dashed border-red-500 bg-red-500/10 flex items-end justify-center pb-2">
                <span className="text-[10px] text-red-500 font-bold uppercase">Safe Area: Footer Actions</span>
              </div>
            </div>
          )}

          {/* Snap Guides */}
          {guides.x === 0.5 && <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500 z-50 pointer-events-none" />}
          {guides.y === 0.5 && <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-blue-500 z-50 pointer-events-none" />}

          {/* User Preview overlay */}
          {(mode === 'PREVIEW' || mode === 'EDITOR') && currentUser && (
            <div className={`absolute top-4 left-4 right-4 flex items-center gap-2 z-50 transition-opacity ${mode==='EDITOR' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white overflow-hidden shadow-sm">
                 {currentUser.avatar_url ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="flex items-center justify-center w-full h-full bg-primary font-bold">{currentUser.display_name?.charAt(0) || currentUser.username?.charAt(0)}</span>
                 )}
              </div>
              <div className="flex flex-col drop-shadow-md">
                <span className="text-white font-bold text-sm leading-tight">{currentUser.username}</span>
                <span className="text-white/80 text-xs leading-tight">1m</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {mode === 'EDITOR' && (
        <div className="flex-none p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4 z-20">
          
          {selectedOverlayId ? (
            <div className="flex items-center justify-center gap-2 mb-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
               <span className="text-xs font-semibold text-white/80">Capa seleccionada</span>
               <Button variant="ghost" size="sm" className="h-8 rounded-full text-red-400 hover:bg-red-400/20" onClick={() => {
                 const newOverlays = overlays.filter(o => o.id !== selectedOverlayId)
                 setOverlays(newOverlays)
                 setSelectedOverlayId(null)
                 pushState({ overlays: newOverlays, transform, background })
               }}>Eliminar</Button>
               <Button variant="ghost" size="sm" className="h-8 rounded-full text-white/80" onClick={() => setSelectedOverlayId(null)}><Check className="w-4 h-4"/></Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
               <span className="text-xs font-semibold text-white/80 text-center w-full">Arrastra la imagen o pellizca para hacer zoom</span>
            </div>
          )}
          
          {showMentionPicker && (
            <div className="flex flex-col gap-2 p-2 bg-zinc-900 rounded-xl mb-2 border border-zinc-800">
               <input type="text" placeholder="Buscar usuario..." className="p-2 rounded bg-zinc-800 text-white outline-none" autoFocus value={mentionSearch} onChange={e => searchMentions(e.target.value)} />
               {mentionResults.map(u => (
                 <div key={u.id} className="p-2 hover:bg-zinc-800 cursor-pointer rounded" onClick={() => addMention(u)}>
                   @{u.username} <span className="text-zinc-500 text-sm">{u.display_name}</span>
                 </div>
               ))}
               <Button variant="ghost" size="sm" onClick={() => setShowMentionPicker(false)}>Cancelar</Button>
            </div>
          )}

          {!showMentionPicker && (
            <div className="flex items-center justify-center gap-4 overflow-x-auto px-2">
              <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={addText}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><Type className="w-5 h-5"/></div>
                <span className="text-[10px] font-semibold tracking-wide">Texto</span>
              </Button>
              <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => setShowMentionPicker(true)}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><AtSign className="w-5 h-5"/></div>
                <span className="text-[10px] font-semibold tracking-wide">Mención</span>
              </Button>
              <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
                 const name = prompt("Ciudad o lugar (Fallback Manual):")
                 if(name) {
                   const newOverlays = [...overlays, { id: Math.random().toString(36).substring(7), type: 'LOCATION', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { name } } as StoryOverlay]
                   setOverlays(newOverlays)
                   pushState({ overlays: newOverlays, transform, background })
                 }
              }}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><MapPin className="w-5 h-5"/></div>
                <span className="text-[10px] font-semibold tracking-wide">Ubicación</span>
              </Button>
              <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
                 if(!process.env.NEXT_PUBLIC_GIPHY_API_KEY) {
                   alert("El proveedor GIPHY no está configurado (falta NEXT_PUBLIC_GIPHY_API_KEY). Esta función está deshabilitada temporalmente.");
                 }
              }}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><Smile className="w-5 h-5"/></div>
                <span className="text-[10px] font-semibold tracking-wide">GIF</span>
              </Button>
              <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
                 const newBg = background.type === 'blur' ? { type: 'color' as const, value: '#000000' } : { type: 'blur' as const, value: '' };
                 setBackground(newBg)
                 pushState({ overlays, transform, background: newBg })
              }}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><PaintBucket className="w-5 h-5"/></div>
                <span className="text-[10px] font-semibold tracking-wide">Fondo</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

