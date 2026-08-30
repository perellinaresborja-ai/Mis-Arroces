"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { useRouter } from 'next/navigation';
import { StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay } from '@/types/stories';
import { createClient } from '@/lib/supabase/client';
import { createStory } from '@/app/actions/stories';
import { globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, clearGlobalStoryDraft, setGlobalStoryDraft } from '@/lib/story-draft';
import { SharedStoryRenderer } from './SharedStoryRenderer';
import { DraggableOverlay } from './stories/DraggableOverlay';
import { MentionPicker, RecipePicker, IngredientPicker, LocationPicker, GenericSearchPicker, SessionPicker, ProfilePicker } from './stories/StickerPickers';
import { Camera, User, ChefHat, MapPin, AlignLeft, Apple, Image as ImageIcon } from 'lucide-react';

export function StoryCreator({ 
  initialMedia, 
  initialRecipe 
}: { 
  initialMedia?: { url: string, type: 'IMAGE'|'VIDEO' },
  initialRecipe?: { id: string, name: string, coverUrl?: string } 
}) {
  const router = useRouter();
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlays, setOverlays] = useState<StoryOverlay[]>([]);
  const [history, setHistory] = useState<StoryOverlay[][]>([]); const [redoHistory, setRedoHistory] = useState<StoryOverlay[][]>([]);
  const [background, setBackground] = useState<StoryBackground>({ type: 'blur', value: '' });
  const [draftMediaUrl, setDraftMediaUrl] = useState<string | undefined>(initialMedia?.url);
  const [draftMediaType, setDraftMediaType] = useState<'IMAGE'|'VIDEO'|undefined>(initialMedia?.type);
  const [mediaTransform, setMediaTransform] = useState({ translateX: 0, translateY: 0, scale: 1, rotation: 0 });

  useEffect(() => {
    if (globalStoryDraftUrl && !initialMedia) {
      setDraftMediaUrl(globalStoryDraftUrl);
      setDraftMediaType(globalStoryDraftType || 'IMAGE');
      // Set mode to EDIT since we have media
      setMode('EDIT');
    } else if (!initialMedia && !initialRecipe) {
      // If there's no media and no recipe, default to TEXT mode
      setMode('TEXT');
    }
  }, []);
  
  // Important: We need a cleanup when unmounting to free memory if needed, 
  // but if we are publishing we might need it. Let's just keep it in memory for now until it's published or we leave.
  useEffect(() => {
    return () => {
      // We don't automatically clear here because they might be navigating to sticker pickers etc.
    };
  }, []);
  
  
  const [mode, setMode] = useState<'EDIT'|'DRAW'|'TEXT'|'STICKER'>('EDIT');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    const url = URL.createObjectURL(file);
    setDraftMediaUrl(url);
    if (file.type.startsWith("video/")) {
      setDraftMediaType("VIDEO");
    } else {
      setDraftMediaType("IMAGE");
    }
    setMode('EDIT');
  };
  const [activeStickerType, setActiveStickerType] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    // prevent default pinch zoom on the whole page when editing story
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
    };
  }, []);

  const bindBackgroundGestures = useGesture({
    onDrag: ({ offset: [x, y], target }) => {
      // Only drag background if not dragging an overlay
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      setMediaTransform(prev => ({ ...prev, translateX: x, translateY: y }));
    },
    onPinch: ({ offset: [d, a], target }) => {
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      setMediaTransform(prev => ({ ...prev, scale: d, rotation: a }));
    }
  }, {
    drag: { from: () => [mediaTransform.translateX, mediaTransform.translateY] },
    pinch: { 
      from: () => [mediaTransform.scale, mediaTransform.rotation],
      scaleBounds: { min: 0.1, max: 10 }
    }
  });

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderForm, setSliderForm] = useState({ prompt: '', emoji: '😋' });
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [pollForm, setPollForm] = useState({ question: '', optionA: 'Sí', optionB: 'No' });
  const [privacy, setPrivacy] = useState<'PUBLIC'|'FOLLOWERS'>('PUBLIC');

  // Drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawSize, setDrawSize] = useState(5);
  const isDrawing = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [canvasUndoStack, setCanvasUndoStack] = useState<ImageData[]>([]);

  // Text state
  const [textVal, setTextVal] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBg, setTextBg] = useState('transparent');
  const [textFont, setTextFont] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState<'left'|'center'|'right'>('center');

  // Init recipe if passed
  useEffect(() => {
    if (initialRecipe && overlays.length === 0) {
      setOverlays([{
        id: 'recipe_'+Date.now(),
        type: 'RECIPE',
        x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1,
        payload: { title: initialRecipe.name, recipeId: initialRecipe.id, coverUrl: initialRecipe.coverUrl, displayStyle: 'card' }
      }]);
    }
  }, []);

  const saveHistory = () => setHistory([...history, [...overlays]]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'DRAW' || !canvasRef.current) return;
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.lineCap = 'round';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !ctxRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctxRef.current.stroke();
  };

  const handlePointerUp = () => {
    if (isDrawing.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setCanvasUndoStack(prev => [...prev, ctx.getImageData(0, 0, 400, 711)].slice(-20)); // keep last 20
      }
    }
    isDrawing.current = false;
    ctxRef.current = null;
  };

  const addText = () => {
    if (!textVal.trim()) { setMode('EDIT'); return; }
    saveHistory();
    setOverlays([...overlays, {
      id: 'text_'+Date.now(), type: 'TEXT', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length + 10,
      payload: { text: textVal, color: textColor, backgroundColor: textBg, fontFamily: textFont, align: textAlign }
    }]);
    setTextVal(''); setMode('EDIT');
  };

  const handleStickerSelect = (type: string, data: { id: string, title: string, coverUrl?: string }) => {
    saveHistory();
    
    
    let newOverlay: StoryOverlay | null = null;
    const common = { id: type+'_'+Date.now(), x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length + 10 };
    if (type === 'MENTION') newOverlay = { ...common, type: 'MENTION', payload: { username: data.title, userId: data.id } };
    if (type === 'LOCATION') newOverlay = { ...common, type: 'LOCATION', payload: { name: data.title } };
    if (type === 'RECIPE') newOverlay = { ...common, type: 'RECIPE', payload: { title: data.title, recipeId: data.id, displayStyle: 'compact', coverUrl: data.coverUrl } };
    if (type === 'INGREDIENT') newOverlay = { ...common, type: 'INGREDIENT', payload: { name: data.title, ingredientId: data.id } };
    if (type === 'SESSION') newOverlay = { ...common, type: 'SESSION', payload: { authorName: data.title, sessionId: data.id } };
    if (type === 'PROFILE') newOverlay = { ...common, type: 'PROFILE', payload: { username: data.title, userId: data.id } };
    
    if (newOverlay) {
      setOverlays([...overlays, newOverlay]);
    }
    setActiveStickerType(null);

    setMode('EDIT');
  };

  const uploadDraftIfNeeded = async () => {
    if (globalStoryDraftFile) {
      const ext = globalStoryDraftFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { data, error } = await supabase.storage.from('recipe_media').upload(`stories/${fileName}`, globalStoryDraftFile);
      if (error) { console.error(error); return undefined; }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return undefined;
      const { data: assetData, error: dbError } = await supabase.from('media_assets').insert({
        storage_path: data.path,
        media_type: globalStoryDraftType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mime_type: globalStoryDraftFile.type,
        owner_id: user.id
      }).select().single();
      
      if (dbError) { console.error(dbError); return undefined; }
      return assetData.id;
    }
    return undefined;
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // In a real flow, we'd also upload media to storage and create the post
      await createStory({
        mediaTransform,
        background,
        mediaId: await uploadDraftIfNeeded() || undefined,
        recipeId: initialRecipe?.id,
        // privacy,
        overlays
      });
      router.push('/');
    } catch (e) {
      console.error(e);
      alert("Error al publicar la historia.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row touch-none">
      
      {/* Viewer / Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={() => setSelectedOverlayId(null)}>
        <div ref={containerRef} {...bindBackgroundGestures()} className="relative w-full max-w-[400px] touch-none h-full max-h-[85vh] md:max-h-full bg-zinc-900 border border-white/10 md:rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          
          <SharedStoryRenderer 
            mediaUrl={draftMediaUrl} 
            background={background}
            overlays={[]} 
            mode="EDITOR"
          />
          {!draftMediaUrl && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <label className="bg-primary hover:bg-primary/90 text-primary-foreground w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition-transform hover:scale-105 shadow-2xl">
                <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                <Camera size={40} />
                <span className="text-sm font-bold mt-1">Subir</span>
              </label>
            </div>
          )}


          <canvas 
            ref={canvasRef}
            width={400} height={711}
            className="absolute inset-0 z-40 touch-none"
            style={{ pointerEvents: mode === 'DRAW' ? 'auto' : 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {overlays.map((o, i) => (
            <DraggableOverlay
              key={o.id}
              overlay={o}
              isSelected={selectedOverlayId === o.id}
              onSelect={() => setSelectedOverlayId(o.id)}
              onUpdate={(updated) => setOverlays(overlays.map(x => x.id === o.id ? updated : x))}
              onDelete={() => { saveHistory(); setOverlays(overlays.filter(x => x.id !== o.id)); }}
              onMoveLayer={(dir) => {
                const newArr = [...overlays];
                newArr[i].zIndex += dir * 10;
                setOverlays(newArr);
              }}
              containerRef={containerRef}
            >
              <div className="pointer-events-none">
                <SharedStoryRenderer overlays={[o]} mode="PREVIEW" />
              </div>
            </DraggableOverlay>
          ))}
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
        
        {/* Editor Main Tools */}
        
      {/* Recipe Style Selector */}
      {selectedOverlayId && overlays.find(o => o.id === selectedOverlayId)?.type === 'RECIPE' && (
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-2xl flex gap-3 z-[100] border border-white/20 shadow-2xl">
          {['card', 'compact', 'text'].map(style => {
            const ov = overlays.find(o => o.id === selectedOverlayId);
            const isActive = ov?.type === 'RECIPE' && ov.payload.displayStyle === style;
            return (
              <button 
                key={style}
                onClick={(e) => {
                  e.stopPropagation();
                  setOverlays(overlays.map(o => {
    if (o.id === selectedOverlayId && o.type === 'RECIPE') {
      return { ...o, payload: { ...o.payload, displayStyle: style as 'card'|'compact'|'text' } };
    }
    return o;
  }));
                }}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold capitalize transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/20'}`}
              >
                {style}
              </button>
            )
          })}
        </div>
      )}

      {mode === 'EDIT' && (
          <div className="p-4 flex flex-col gap-4 h-full">
            <div className="flex justify-around bg-zinc-900 rounded-xl p-2">
                <label className="p-3 text-white flex flex-col items-center gap-1 cursor-pointer m-0">
                  <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                  <Camera size={20}/><span className="text-xs">Comparte</span>
                </label>
              <button onClick={() => setMode('TEXT')} className="p-3 text-white flex flex-col items-center gap-1"><AlignLeft size={20}/><span className="text-xs">Texto</span></button>
              <button onClick={() => setMode('DRAW')} className="p-3 text-white flex flex-col items-center gap-1"><span className="text-xl">🖌</span><span className="text-xs">Dibujar</span></button>
              <button onClick={() => setMode('STICKER')} className="p-3 text-white flex flex-col items-center gap-1"><span className="text-xl">☻</span><span className="text-xs">Stickers</span></button>
            </div>
            
            <div className="mt-auto space-y-4">
              <select value={privacy} onChange={e => setPrivacy(e.target.value as 'PUBLIC'|'FOLLOWERS')} className="w-full bg-zinc-900 text-white rounded-xl p-3 border-none outline-none">
                <option value="PUBLIC">🌎 Público (Cualquiera)</option>
                <option value="FOLLOWERS">👥 Solo Seguidores</option>
              </select>
              <button onClick={handlePublish} disabled={isPublishing} className="w-full bg-primary text-primary-foreground font-bold p-4 rounded-xl">
                {isPublishing ? 'Publicando...' : 'Compartir Historia'}
              </button>
            </div>
          </div>
        )}

        {/* Text Mode */}
        {mode === 'TEXT' && (
          <div className="p-4 flex flex-col gap-4 h-full">
            <textarea autoFocus value={textVal} onChange={e=>setTextVal(e.target.value)} className="w-full h-32 bg-zinc-900 text-white rounded-xl p-3 outline-none" placeholder="Escribe aquí..."></textarea>
            <div className="flex gap-2">
              <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer" />
              <input type="color" value={textBg} onChange={e=>setTextBg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer" title="Fondo" />
            </div>
            <select value={textFont} onChange={e=>setTextFont(e.target.value)} className="bg-zinc-900 text-white p-3 rounded-xl">
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="Impact">Impact</option>
            </select>
            <div className="mt-auto flex gap-2">
              <button onClick={() => setMode('EDIT')} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Cancelar</button>
              <button onClick={addText} className="flex-1 bg-white text-black font-bold p-3 rounded-xl">Añadir</button>
            </div>
          </div>
        )}

        {/* Draw Mode */}
        {mode === 'DRAW' && (
          <div className="p-4 flex flex-col gap-4 h-full">
            <h3 className="font-bold text-white text-lg">Pincel</h3>
            <input type="color" value={drawColor} onChange={e=>setDrawColor(e.target.value)} className="w-full h-12 rounded-lg" />
            <input type="range" min="1" max="30" value={drawSize} onChange={e=>setDrawSize(Number(e.target.value))} className="w-full" />
            <div className="mt-auto flex gap-2">
              <button onClick={() => {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) ctx.clearRect(0,0,400,711);
                setCanvasUndoStack([]);
              }} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Borrar Todo</button>
              <button onClick={() => {
                if (canvasUndoStack.length > 0) {
                  const ctx = canvasRef.current?.getContext('2d');
                  if (ctx) {
                    const newStack = [...canvasUndoStack];
                    newStack.pop(); // remove current state
                    if (newStack.length > 0) {
                      ctx.putImageData(newStack[newStack.length - 1], 0, 0);
                    } else {
                      ctx.clearRect(0,0,400,711);
                    }
                    setCanvasUndoStack(newStack);
                  }
                }
              }} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Deshacer</button>
  
              <button onClick={() => setMode('EDIT')} className="flex-1 bg-white text-black font-bold p-3 rounded-xl">Hecho</button>
            </div>
          </div>
        )}

        {/* Sticker Tray Mode */}
        {mode === 'STICKER' && (
          <div className="flex flex-col h-full relative">
            {!activeStickerType ? (
              <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto">
                <button onClick={() => setActiveStickerType('MENTION')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><User size={18}/> Mención</button>
                <button onClick={() => setActiveStickerType('LOCATION')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><MapPin size={18}/> Ubicación</button>
                <button onClick={() => setActiveStickerType('RECIPE')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><ChefHat size={18}/> Receta</button>
                <button onClick={() => setActiveStickerType('INGREDIENT')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><Apple size={18}/> Ingrediente</button>

                <button onClick={() => setActiveStickerType('SESSION')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><ChefHat size={18}/> Sesión</button>
                <button onClick={() => setActiveStickerType('PROFILE')} className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-center gap-2"><User size={18}/> Perfil</button>

                <button onClick={() => { setMode('EDIT'); setIsPollModalOpen(true); }} className="bg-zinc-900 text-white p-4 rounded-xl col-span-2 font-bold">📊 Encuesta</button>
                <button onClick={() => { setMode('EDIT'); setIsQuestionModalOpen(true); }} className="bg-zinc-900 text-white p-4 rounded-xl col-span-2 font-bold">❓ Pregunta</button>
                <button onClick={() => { setMode('EDIT'); setIsSliderModalOpen(true); }} className="bg-zinc-900 text-white p-4 rounded-xl col-span-2 font-bold">😍 Slider</button>
              </div>
            ) : (
              <div className="absolute inset-0 z-10 bg-zinc-950 flex flex-col">
                <div className="p-2 border-b border-white/10 flex items-center">
                  <button onClick={() => setActiveStickerType(null)} className="text-white p-2">Volver</button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  {activeStickerType === 'MENTION' && <MentionPicker onSelect={(u) => handleStickerSelect('MENTION', u)} />}
                  {activeStickerType === 'RECIPE' && <RecipePicker onSelect={(r) => handleStickerSelect('RECIPE', r)} />}
                  {activeStickerType === 'INGREDIENT' && <IngredientPicker onSelect={(i) => handleStickerSelect('INGREDIENT', i)} />}
                  {activeStickerType === 'LOCATION' && <LocationPicker onSelect={(l) => handleStickerSelect('LOCATION', l)} />}
                  
                  {activeStickerType === 'SESSION' && <SessionPicker onSelect={(s) => handleStickerSelect('SESSION', s)} />}
                  {activeStickerType === 'PROFILE' && <ProfilePicker onSelect={(p) => handleStickerSelect('PROFILE', p)} />}

                </div>
              </div>
            )}
            
            {!activeStickerType && (
              <div className="mt-auto p-4 border-t border-white/10">
                <button onClick={() => setMode('EDIT')} className="w-full bg-zinc-800 text-white p-3 rounded-xl">Cancelar</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
