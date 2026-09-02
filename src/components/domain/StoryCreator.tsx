"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { useRouter } from 'next/navigation';
import { StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay } from '@/types/stories';
import { createClient } from '@/lib/supabase/client';
import { createStory } from '@/app/actions/stories';
import { globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, clearGlobalStoryDraft, setGlobalStoryDraft } from '@/lib/story-draft';
import { SharedStoryRenderer, renderOverlayContent } from './SharedStoryRenderer';
import { DraggableOverlay } from './stories/DraggableOverlay';
import { MentionPicker, RecipePicker, IngredientPicker, LocationPicker, GenericSearchPicker, SessionPicker, ProfilePicker } from './stories/StickerPickers';
import { Camera, User, ChefHat, MapPin, AlignLeft, AlignCenter, AlignRight, Apple, Image as ImageIcon, Trash2, Paintbrush, Sparkles } from 'lucide-react';

const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const TEXT_FONTS = ['sans-serif', 'serif', 'monospace', 'Impact'];

export function StoryCreator({ 
  initialMedia, 
  initialRecipe,
  initialSession,
  initialPost
}: { 
  initialMedia?: { url: string, type: 'IMAGE'|'VIDEO' },
  initialRecipe?: { id: string, name: string, coverUrl?: string },
  initialSession?: { id: string, authorName: string, title?: string, coverUrl?: string },
  initialPost?: { id: string, authorName: string, text?: string, coverUrl?: string }
}) {
  const router = useRouter();
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlays, setOverlays] = useState<StoryOverlay[]>([]);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [history, setHistory] = useState<StoryOverlay[][]>([]); const [redoHistory, setRedoHistory] = useState<StoryOverlay[][]>([]);
  const [background, setBackground] = useState<StoryBackground>({ type: 'color', value: '#18181B' });
  const [draftMediaUrl, setDraftMediaUrl] = useState<string | undefined>(initialMedia?.url);
  const [draftMediaType, setDraftMediaType] = useState<'IMAGE'|'VIDEO'|undefined>(initialMedia?.type);
  const [mediaTransform, setMediaTransform] = useState({ translateX: 0, translateY: 0, scale: 1, rotation: 0 });

  useEffect(() => {
    if (globalStoryDraftUrl && !initialMedia) {
      setDraftMediaUrl(globalStoryDraftUrl);
      setDraftMediaType(globalStoryDraftType || 'IMAGE');
      // Set mode to EDIT since we have media
      setMode('EDIT');
    } else if (!initialMedia && !initialRecipe && !initialSession && !initialPost) {
      // Always default to EDIT so the user sees the 'Subir' file picker first,
      // and can manually click 'Texto' if they want a text-only story.
      setMode('EDIT');
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
    document.addEventListener('gesturestart', handler, { passive: false });
    document.addEventListener('gesturechange', handler, { passive: false });
    
    // Also block native touchmove zoom if possible on the body
    const touchHandler = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', touchHandler, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
      document.removeEventListener('touchmove', touchHandler);
    };
  }, []);

  const mediaTransformRef = useRef({ translateX: 0, translateY: 0, scale: 1, rotation: 0 });
  
  useEffect(() => {
    mediaTransformRef.current = { ...mediaTransform };
  }, [mediaTransform]);

  const updateDOMTransform = (t: { translateX: number, translateY: number, scale: number, rotation: number }) => {
    const el = document.getElementById('story-media-layer');
    const bg = document.getElementById('story-media-bg-layer');
    const tStr = `translate(${t.translateX}px, ${t.translateY}px) scale(${t.scale}) rotate(${t.rotation}deg)`;
    if (el) el.style.transform = tStr;
    if (bg) bg.style.transform = tStr;
  };

  const bindBackgroundGestures = useGesture({
    onDrag: ({ offset: [x, y], target, event, last }) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      mediaTransformRef.current.translateX = x;
      mediaTransformRef.current.translateY = y;
      updateDOMTransform(mediaTransformRef.current);
      if (last) setMediaTransform({ ...mediaTransformRef.current });
    },
    onPinch: ({ offset: [d, a], target, event, last }) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      mediaTransformRef.current.scale = d;
      mediaTransformRef.current.rotation = a;
      updateDOMTransform(mediaTransformRef.current);
      if (last) setMediaTransform({ ...mediaTransformRef.current });
    }
  }, {
    eventOptions: { passive: false },
    drag: { from: () => [mediaTransformRef.current.translateX, mediaTransformRef.current.translateY] },
    pinch: { 
      from: () => [mediaTransformRef.current.scale, mediaTransformRef.current.rotation],
      scaleBounds: { min: 0.1, max: 10 }
    }
  });

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderForm, setSliderForm] = useState({ prompt: '', emoji: 'ðŸ˜‹' });
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [pollForm, setPollForm] = useState({ question: '', optionA: 'SÃ­', optionB: 'No' });
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

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Init recipe, session or post if passed
    useEffect(() => {
      if (overlays.length > 0) return;
      let extractedCoverUrl = undefined;
      let newOverlay: any = null;
      if (initialRecipe) {
        extractedCoverUrl = initialRecipe.coverUrl;
        newOverlay = { id: "recipe_"+Date.now(), type: "RECIPE", x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1, payload: { title: initialRecipe.name, recipeId: initialRecipe.id, displayStyle: "card" } };
      } else if (initialSession) {
        extractedCoverUrl = initialSession.coverUrl;
        newOverlay = { id: "session_"+Date.now(), type: "SESSION", x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1, payload: { sessionId: initialSession.id, authorName: initialSession.authorName, title: initialSession.title, displayStyle: "card" } };
      } else if (initialPost) {
        extractedCoverUrl = initialPost.coverUrl;
        newOverlay = { id: "post_"+Date.now(), type: "POST", x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1, payload: { postId: initialPost.id, authorName: initialPost.authorName, text: initialPost.text, displayStyle: "card" } };
      }
      if (newOverlay) {
        if (extractedCoverUrl) {
           setDraftMediaUrl(extractedCoverUrl);
           setDraftMediaType("IMAGE");
        }
        setOverlays([newOverlay]);
        setMode("EDIT");
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
        sessionId: initialSession?.id,
        postId: initialPost?.id,
        // privacy,
        overlays
      });
      clearGlobalStoryDraft();
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
      
      {/* Discard Dialog Modal */}
      {showDiscardDialog && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="bg-card border border-border w-full max-w-xs rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-charcoal mb-1.5">Â¿Descartar historia?</h3>
              <p className="text-muted-foreground text-sm">Si sales ahora, perderÃ¡s todos los cambios que hayas hecho.</p>
            </div>
            <div className="flex flex-col gap-2.5 mt-2">
              <button 
                onClick={() => {
                  clearGlobalStoryDraft();
                  router.back();
                }}
                className="w-full py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-2xl transition-colors"
              >
                Descartar cambios
              </button>
              <button 
                onClick={() => setShowDiscardDialog(false)}
                className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-colors"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewer / Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={() => setSelectedOverlayId(null)}>
        <div ref={containerRef} {...bindBackgroundGestures()} className="relative w-full max-w-[400px] touch-none h-full max-h-[85vh] md:max-h-full bg-zinc-900 border border-white/10 md:rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          
          {/* Close Button Inside Card */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowDiscardDialog(true);
            }}
            className="absolute top-4 right-4 z-[100] w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors pointer-events-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <SharedStoryRenderer 
            mediaUrl={draftMediaUrl} 
            isVideo={draftMediaType === 'VIDEO'}
            background={background}
            overlays={[]} 
            mode="EDITOR"
          />
          {!draftMediaUrl && overlays.length === 0 && mode === 'EDIT' && (
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
              onDragStateChange={setIsDraggingOverlay}
              containerRef={containerRef}
            >
              <div className="pointer-events-none">
                {renderOverlayContent(o, "PREVIEW")}
              </div>
            </DraggableOverlay>
          ))}

          {/* Inline Text Editor Overlay (Modernized) */}
          {mode === 'TEXT' && (
            <div className="absolute inset-0 z-[300] flex flex-col bg-black/70 backdrop-blur-md pointer-events-auto touch-none" onClick={addText}>
              {/* Top Controls */}
              <div className="flex items-center justify-between p-4" onClick={e=>e.stopPropagation()}>
                <button onClick={() => setTextAlign(textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left')} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-white">
                  {textAlign === 'left' ? <AlignLeft size={20} /> : textAlign === 'center' ? <AlignCenter size={20} /> : <AlignRight size={20} />}
                </button>
                <button onClick={() => setTextBg(textBg === 'transparent' ? '#00000055' : textBg === '#00000055' ? textColor : 'transparent')} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-white font-bold text-xl">
                  A
                </button>
                <button onClick={addText} className="px-4 py-2 bg-white text-black font-bold rounded-full">
                  Listo
                </button>
              </div>

              {/* Text Area */}
              <div className="flex-1 flex items-center justify-center p-4">
                <textarea 
                  autoFocus 
                  value={textVal} 
                  onChange={e=>setTextVal(e.target.value)}
                  onClick={e=>e.stopPropagation()}
                  className="w-full bg-transparent outline-none resize-none leading-tight font-bold whitespace-pre-wrap break-words"
                  style={{ 
                    color: textBg === textColor ? (textColor === '#ffffff' ? '#000000' : '#ffffff') : textColor, 
                    backgroundColor: textBg, 
                    fontFamily: textFont, 
                    textAlign: textAlign,
                    fontSize: '2rem',
                    padding: textBg !== 'transparent' ? '0.5rem 1rem' : '0',
                    borderRadius: '0.5rem',
                    textShadow: textBg === 'transparent' ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'
                  }}
                  rows={3}
                  placeholder="Escribe algo..."
                />
              </div>

              {/* Bottom Controls */}
              <div className="mt-auto bg-card border-t md:border border-border rounded-t-3xl md:rounded-3xl p-6 flex flex-col gap-6 shadow-2xl md:mb-6 md:mx-4" onClick={e=>e.stopPropagation()}>
                
                {/* Font Selector */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Fuente</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {TEXT_FONTS.map(font => (
                      <button key={font} onClick={() => setTextFont(font)} className={`px-5 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-colors ${textFont === font ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`} style={{fontFamily: font}}>
                        {font.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Color Selector */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Color</span>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {TEXT_COLORS.map(c => (
                      <button key={c} onClick={() => setTextColor(c)} className={`w-10 h-10 rounded-full shrink-0 border-2 transition-transform hover:scale-110 ${textColor === c ? 'border-primary' : 'border-border'}`} style={{backgroundColor: c}} />
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          )}

          {/* Trash Zone */}
          {isDraggingOverlay && (
            <div 
              id="story-trash" 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-black/50 backdrop-blur rounded-full flex items-center justify-center z-[200] border border-white/20 text-white shadow-2xl transition-all"
            >
              <Trash2 className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-80 bg-card border-t md:border-t-0 md:border-l border-border flex flex-col">
        
        {/* Editor Main Tools */}
        
      {/* Recipe Style Selector */}
      {selectedOverlayId && overlays.find(o => o.id === selectedOverlayId)?.type === 'RECIPE' && (
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full flex gap-2 z-[100] border border-border shadow-xl">
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
                className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {style}
              </button>
            )
          })}
        </div>
      )}

      {mode === 'EDIT' && (
          <div className="p-4 flex flex-col gap-4 h-full">
              <div className={`grid gap-2 ${draftMediaUrl ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {draftMediaUrl && (
                  <label className="flex flex-col items-center justify-center gap-1.5 p-3 bg-muted hover:bg-muted/80 rounded-2xl cursor-pointer transition-colors text-foreground">
                    <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                    <ImageIcon size={22} className="text-primary"/>
                    <span className="text-[11px] font-bold">Fondo</span>
                  </label>
                )}
                <button onClick={() => setMode('TEXT')} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-foreground">
                  <AlignLeft size={22} className="text-primary"/>
                  <span className="text-[11px] font-bold">Texto</span>
                </button>
                <button onClick={() => setMode('DRAW')} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-foreground">
                  <Paintbrush size={22} className="text-primary"/>
                  <span className="text-[11px] font-bold">Dibujar</span>
                </button>
                <button onClick={() => setMode('STICKER')} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-foreground">
                  <Sparkles size={22} className="text-primary"/>
                  <span className="text-[11px] font-bold">Stickers</span>
                </button>
              </div>
            
            <div className="mt-auto space-y-4">
              <select value={privacy} onChange={e => setPrivacy(e.target.value as 'PUBLIC'|'FOLLOWERS')} className="w-full bg-muted text-foreground font-medium rounded-2xl p-4 border border-border outline-none focus:border-primary">
                <option value="PUBLIC">ðŸŒŽ PÃºblico</option>
                <option value="FOLLOWERS">ðŸ‘¥ Seguidores</option>
              </select>
              <button onClick={handlePublish} disabled={isPublishing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold p-4 rounded-2xl transition-colors shadow-sm">
                {isPublishing ? 'Publicando...' : 'Compartir Historia'}
              </button>
            </div>
          </div>
        )}

        {/* Draw Mode */}
        {mode === 'DRAW' && (
          <div className="p-5 flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">Color</span>
              <div className="flex flex-wrap gap-3 justify-center">
                {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(c => (
                  <button key={c} onClick={()=>setDrawColor(c)} className="w-10 h-10 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110" style={{backgroundColor: c, borderColor: drawColor===c ? 'var(--primary)' : 'transparent'}} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">Grosor</span>
              <div className="flex gap-4 justify-center items-center px-4">
                <button onClick={()=>setDrawSize(5)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${drawSize===5?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </button>
                <button onClick={()=>setDrawSize(10)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${drawSize===10?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`}>
                  <div className="w-4 h-4 rounded-full bg-current" />
                </button>
                <button onClick={()=>setDrawSize(20)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${drawSize===20?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`}>
                  <div className="w-6 h-6 rounded-full bg-current" />
                </button>
              </div>
            </div>
            
            <div className="mt-auto flex flex-col gap-3">
              <button onClick={() => {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) ctx.clearRect(0,0,400,711);
                setCanvasUndoStack([]);
              }} className="p-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-colors">
                Borrar Todo
              </button>
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
              }} disabled={canvasUndoStack.length === 0} className="p-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl disabled:opacity-50 transition-colors">
                Deshacer trazo
              </button>
  
              <button onClick={() => setMode('EDIT')} className="mt-2 p-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-colors shadow-sm">Hecho</button>
            </div>
          </div>
        )}

        {/* Sticker Tray Mode */}
        {mode === 'STICKER' && (
          <div className="flex flex-col h-full relative">
            {!activeStickerType ? (
              <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto">
                <button onClick={() => setActiveStickerType('MENTION')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><User size={18} className="text-primary"/> MenciÃ³n</button>
                <button onClick={() => setActiveStickerType('LOCATION')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><MapPin size={18} className="text-primary"/> UbicaciÃ³n</button>
                <button onClick={() => setActiveStickerType('RECIPE')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><ChefHat size={18} className="text-primary"/> Receta</button>
                <button onClick={() => setActiveStickerType('INGREDIENT')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><Apple size={18} className="text-primary"/> Ingrediente</button>
                <button onClick={() => setActiveStickerType('SESSION')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><ChefHat size={18} className="text-primary"/> SesiÃ³n</button>
                <button onClick={() => setActiveStickerType('PROFILE')} className="bg-muted hover:bg-muted/80 text-foreground p-4 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"><User size={18} className="text-primary"/> Perfil</button>

              </div>
            ) : (
              <div className="absolute inset-0 z-10 bg-card flex flex-col">
                <div className="p-2 border-b border-border flex items-center">
                  <button onClick={() => setActiveStickerType(null)} className="text-muted-foreground hover:text-foreground font-medium p-2 transition-colors">Volver</button>
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
              <div className="mt-auto p-4 border-t border-border">
                <button onClick={() => setMode('EDIT')} className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold p-4 rounded-2xl transition-colors">Cancelar</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


