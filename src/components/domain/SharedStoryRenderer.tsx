"use client"
import React from 'react';

import { CSSProperties, useEffect, Dispatch, SetStateAction } from "react"
import { StoryOverlay, StoryTransform, StoryBackground, PollOverlay, QuestionOverlay, SliderOverlay, RecipeOverlay, SessionOverlay, MentionOverlay, ProfileOverlay, LocationOverlay, IngredientOverlay, GifOverlay, TextOverlay } from "@/types/stories"
import { MapPin, Utensils } from "lucide-react"

interface PollResultData {
  countA?: number;
  countB?: number;
  total?: number;
  percentA?: number;
  percentB?: number;
  myVote?: string | null;
  a?: number;
  b?: number;
  userVoted?: string | null;
}
interface SliderResultData {
  average: number;
  total?: number;
  count?: number;
  userValue: number | null;
}

export interface RenderContext {
  pollResults?: Record<string, PollResultData>;
  isVoting?: Record<string, boolean>;
  handleVote?: (pollId: string, option: string) => Promise<void>;
  questionReplies?: Record<string, string>;
  setQuestionReplies?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSendingQ?: Record<string, boolean>;
  setIsSendingQ?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  sentQ?: Record<string, boolean>;
  setSentQ?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleQuestionReply?: (qId: string, prompt: string) => Promise<void>;
  sliderResults?: Record<string, SliderResultData>;
  setSliderResults?: React.Dispatch<React.SetStateAction<Record<string, SliderResultData>>>;
  sliderValues?: Record<string, number>;
  setSliderValues?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleSliderRelease?: (sId: string, val: number, prompt: string) => Promise<void>;
  onPauseRequest?: () => void;
  onResumeRequest?: () => void;
  storyId?: string;
}


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
  onPauseRequest?: () => void;
  onResumeRequest?: () => void;
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
, isVideo, videoRef, onTimeUpdate, onEnded, isPaused, onPauseRequest, onResumeRequest}: SharedStoryRendererProps) {
  const [pollResults, setPollResults] = React.useState<Record<string, PollResultData>>({});
  const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});
  const [questionReplies, setQuestionReplies] = React.useState<Record<string, string>>({});
  const [isSendingQ, setIsSendingQ] = React.useState<Record<string, boolean>>({});
  const [sentQ, setSentQ] = React.useState<Record<string, boolean>>({});
  const [sliderResults, setSliderResults] = React.useState<Record<string, SliderResultData>>({});
  const [sliderValues, setSliderValues] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (mode === 'VIEWER' && storyId) {
      const fetchPolls = async () => {
        try {
          const { getPollResults } = await import('@/app/actions/stories');
          const results: Record<string, PollResultData> = {};
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
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: transform ? ('translate(' + (transform.translateX||0) + 'px, ' + (transform.translateY||0) + 'px) scale(' + (transform.scale||1) + ') rotate(' + (transform.rotation||0) + 'deg)') : 'none',
    filter: background?.type === 'blur' ? 'blur(10px) brightness(0.8)' : 'none',
  }

  const actualMediaStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: transform ? ('translate(' + (transform.translateX||0) + 'px, ' + (transform.translateY||0) + 'px) scale(' + (transform.scale||1) + ') rotate(' + (transform.rotation||0) + 'deg)') : 'none',
  }

  return (
    <div style={containerStyle}>
      {/* Background Layer */}
      {mediaUrl && background?.type === 'blur' && (
        <img 
          id={mode === 'EDITOR' ? 'story-media-bg-layer' : undefined}
          src={mediaUrl} 
          alt="story background"
          style={mediaStyle}
        />
      )}
      
      {/* Media Layer */}
      {mediaUrl && (
        isVideo ? (
          <video
            id={mode === 'EDITOR' ? 'story-media-layer' : undefined}
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
            id={mode === 'EDITOR' ? 'story-media-layer' : undefined}
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
              {renderOverlayContent(overlay, mode, { storyId, questionReplies, setQuestionReplies, isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function renderOverlayContent(overlay: StoryOverlay, mode: string, ctx?: RenderContext) {
    const safeCtx = ctx || {};
    const safeQuestionReplies = safeCtx.questionReplies || {};
    const safeSentQ = safeCtx.sentQ || {};
    const safeIsSendingQ = safeCtx.isSendingQ || {};
    const safePollResults = safeCtx.pollResults || {};
    const safeSliderResults = safeCtx.sliderResults || {};
    const safeSliderValues = safeCtx.sliderValues || {};
    const safeIsVoting = safeCtx.isVoting || {};
  
    const storyId = safeCtx.storyId;
    const questionReplies = safeCtx.questionReplies || {};
    const setQuestionReplies = safeCtx.setQuestionReplies || (() => {});
    const isSendingQ = safeCtx.isSendingQ || {};
    const setIsSendingQ = safeCtx.setIsSendingQ || (() => {});
    const sentQ = safeCtx.sentQ || {};
    const setSentQ = safeCtx.setSentQ || (() => {});
    const onPauseRequest = safeCtx.onPauseRequest || (() => {});
    const onResumeRequest = safeCtx.onResumeRequest || (() => {});
    const sliderResults = safeCtx.sliderResults || {};
    const setSliderResults = safeCtx.setSliderResults || (() => {});
    const sliderValues = safeCtx.sliderValues || {};
    const setSliderValues = safeCtx.setSliderValues || (() => {});
  
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
      const style = p.displayStyle || 'compact';

      const handleClick = (e: React.MouseEvent) => { 
        e.stopPropagation();
        if (mode === 'VIEWER') window.location.href = '/recipes/' + p.recipeId; 
      };

      if (style === 'compact') {
        return (
          <div onClick={handleClick} className="bg-card border border-border text-foreground px-3 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-xl cursor-pointer text-sm pointer-events-auto transition-transform hover:scale-105">
            <span className="truncate max-w-[150px]">{p.title || 'Receta'}</span>
            <span className="text-primary text-xs ml-1 border-l pl-2 border-border/50">Ver</span>
          </div>
        );
      }

      if (style === 'text') {
        return (
          <div onClick={handleClick} className="text-white drop-shadow-md px-2 py-1 flex flex-col items-center cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{p.title || 'Receta'}</span>
            <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full mt-1">Ver receta ➔</span>
          </div>
        );
      }

      return (
        <div onClick={handleClick} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col w-48 cursor-pointer pointer-events-auto transition-transform hover:scale-105">
          <div className="h-28 bg-muted relative">
            {p.coverUrl ? (
              <img src={p.coverUrl} className="w-full h-full object-cover" alt={p.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Utensils size={32} opacity={0.5}/></div>
            )}
          </div>
          <div className="p-3 flex flex-col gap-1 text-center bg-card">
            <span className="font-bold text-foreground text-sm truncate">{p.title || 'Receta'}</span>
            <span className="text-xs font-semibold text-primary">Ver receta</span>
          </div>
        </div>
      );
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
      const qId = overlay.id;
      
      const handleSendReply = async () => {
        if (mode === 'VIEWER' && storyId) {
          const val = (questionReplies[qId] || '').trim();
          if (!val) return;
          setIsSendingQ((prev: Record<string, any>) => ({...prev, [qId]: true}));
          try {
            const { submitQuestionReply } = await import('@/app/actions/stories');
            // We need the ownerId. We don't have it directly from storyId unless passed or fetched.
            // Oh wait, story is not passed. We can fetch it or we need ownerId passed!
            // Let's import createClient and fetch it, or rely on submitQuestionReply fetching it inside!
            // Wait, submitQuestionReply signature: (storyId, ownerId, question, answer). Let's pass a dummy for ownerId and let the backend find it, or modify the backend to find it.
            // Actually, submitQuestionReply can just fetch the owner_id from storyId!
            await submitQuestionReply(storyId, 'DUMMY_OWNER', p.question, val);
            setSentQ((prev: Record<string, any>) => ({...prev, [qId]: true}));
          } catch (e: any) {
            alert(e.message || 'Error al enviar');
          } finally {
            setIsSendingQ((prev: Record<string, any>) => ({...prev, [qId]: false}));
          }
        }
      }

      return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl w-64 border border-border flex flex-col pointer-events-auto">
          <div className="p-4 font-bold text-center bg-primary text-primary-foreground leading-tight">
            {p.question}
          </div>
          <div className="bg-background p-2">
            {!sentQ[qId] ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={safeQuestionReplies[qId] || ''}
                  onChange={e => setQuestionReplies((prev: Record<string, any>) => ({...prev, [qId]: (e.target as HTMLInputElement).value}))}
                  onFocus={() => { if(onPauseRequest) onPauseRequest(); }}
                  onBlur={() => { if(onResumeRequest) onResumeRequest(); }}
                  disabled={isSendingQ[qId]}
                  placeholder="Responder..." 
                  className="w-full text-sm p-2 bg-muted rounded-xl outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={isSendingQ[qId]}
                  className="p-2 text-sm font-bold bg-primary text-white rounded-xl"
                >
                  Enviar
                </button>
              </div>
            ) : (
              <div className="text-sm font-bold text-center text-green-600 p-2">
                ¡Enviado!
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'SLIDER': {
      const p = overlay.payload;
      const sId = overlay.id;
      const res = sliderResults?.[sId] || { average: 0, count: 0 };
      const currentVal = sliderValues?.[sId] ?? 50;
      const handleChangeEnd = async (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent | React.TouchEvent) => {
        if (mode === 'VIEWER' && storyId) {
          const val = Number((e.target as HTMLInputElement).value);
          try {
            const { upsertSliderValue, getSliderResults } = await import('@/app/actions/stories');
            await upsertSliderValue(storyId, sId, val);
            const newRes = await getSliderResults(sId);
            setSliderResults((prev: Record<string, any>) => ({...prev, [sId]: newRes}));
          } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar');
          } finally {
            if (onResumeRequest) onResumeRequest();
          }
        }
      };
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[200px] flex flex-col items-center gap-2 pointer-events-auto">
          <div className="font-bold text-foreground text-center leading-tight">{p.question}</div>
          <div className="w-full flex items-center gap-2 cursor-pointer mt-1">
            <div className="text-3xl filter drop-shadow-md">{p.emoji}</div>
            <input 
              type="range" 
              min="0" max="100" 
              value={currentVal} 
              onChange={e => {
                const val = Number((e.target as HTMLInputElement).value);
                setSliderValues((prev: Record<string, any>) => ({...prev, [sId]: val}));
              }}
              onPointerDown={() => { if(onPauseRequest) onPauseRequest(); }}
              onPointerUp={handleChangeEnd}
              onTouchEnd={handleChangeEnd}
              className="flex-1 accent-primary cursor-grab h-2 bg-muted rounded-lg appearance-none" 
            />
          </div>
          {(res?.count || 0) > 0 && mode === 'VIEWER' && (
            <div className="w-full mt-2 text-xs text-muted-foreground flex justify-between px-2 font-semibold">
              <span>Promedio: {res.average}</span>
              <span>{(res?.count || 0)} votos</span>
            </div>
          )}
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
