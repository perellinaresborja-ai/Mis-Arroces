"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { StoryOverlay, StoryTransform, StoryBackground, BaseOverlay } from "@/types/stories"
import { SharedStoryRenderer } from "./SharedStoryRenderer"
import { Type, MapPin, AtSign, Utensils, Image as ImageIcon, Smile, X, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDraft, saveDraft, clearDraft } from "@/lib/idbDrafts"
import { createStory } from "@/app/actions/stories"
import { useRouter } from "next/navigation"

interface StoryCreatorProps {
  initialRecipeId?: string
  initialSessionId?: string
}

export function StoryCreator({ initialRecipeId, initialSessionId }: StoryCreatorProps) {
  const router = useRouter()
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [transform, setTransform] = useState<StoryTransform>({ scale: 1, translateX: 0, translateY: 0, rotation: 0 })
  const [background, setBackground] = useState<StoryBackground>({ type: 'blur', value: '' })
  const [overlays, setOverlays] = useState<StoryOverlay[]>([])
  
  const [mode, setMode] = useState<'EDITOR' | 'PREVIEW'>('EDITOR')
  const [isPublishing, setIsPublishing] = useState(false)
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Minimal Draft restoration
  useEffect(() => {
    getDraft().then(draft => {
      if (draft) {
        if (draft.mediaUrl) setMediaUrl(draft.mediaUrl)
        if (draft.transform) setTransform(draft.transform)
        if (draft.background) setBackground(draft.background)
        if (draft.overlays) setOverlays(draft.overlays)
      }
    })
  }, [])

  // Auto-save draft
  useEffect(() => {
    if (!mediaUrl && overlays.length === 0) return
    const save = setTimeout(() => {
      saveDraft({
        id: 'current_draft',
        mediaUrl: mediaUrl || undefined,
        transform,
        background,
        overlays,
        updatedAt: Date.now()
      })
    }, 1000)
    return () => clearTimeout(save)
  }, [mediaUrl, transform, background, overlays])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      setMediaUrl(URL.createObjectURL(file))
    }
  }

  const addText = () => {
    const text = prompt("Escribe tu texto:")
    if (!text) return
    const newOverlay: StoryOverlay = {
      id: Math.random().toString(36).substring(7),
      type: 'TEXT',
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      zIndex: overlays.length,
      payload: { text, color: '#FFFFFF', align: 'center' }
    }
    setOverlays([...overlays, newOverlay])
  }

  // Simplified handlers for demonstration. A real pinch/drag logic would attach to containerRef.
  // We'll keep it simple: clicking an overlay selects it. 
  // We can provide slider controls or simple buttons to move/scale the selected overlay or media.
  
  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      
      // Upload media if exists
      let mediaId = undefined;
      if (mediaFile) {
        // We simulate upload or call existing upload utility here
        // const url = await uploadToRecipeMedia(mediaFile, user.id, 'stories')
        // mediaId = url.id
        alert("En producción se subiría la imagen a Supabase Storage.")
      }

      await createStory({
        mediaTransform: transform,
        overlays,
        background,
        // mediaId,
        recipeId: initialRecipeId,
        sessionId: initialSessionId
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
      
      {/* Header */}
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
                {isPublishing ? "Publicando..." : "Publicar"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setMode('PREVIEW')} className="rounded-full font-bold text-black bg-white hover:bg-gray-200">
              Siguiente <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
        <div 
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: '100%',
            maxHeight: 'calc(100dvh - 180px)',
            aspectRatio: '9/16'
          }}
        >
          {!mediaUrl && mode === 'EDITOR' && overlays.length === 0 && (
             <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/20 rounded-3xl m-4">
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

          {/* User Preview overlay when in PREVIEW mode */}
          {mode === 'PREVIEW' && (
            <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-50">
              <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white overflow-hidden shadow-sm">
                 <img src="/logover.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col drop-shadow-md">
                <span className="text-white font-bold text-sm leading-tight">Tu usuario</span>
                <span className="text-white/80 text-xs leading-tight">1m</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Controls */}
      {mode === 'EDITOR' && (
        <div className="flex-none p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4">
          
          {selectedOverlayId && (
            <div className="flex items-center justify-center gap-2 mb-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
               <span className="text-xs font-semibold text-white/80">Editar overlay seleccionado</span>
               <Button variant="ghost" size="sm" className="h-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/20" onClick={() => {
                 setOverlays(overlays.filter(o => o.id !== selectedOverlayId))
                 setSelectedOverlayId(null)
               }}>Eliminar</Button>
               <Button variant="ghost" size="sm" className="h-8 rounded-full text-white/80" onClick={() => setSelectedOverlayId(null)}><Check className="w-4 h-4"/></Button>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4 overflow-x-auto px-2">
            <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={addText}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><Type className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold tracking-wide">Texto</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
              const name = prompt("Ciudad o lugar:")
              if(name) {
                setOverlays([...overlays, { id: Math.random().toString(36).substring(7), type: 'LOCATION', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { name } }])
              }
            }}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><MapPin className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold tracking-wide">Ubicación</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
               const username = prompt("Nombre de usuario a mencionar:")
               if(username) {
                 setOverlays([...overlays, { id: Math.random().toString(36).substring(7), type: 'MENTION', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { userId: '123', username } }])
               }
            }}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><AtSign className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold tracking-wide">Mención</span>
            </Button>

            <Button variant="ghost" className="flex flex-col gap-1 items-center hover:bg-white/10 rounded-xl h-auto py-2 px-3 text-white" onClick={() => {
               const q = prompt("Buscar GIF (GIPHY):")
               if(q) {
                 alert("GIPHY API no configurada (NEXT_PUBLIC_GIPHY_API_KEY). Esta es la versión Fallback.")
               }
            }}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><Smile className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold tracking-wide">GIF</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


