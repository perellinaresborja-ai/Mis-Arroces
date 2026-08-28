"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay } from '@/types/stories';
import { createClient } from '@/lib/supabase/client';
import { createStory } from '@/app/actions/stories';

export function StoryCreator({ 
  initialMedia, 
  initialRecipe 
}: { 
  initialMedia?: { url: string, type: 'IMAGE'|'VIDEO' },
  initialRecipe?: { id: string, name: string, coverUrl?: string } 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [overlays, setOverlays] = useState<StoryOverlay[]>([]);
  const [history, setHistory] = useState<StoryOverlay[][]>([]);
  const [transform, setTransform] = useState<StoryTransform>({ scale: 1, translateX: 0, translateY: 0, rotation: 0 });
  const [background, setBackground] = useState<StoryBackground>({ type: 'blur', value: '' });
  
  // States for tools
  const [mode, setMode] = useState<'EDIT'|'DRAW'|'TEXT'|'STICKER'>('EDIT');
  const [allowReplies, setAllowReplies] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [privacy, setPrivacy] = useState<'PUBLIC'|'FOLLOWERS'>('PUBLIC');
  const [activeStickerType, setActiveStickerType] = useState<string | null>(null);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawSize, setDrawSize] = useState(5);
  const [currentPath, setCurrentPath] = useState<{x:number, y:number}[]>([]);
  const [drawings, setDrawings] = useState<DrawingOverlay['payload']['paths']>([]);

  // Text state
  const [textVal, setTextVal] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBg, setTextBg] = useState('transparent');
  const [textFont, setTextFont] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState<'left'|'center'|'right'>('center');

  // Generic sticker input state
  const [stickerInput, setStickerInput] = useState('');

  const saveHistory = () => setHistory([...history, [...overlays]]);
  const undo = () => { if(history.length > 0) { setOverlays(history[history.length-1]); setHistory(history.slice(0, -1)); } };

  // Drawing logic
  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'DRAW') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (mode !== 'DRAW' || currentPath.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentPath([...currentPath, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };
  const handlePointerUp = () => {
    if (mode !== 'DRAW' || currentPath.length === 0) return;
    setDrawings([...drawings, { points: currentPath, color: drawColor, strokeWidth: drawSize }]);
    setCurrentPath([]);
  };

  const addOverlay = (overlay: StoryOverlay) => {
    saveHistory();
    setOverlays([...overlays, overlay]);
  };

  const addText = () => {
    if (!textVal) return;
    addOverlay({
      id: 'text_'+Date.now(), type: 'TEXT', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length,
      payload: { text: textVal, color: textColor, backgroundColor: textBg, align: textAlign, fontFamily: textFont }
    });
    setMode('EDIT'); setTextVal('');
  };

  const submitSticker = () => {
    if (!activeStickerType || !stickerInput) return;
    let payload: any = {};
    if (activeStickerType === 'MENTION') payload = { userId: 'mock', username: stickerInput };
    if (activeStickerType === 'LOCATION') payload = { name: stickerInput };
    if (activeStickerType === 'INGREDIENT') payload = { ingredientId: 'mock', name: stickerInput };
    if (activeStickerType === 'PROFILE') payload = { userId: 'mock', username: stickerInput };
    if (activeStickerType === 'SESSION') payload = { sessionId: 'mock', authorName: stickerInput };
    
    addOverlay({
      id: activeStickerType+'_'+Date.now(), type: activeStickerType as any, x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload
    });
    setMode('EDIT'); setActiveStickerType(null); setStickerInput('');
  };

  const applyTemplate = (t: string) => {
    if (t === 'blur') setBackground({ type: 'blur', value: '' });
    if (t === 'color') setBackground({ type: 'color', value: '#000000' });
  };

  const moveLayer = (idx: number, dir: 1|-1) => {
    saveHistory();
    const newO = [...overlays];
    const target = idx + dir;
    if (target >= 0 && target < newO.length) {
      [newO[idx], newO[target]] = [newO[target], newO[idx]];
      newO.forEach((o, i) => o.zIndex = i);
      setOverlays(newO);
    }
  };

  const removeLayer = (idx: number) => {
    saveHistory();
    setOverlays(overlays.filter((_, i) => i !== idx));
  };

  const publish = async () => {
    let finalOverlays = [...overlays];
    if (drawings.length > 0) {
      finalOverlays.push({
        id: 'draw_'+Date.now(), type: 'DRAWING', x: 0, y: 0, scale: 1, rotation: 0, zIndex: finalOverlays.length,
        payload: { paths: drawings }
      });
    }

    try {
      await createStory({
        mediaTransform: transform,
        overlays: finalOverlays,
        background: background,
        caption: textVal || undefined, // or handled via overlay
        recipeId: initialRecipe?.id
      });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-neutral-900 flex flex-col overflow-hidden text-white">
      <div className="flex justify-between items-center p-4 z-50 bg-black/40">
        <button onClick={() => router.back()}>Cancel</button>
        <div className="flex gap-2">
          <button onClick={undo} className="px-2">Undo</button>
          <button onClick={() => setMode('DRAW')}>Draw</button>
          <button onClick={() => setMode('TEXT')}>Text</button>
          <button onClick={() => setMode('STICKER')}>Stickers</button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[400px] bg-zinc-800" style={{ aspectRatio: '9/16' }}>
          {initialMedia && (
            <img src={initialMedia.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
          )}
          
          {overlays.map((o, i) => (
            <div key={o.id} className="absolute border border-transparent hover:border-white p-1" style={{ left: (o.x*100)+'%', top: (o.y*100)+'%', transform: "translate(-50%, -50%) scale(" + o.scale + ")", zIndex: o.zIndex }}>
              {o.type === 'TEXT' && <div style={{ color: o.payload.color, backgroundColor: o.payload.backgroundColor, fontFamily: o.payload.fontFamily, textAlign: o.payload.align as any }}>{o.payload.text}</div>}
              {o.type !== 'TEXT' && <div className="bg-white text-black p-2 rounded">{o.type}</div>}
              
              <div className="flex gap-1 mt-1 bg-black/50 p-1 rounded">
                <button onClick={() => moveLayer(i, 1)}>⬆️</button>
                <button onClick={() => moveLayer(i, -1)}>⬇️</button>
                <button onClick={() => removeLayer(i)}>🗑️</button>
              </div>
            </div>
          ))}

          <canvas 
            ref={canvasRef}
            width={400} height={711}
            className="absolute inset-0 z-40 touch-none"
            style={{ pointerEvents: mode === 'DRAW' ? 'auto' : 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
      </div>

      {mode === 'EDIT' && (
        <div className="absolute top-20 right-4 flex flex-col gap-2 z-50">
          <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'poll_'+Date.now(), type: 'POLL', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: '¿Cuál prefieres?', optionA: 'Opción A', optionB: 'Opción B' } }])} title="Encuesta">📊</button>
          <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'q_'+Date.now(), type: 'QUESTION', x: 0.5, y: 0.6, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: 'Hazme una pregunta' } }])} title="Pregunta">❓</button>
          <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'slider_'+Date.now(), type: 'SLIDER', x: 0.5, y: 0.7, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: '¿Cuánto te gusta?', emoji: '😋' } }])} title="Slider">🎚️</button>
          <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setMode('DRAW')} title="Dibujar">🖌️</button>
          <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setAllowReplies(!allowReplies)} title={allowReplies ? 'Respuestas permitidas' : 'Respuestas bloqueadas'}>
            {allowReplies ? '💬' : '🔇'}
          </button>
        </div>
      )}

      {mode === 'DRAW' && (
        <div className="p-4 bg-black flex gap-4">
          <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} />
          <input type="range" min="1" max="20" value={drawSize} onChange={e => setDrawSize(Number(e.target.value))} />
          <button onClick={() => setMode('EDIT')}>Done</button>
        </div>
      )}

      {mode === 'TEXT' && (
        <div className="p-4 bg-black flex flex-col gap-2">
          <input type="text" value={textVal} onChange={e => setTextVal(e.target.value)} placeholder="Escribe algo..." className="text-black p-2 rounded" />
          <div className="flex gap-2">
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
            <select value={textFont} onChange={e => setTextFont(e.target.value)} className="text-black">
              <option value="sans-serif">Sans</option>
              <option value="serif">Serif</option>
              <option value="monospace">Mono</option>
            </select>
            <button onClick={addText} className="bg-primary px-4 py-1 rounded">Add Text</button>
          </div>
        </div>
      )}

      {mode === 'STICKER' && !activeStickerType && (
        <div className="p-4 bg-black grid grid-cols-4 gap-2">
          {['MENTION', 'LOCATION', 'POLL', 'QUESTION', 'SLIDER', 'INGREDIENT', 'SESSION', 'PROFILE', 'GIF', 'RECIPE'].map(t => (
            <button key={t} onClick={() => {
              if (['POLL','QUESTION','SLIDER','RECIPE'].includes(t)) {
                addOverlay({ id: t+'_'+Date.now(), type: t as any, x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: 'Question?', optionA: 'A', optionB: 'B', emoji: '😍', title: 'Recipe', recipeId: 'mock' } });
                setMode('EDIT');
              } else {
                setActiveStickerType(t);
              }
            }} className="bg-zinc-800 p-2 rounded text-xs">{t}</button>
          ))}
          <button onClick={() => setMode('EDIT')} className="col-span-4 mt-2">Close</button>
        </div>
      )}

      {mode === 'STICKER' && activeStickerType && (
        <div className="p-4 bg-black flex gap-2">
          <input type="text" value={stickerInput} onChange={e => setStickerInput(e.target.value)} placeholder={"Buscar " + activeStickerType} className="text-black p-2 rounded flex-1" />
          <button onClick={submitSticker} className="bg-primary px-4 rounded">Add</button>
        </div>
      )}

      {mode === 'EDIT' && (
        <div className="p-4 bg-black flex flex-col gap-2">
          <div className="flex gap-2 mb-2 text-xs overflow-x-auto">
            <span>Templates:</span>
            <button onClick={() => applyTemplate('blur')} className="bg-zinc-800 px-2 rounded">Blur</button>
            <button onClick={() => applyTemplate('color')} className="bg-zinc-800 px-2 rounded">Color</button>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4">
              <label><input type="checkbox" checked={allowReplies} onChange={e=>setAllowReplies(e.target.checked)}/> Replies</label>
              <label><input type="checkbox" checked={allowReactions} onChange={e=>setAllowReactions(e.target.checked)}/> Reactions</label>
              <select value={privacy} onChange={e=>setPrivacy(e.target.value as any)} className="bg-zinc-800 rounded">
                <option value="PUBLIC">Public</option>
                <option value="FOLLOWERS">Followers</option>
              </select>
            </div>
            <button onClick={publish} className="bg-primary px-6 py-2 rounded-full font-bold">Publicar</button>
          </div>
        </div>
      )}
    </div>
  );
}
