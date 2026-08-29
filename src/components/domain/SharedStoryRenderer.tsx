"use client"
import React from 'react';

import { CSSProperties, useEffect } from "react"
import { StoryOverlay, StoryTransform, StoryBackground, PollOverlay, QuestionOverlay, SliderOverlay, RecipeOverlay, SessionOverlay, MentionOverlay, ProfileOverlay, LocationOverlay, IngredientOverlay, GifOverlay, TextOverlay } from "@/types/stories"
import { MapPin, Utensils } from "lucide-react"

interface SharedStoryRendererProps {
  storyId?: string;
  isVideo?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onTimeUpdate?: () => void;
  onEnded?: () => void;
  isPaused?: boolean;
  mediaUrl?: string | null;
  transform?: StoryTransform | null;
  background?: StoryBackground | null;
  overlays: StoryOverlay[];
  mode: 'EDITOR' | 'PREVIEW' | 'VIEWER';
  onOverlayClick?: (overlay: StoryOverlay) => void;
  selectedOverlayId?: string | null;
}

export function SharedStoryRenderer({
  storyId,
  mediaUrl,
  transform,
  background,
  overlays,
  mode,
  onOverlayClick,
  selectedOverlayId
, isVideo, videoRef, onTimeUpdate, onEnded, isPaused}: SharedStoryRendererProps) {
  const [pollResults, setPollResults] = React.useState<Record<string, any>>({});
  const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (mode === 'VIEWER' && storyId) {
      const fetchPolls = async () => {
        try {
          const { getPollResults } = await import('@/app/actions/stories');
          const results: Record<string, any> = {};
          for (const ov of overlays || []) {
            if (ov.type === 'POLL') {
              const pollId = ov.payload.pollId || ov.id;
              results[pollId] = await getPollResults(pollId);
            }
          }
          setPollResults(results);
        } catch (e) {
          console.error('Error fetching poll results', e);
        }
      };
      fetchPolls();
    }
  }, [storyId, mode]);

  
  // Pause/play effect
  useEffect(() => {
    if (isVideo && videoRef?.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
      }
    }
  }, [isPaused, isVideo, videoRef]);
  
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    aspectRatio: '9/16',
    overflow: 'hidden',
    backgroundColor: background?.type === 'color' ? background.value : '#18181B', // zinc-900
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: transform ? ('translate(' + transform.translateX + 'px, ' + transform.translateY + 'px) scale(' + transform.scale + ')') : 'none',
    filter: background?.type === 'blur' ? 'blur(10px) brightness(0.8)' : 'none',
  }

  const actualMediaStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: transform ? ('translate(' + transform.translateX + 'px, ' + transform.translateY + 'px) scale(' + transform.scale + ')') : 'none',
  }

  return (
    <div style={containerStyle}>
      {/* Background Layer */}
      {mediaUrl && background?.type === 'blur' && (
        <img 
          src={mediaUrl} 
          alt="story background"
          style={mediaStyle}
        />
      )}
      
      {/* Media Layer */}
      {mediaUrl && (
        isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            style={actualMediaStyle}
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            playsInline
            muted={mode === 'EDITOR'}
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="story content"
            style={actualMediaStyle}
          />
        )
      )}

      {/* Overlays Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {overlays.map((overlay) => {
          const isSelected = mode === 'EDITOR' && selectedOverlayId === overlay.id;
          
          const overlayStyle: CSSProperties = {
            position: 'absolute',
            left: (overlay.x * 100 + '%'),
            top: (overlay.y * 100 + '%'),
            transform: ('translate(-50%, -50%) scale(' + overlay.scale + ') rotate(' + overlay.rotation + 'deg)'),
            zIndex: overlay.zIndex + 10,
            pointerEvents: (mode === 'EDITOR' || ['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE'].includes(overlay.type)) ? 'auto' : 'none',
            cursor: mode === 'EDITOR' ? 'grab' : 'default',
            boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none', // highlight if selected
          }

          return (
            <div 
              key={overlay.id} 
              style={overlayStyle}
              onClick={(e) => {
                if (['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE'].includes(overlay.type)) {
                  e.stopPropagation();
                }
                if (mode === 'EDITOR' && onOverlayClick) {
                  e.stopPropagation();
                  onOverlayClick(overlay);
                }
              }}
              onTouchStart={(e) => {
                if (mode === 'EDITOR' && onOverlayClick) {
                  e.stopPropagation();
                  onOverlayClick(overlay);
                }
              }}
            >
              {renderOverlayContent(overlay, mode)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function renderOverlayContent(overlay: StoryOverlay, mode: string) {
  switch (overlay.type) {
    case 'TEXT': {
      const p = overlay.payload;
      return (
        <div className="px-4 py-2 font-bold text-center whitespace-pre-wrap break-words" style={{ color: p.color, backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, textAlign: p.align, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          {p.text}
        </div>
      );
    }
    case 'MENTION': {
      const p = overlay.payload;
      return <div className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full font-bold shadow-lg cursor-pointer" onClick={() => { if (mode === 'VIEWER') window.location.href = '/' + p.username; }}>@{p.username}</div>;
    }
    case 'LOCATION': {
      const p = overlay.payload;
      return <div className="bg-white/90 text-black px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-lg cursor-pointer"><MapPin className="w-4 h-4"/> {p.name}</div>;
    }
    case 'RECIPE': {
      const p = overlay.payload;
      const handleClick = () => { if (mode === 'VIEWER') window.location.href = '/recipes/' + p.recipeId; };
      if (p.displayStyle === 'compact') {
        return <div onClick={handleClick} className="bg-card border border-border text-foreground px-3 py-1 rounded-full font-bold flex items-center gap-2 shadow-xl cursor-pointer text-xs"><Utensils className="w-3 h-3"/> {p.title}</div>;
      }
      if (p.displayStyle === 'text') {
        return <div onClick={handleClick} className="text-white font-bold text-lg drop-shadow-md cursor-pointer">{p.title} ↗</div>;
      }
      // Default Card
      return <div onClick={handleClick} className="bg-card/95 border border-border text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl cursor-pointer"><Utensils className="w-5 h-5"/> <div><div className="text-xs text-muted-foreground">Receta</div><div className="text-sm">{p.title}</div></div></div>;
    }
    case 'INGREDIENT': {
      const p = overlay.payload;
      return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold shadow-lg text-sm cursor-pointer">{p.name}</div>;
    }
    case 'PROFILE': {
      const p = overlay.payload;
      return <div className="bg-background text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-border cursor-pointer" onClick={() => { if (mode === 'VIEWER') window.location.href = '/' + p.username; }}>👤 {p.username}</div>;
    }
    case 'SESSION': {
      const p = overlay.payload;
      return <div className="bg-orange-100 text-orange-900 px-3 py-1 rounded-xl font-bold shadow-lg text-sm flex flex-col items-center cursor-pointer" onClick={() => { if (mode === 'VIEWER') window.location.href = '/sessions/' + p.sessionId; }}><div>🔥 Sesión</div><div className="text-xs opacity-80">{p.authorName}</div></div>;
    }
    case 'POLL': {
      const p = overlay.payload;
      const handlePollVote = async (opt: 'A'|'B') => {
        if (mode === 'VIEWER') {
          try {
            const { votePoll } = await import('@/app/actions/stories');
            await votePoll("mock", overlay.id, opt);
            alert('Voto registrado');
          } catch (e) {
            console.error(e)
          }
        }
      };
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-border/50 min-w-[200px] pointer-events-auto">
          <div className="p-3 text-center font-bold text-foreground border-b border-border/50">{p.question}</div>
          <div className="flex divide-x divide-border/50">
            <button onClick={() => handlePollVote('A')} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{p.optionA}</button>
            <button onClick={() => handlePollVote('B')} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{p.optionB}</button>
          </div>
        </div>
      );
    }
    case 'QUESTION': {
      const p = overlay.payload;
      const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('answer') as HTMLInputElement;
        if (mode === 'VIEWER' && input) {
          try {
            const { submitQuestionReply } = await import('@/app/actions/stories');
            await submitQuestionReply("mock", "mock-owner", p.question, input.value);
            input.value = '';
            alert('Respuesta enviada a DM');
          } catch (err) {
            console.error(err)
          }
        }
      };
      return (
        <form onSubmit={handleQuestionSubmit} className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[220px] flex flex-col gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{p.question}</div>
          <input name="answer" type="text" placeholder="Escribe tu respuesta..." className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-border cursor-text" />
          <button type="submit" className="bg-primary text-primary-foreground font-bold rounded-xl py-2 text-sm cursor-pointer">Enviar a DM</button>
        </form>
      );
    }
    case 'SLIDER': {
      const p = overlay.payload;
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[200px] flex flex-col items-center gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{p.question}</div>
          <div className="w-full flex items-center gap-2 cursor-pointer">
            <div className="text-2xl">{p.emoji}</div>
            <input type="range" min="0" max="100" defaultValue="50" className="flex-1 accent-primary cursor-grab" />
          </div>
        </div>
      );
    }
    case 'GIF': {
      const p = overlay.payload;
      return <img src={p.url} className="w-32 h-auto rounded-lg shadow-lg pointer-events-none" alt="gif" />;
    }
    default:
      return null;
  }
}
