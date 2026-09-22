"use client"
import React from 'react';

import { CSSProperties, useEffect, Dispatch, SetStateAction } from "react"
import { StoryOverlay, StoryTransform, StoryBackground, PollOverlay, QuestionOverlay, SliderOverlay, RecipeOverlay, SessionOverlay, MentionOverlay, ProfileOverlay, LocationOverlay, IngredientOverlay, GifOverlay, TextOverlay } from "@/types/stories"
import { MapPin, Utensils, ChefHat } from "lucide-react"
import { votePoll, getPollResults, submitQuestionReply, upsertSliderValue, getSliderResults } from "@/app/actions/stories"
import { cleanIngredientName } from "./stories/StickerPickers"

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
  setPollResults?: React.Dispatch<React.SetStateAction<Record<string, PollResultData>>>;
  isVoting?: Record<string, boolean>;
  setIsVoting?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
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
  musicConfig?: any;
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
  musicConfig,
  mode,
  onOverlayClick,
  selectedOverlayId
, isVideo, videoRef, onTimeUpdate, onEnded, isPaused, onPauseRequest, onResumeRequest}: SharedStoryRendererProps) {
  const [pollResults, setPollResults] = React.useState<Record<string, PollResultData>>({});
  const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});

  const [musicTrackUrl, setMusicTrackUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (musicConfig?.track_id) {
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        (supabase as any).from('story_music_tracks').select('audio_url').eq('id', musicConfig.track_id).single().then(({ data }: any) => {
          if (data?.audio_url) {
            setMusicTrackUrl(data.audio_url);
          }
        });
      });
    }
  }, [musicConfig?.track_id]);

  useEffect(() => {
    if (audioRef.current && musicConfig) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        const p = audioRef.current.play();
        if (p !== undefined) {
          p.catch(e => {
            console.log("Audio autoplay blocked or failed:", e);
          });
        }
      }
    }
  }, [isPaused, musicConfig, musicTrackUrl]);

  useEffect(() => {
    if (audioRef.current && musicConfig) {
      audioRef.current.volume = musicConfig.music_volume ?? 1;
      // Start time initialization
      if (Math.abs(audioRef.current.currentTime - (musicConfig.start_time_ms / 1000)) > 1) {
        audioRef.current.currentTime = musicConfig.start_time_ms / 1000;
      }
    }
  }, [musicTrackUrl, musicConfig]);

  useEffect(() => {
    if (videoRef && videoRef.current && musicConfig?.original_audio_volume !== undefined) {
      videoRef.current.volume = musicConfig.original_audio_volume;
    }
  }, [videoRef, musicConfig]);

  // Clean up audio on unmount or track change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, []);

  const [questionReplies, setQuestionReplies] = React.useState<Record<string, string>>({});
  const [isSendingQ, setIsSendingQ] = React.useState<Record<string, boolean>>({});
  const [sentQ, setSentQ] = React.useState<Record<string, boolean>>({});
  const [sliderResults, setSliderResults] = React.useState<Record<string, SliderResultData>>({});
  const [sliderValues, setSliderValues] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (mode === 'VIEWER' && storyId) {
      const fetchPolls = async () => {
        try {
          const results: Record<string, PollResultData> = {};
          for (const ov of overlays || []) {
            if (ov.type === 'POLL') {
              const pollId = ov.payload.pollId || ov.id;
              results[pollId] = await getPollResults(pollId, storyId);
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
    transition: 'none',
  }

  const actualMediaStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: transform ? ('translate(' + (transform.translateX||0) + 'px, ' + (transform.translateY||0) + 'px) scale(' + (transform.scale||1) + ') rotate(' + (transform.rotation||0) + 'deg)') : 'none',
    transition: 'none',
  }

  return (
    <div style={containerStyle}>
      {/* Hidden Audio element */}
      {musicTrackUrl && (
        <audio 
          ref={audioRef} 
          src={musicTrackUrl} 
          preload="metadata" 
          loop={false}
          className="hidden" 
        />
      )}
      
      {/* Background Layer */}

      
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
            pointerEvents: (mode === 'EDITOR' || ['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE', 'TEXT', 'LINK'].includes(overlay.type)) ? 'auto' : 'none',
            cursor: mode === 'EDITOR' ? 'grab' : 'default',
            boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none', // highlight if selected
          }

          return (
            <div 
              key={overlay.id} 
              style={overlayStyle}
              onClick={(e) => {
                if (['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE', 'TEXT', 'LINK'].includes(overlay.type)) {
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
              {renderOverlayContent(overlay, mode, { 
                storyId, 
                pollResults,
                isVoting,
                setIsVoting,
                setPollResults,
                questionReplies, 
                setQuestionReplies, 
                isSendingQ, 
                setIsSendingQ, 
                sentQ, 
                setSentQ, 
                onPauseRequest, 
                onResumeRequest 
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function renderOverlayContent(overlay: StoryOverlay, mode: string, ctx?: RenderContext) {
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
    const pollResults = safeCtx.pollResults || {};
    const setPollResults = safeCtx.setPollResults || (() => {});
    const isVoting = safeCtx.isVoting || {};
    const setIsVoting = safeCtx.setIsVoting || (() => {});
    const sliderResults = safeCtx.sliderResults || {};
    const setSliderResults = safeCtx.setSliderResults || (() => {});
    const sliderValues = safeCtx.sliderValues || {};
    const setSliderValues = safeCtx.setSliderValues || (() => {});
  
  switch (overlay.type) {
    case 'TEXT': {
      const p = overlay.payload;
      
      const renderRichText = (txt: string) => {
        if (!txt) return null;
        const words = txt.split(/(\s+)/);
        return words.map((w, i) => {
          const cleanW = w.replace(/[.,!?;:]$/, '');
          const punctuation = w.slice(cleanW.length);
          
          if (cleanW.startsWith('@') && cleanW.length > 1) {
            return <React.Fragment key={i}><span className="underline decoration-2 underline-offset-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); if(mode==='VIEWER') window.location.href = '/' + cleanW.substring(1); }}>{cleanW}</span>{punctuation}</React.Fragment>;
          }
          if (cleanW.startsWith('#') && cleanW.length > 1) {
            return <React.Fragment key={i}><span className="underline decoration-2 underline-offset-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); if(mode==='VIEWER') window.location.href = '/discover?q=' + encodeURIComponent(cleanW); }}>{cleanW}</span>{punctuation}</React.Fragment>;
          }
          if (cleanW.startsWith('http://') || cleanW.startsWith('https://')) {
            return <React.Fragment key={i}><a href={cleanW} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4 cursor-pointer" onClick={(e) => e.stopPropagation()}>{cleanW}</a>{punctuation}</React.Fragment>;
          }
          return w;
        });
      };

      return (
        <div className="px-4 py-2 font-bold text-center whitespace-pre-wrap break-words pointer-events-auto" style={{ color: p.color, backgroundColor: p.backgroundColor, fontFamily: p.fontFamily, textAlign: p.align, textShadow: p.backgroundColor === 'transparent' ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none' }}>
          {renderRichText(p.text)}
        </div>
      );
    }
    case 'MENTION': {
      const p = overlay.payload;
      return (
        <div 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl font-bold shadow-2xl flex items-center gap-1.5 border border-primary-foreground/20 cursor-pointer text-sm"
          onClick={() => { if (mode === 'VIEWER') window.location.href = '/' + p.username; }}
        >
          <span>@</span>
          <span>{p.username}</span>
        </div>
      );
    }
    case 'LOCATION': {
      const p = overlay.payload;
      return (
        <div 
          className="bg-card text-foreground px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-2xl border border-border cursor-pointer text-sm"
        >
          <MapPin className="w-4 h-4 text-primary shrink-0"/> 
          <span className="truncate max-w-[200px]">{p.name}</span>
        </div>
      );
    }
    case 'RECIPE': {
      const p = overlay.payload;
      const style = p.displayStyle || 'compact';

      const handleClick = (e: React.MouseEvent) => { 
        if (mode === 'VIEWER') { e.stopPropagation(); window.location.href = '/recipes/' + p.recipeId; } 
      };

      if (style === 'compact') {
        return (
          <div onClick={handleClick} className="bg-card border border-border text-foreground px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-2xl cursor-pointer text-sm pointer-events-auto transition-transform hover:scale-105">
            <ChefHat className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate max-w-[150px]">{p.title || 'Receta'}</span>
            <span className="text-primary text-xs ml-1 border-l pl-2 border-border font-semibold">Ver</span>
          </div>
        );
      }

      if (style === 'text') {
        return (
          <div onClick={handleClick} className="text-white drop-shadow-md px-3 py-1.5 flex flex-col items-center cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{p.title || 'Receta'}</span>
            <span className="text-xs bg-black/50 border border-white/20 px-3 py-1 rounded-full mt-1 font-medium">Ver receta →</span>
          </div>
        );
      }

      return (
        <div onClick={handleClick} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col w-48 cursor-pointer pointer-events-auto transition-transform hover:scale-105">
          <div className="p-3.5 flex flex-col gap-1 text-center bg-card">
            <span className="font-bold text-foreground text-sm truncate">{p.title || 'Receta'}</span>
            <span className="text-xs font-semibold text-primary">Ver receta</span>
          </div>
        </div>
      );
    }
    case 'INGREDIENT': {
      const p = overlay.payload;
      return (
        <div className="bg-card text-foreground px-4 py-2 rounded-2xl font-bold shadow-2xl text-sm border border-border flex items-center gap-2 cursor-pointer">
          <span className="text-base">🥘</span>
          <span>{cleanIngredientName(p.name)}</span>
        </div>
      );
    }
    case 'PROFILE': {
      const p = overlay.payload;
      return (
        <div 
          className="bg-card text-foreground px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-2xl border border-border cursor-pointer text-sm" 
          onClick={() => { if (mode === 'VIEWER') window.location.href = '/' + p.username; }}
        >
          <span className="text-primary">👤</span>
          <span>@{p.username}</span>
        </div>
      );
    }
    case 'SESSION': {
      const p = overlay.payload;
      const style = p.displayStyle || 'compact';
      const handleClick = (e: React.MouseEvent) => { 
        if (mode === 'VIEWER') { e.stopPropagation(); window.location.href = '/sessions/' + p.sessionId; } 
      };

      if (style === 'compact') {
        return (
          <div 
            className="bg-card text-foreground border border-border px-4 py-2 rounded-2xl font-bold shadow-2xl text-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 pointer-events-auto" 
            onClick={handleClick}
          >
            <span>🧑‍🍳</span> 
            <span className="truncate max-w-[150px]">{p.authorName || 'Cocinero'}</span> 
            <span className="text-primary text-xs ml-1 border-l pl-2 border-border font-semibold">Ver</span>
          </div>
        );
      }
      
      if (style === 'text') {
        return (
          <div onClick={handleClick} className="text-white drop-shadow-md px-3 py-1.5 flex flex-col items-center cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{p.title || `Sesión de ${p.authorName}`}</span>
            <span className="text-xs bg-black/50 border border-white/20 px-3 py-1 rounded-full mt-1 font-medium">Ver elaboración →</span>
          </div>
        );
      }

      return (
        <div onClick={handleClick} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col w-48 cursor-pointer pointer-events-auto transition-transform hover:scale-105">
          <div className="p-3.5 flex flex-col gap-1 text-center bg-card">
            <span className="font-bold text-foreground text-sm truncate">{p.title || `Sesión de ${p.authorName}`}</span>
            <span className="text-xs font-semibold text-primary">Ver elaboración</span>
          </div>
        </div>
      );
    }
    case 'POST': {
      const p = overlay.payload;
      const style = p.displayStyle || 'card';
      const handleClick = (e: React.MouseEvent) => { 
        if (mode === 'VIEWER') { e.stopPropagation(); window.location.href = '/posts/' + p.postId; } 
      };

      if (style === 'compact') {
        return (
          <div 
            className="bg-card border border-border text-foreground px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-2xl cursor-pointer text-sm pointer-events-auto transition-transform hover:scale-105" 
            onClick={handleClick}
          >
            <span>@{p.authorName}</span> 
            <span className="text-primary text-xs ml-1 border-l pl-2 border-border font-semibold">Ver</span>
          </div>
        );
      }

      if (style === 'text') {
        return (
          <div onClick={handleClick} className="text-white drop-shadow-md px-3 py-1.5 flex flex-col items-center cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg text-center max-w-[200px] truncate">{p.text || `Publicación de ${p.authorName}`}</span>
            <span className="text-xs bg-black/50 border border-white/20 px-3 py-1 rounded-full mt-1 font-medium">Ver publicación →</span>
          </div>
        );
      }

      return (
        <div onClick={handleClick} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col w-60 cursor-pointer pointer-events-auto transition-transform hover:scale-105">
          {p.coverUrl && (
            <img src={p.coverUrl} className="w-full aspect-square object-cover" />
          )}
          {!p.coverUrl && p.text && (<div className="p-4 bg-muted relative flex-1 flex items-center justify-center text-center"><p className="text-sm italic text-muted-foreground line-clamp-3">{p.text}</p></div>)}
          <div className="p-3.5 flex flex-col gap-1 text-center bg-card border-t border-border">
            <span className="font-bold text-foreground text-sm truncate">@{p.authorName}</span>
            {p.text && p.coverUrl && <p className="text-xs text-muted-foreground line-clamp-2 text-left mt-1">{p.text}</p>}
            <span className="text-xs font-semibold text-primary mt-1">Ver publicación</span>
          </div>
        </div>
      );
    }
    case 'POLL': {
      const p = overlay.payload;
      const pollId = p.pollId || overlay.id;
      const res = pollResults?.[pollId];
      const hasVoted = Boolean(res?.myVote || res?.userVoted);
      const isVotingNow = isVoting?.[pollId];

      const handlePollVote = async (opt: 'A'|'B') => {
        if (mode === 'VIEWER' && storyId && !hasVoted && !isVotingNow) {
          if (setIsVoting) setIsVoting((prev: Record<string, boolean>) => ({ ...prev, [pollId]: true }));
          
          // Optimistic update
          const curA = res?.countA || 0;
          const curB = res?.countB || 0;
          const newA = opt === 'A' ? curA + 1 : curA;
          const newB = opt === 'B' ? curB + 1 : curB;
          const newTot = newA + newB;
          if (setPollResults) {
            setPollResults((prev: Record<string, PollResultData>) => ({
              ...prev,
              [pollId]: {
                countA: newA,
                countB: newB,
                total: newTot,
                percentA: newTot > 0 ? Math.round((newA / newTot) * 100) : 50,
                percentB: newTot > 0 ? Math.round((newB / newTot) * 100) : 50,
                myVote: opt,
                userVoted: opt
              }
            }));
          }

          try {
            const voteRes = await votePoll(storyId, pollId, opt);
            const effectivePollId = (voteRes && typeof voteRes === 'object' && 'pollId' in voteRes && voteRes.pollId) ? (voteRes.pollId as string) : pollId;
            const freshResults = await getPollResults(effectivePollId, storyId);
            if (setPollResults) {
              setPollResults((prev: Record<string, PollResultData>) => ({ ...prev, [pollId]: freshResults }));
            }
          } catch (e: unknown) {
            console.error('Error voting on poll:', e);
            try {
              const freshResults = await getPollResults(pollId, storyId);
              if (setPollResults) {
                setPollResults((prev: Record<string, PollResultData>) => ({ ...prev, [pollId]: freshResults }));
              }
            } catch {
              // Ignore
            }
          } finally {
            if (setIsVoting) setIsVoting((prev: Record<string, boolean>) => ({ ...prev, [pollId]: false }));
          }
        }
      };

      const percentA = res?.percentA ?? (res?.total && res.total > 0 ? Math.round(((res.countA || 0) / res.total) * 100) : 50);
      const percentB = res?.percentB ?? (res?.total && res.total > 0 ? Math.round(((res.countB || 0) / res.total) * 100) : 50);

      return (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-border min-w-[220px] max-w-[280px] pointer-events-auto"
        >
          <div className="p-3.5 text-center font-bold text-foreground border-b border-border text-sm leading-snug select-none">
            {p.question}
          </div>
          {hasVoted ? (
            <div className="flex flex-col p-3 gap-2 text-xs font-semibold">
              <div className="relative overflow-hidden rounded-xl bg-muted h-9 flex items-center justify-between px-3 border border-border">
                <div 
                  className="absolute inset-0 bg-primary/20 transition-all duration-500" 
                  style={{ width: `${percentA}%` }} 
                />
                <span className="relative z-10 font-bold truncate max-w-[70%]">{p.optionA}</span>
                <span className="relative z-10 font-mono font-bold text-primary">{percentA}%</span>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-muted h-9 flex items-center justify-between px-3 border border-border">
                <div 
                  className="absolute inset-0 bg-primary/20 transition-all duration-500" 
                  style={{ width: `${percentB}%` }} 
                />
                <span className="relative z-10 font-bold truncate max-w-[70%]">{p.optionB}</span>
                <span className="relative z-10 font-mono font-bold text-primary">{percentB}%</span>
              </div>
              <div className="text-center text-[10px] text-muted-foreground mt-0.5">
                {res?.total || 0} {(res?.total === 1) ? 'voto' : 'votos'}
              </div>
            </div>
          ) : (
            <div className="flex divide-x divide-border">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePollVote('A');
                }} 
                disabled={isVotingNow || mode !== 'VIEWER'}
                className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer text-sm truncate disabled:opacity-70"
              >
                {p.optionA}
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePollVote('B');
                }} 
                disabled={isVotingNow || mode !== 'VIEWER'}
                className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer text-sm truncate disabled:opacity-70"
              >
                {p.optionB}
              </button>
            </div>
          )}
        </div>
      );
    }
    case 'LINK': {
      const p = overlay.payload;
      const rawUrl = p.url || '';
      let displayDomain = '';
      try {
        const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        displayDomain = parsed.hostname.replace(/^www\./, '');
      } catch {
        displayDomain = 'Enlace';
      }

      const displayText = p.title?.trim() || displayDomain;

      const handleClick = (e: React.MouseEvent) => {
        if (mode === 'VIEWER') {
          e.stopPropagation();
          let targetUrl = rawUrl;
          if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`;
          }
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      };

      return (
        <div 
          onClick={handleClick} 
          className="bg-card/95 backdrop-blur-md border border-border text-foreground px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-2xl cursor-pointer text-sm pointer-events-auto transition-transform hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span className="truncate max-w-[170px] text-foreground">{displayText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
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
            await submitQuestionReply(storyId, 'DUMMY_OWNER', p.question, val);
            setSentQ((prev: Record<string, any>) => ({...prev, [qId]: true}));
          } catch (e: unknown) {
            alert((e as Error).message || 'Error al enviar');
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
            await upsertSliderValue(storyId, sId, val);
            const newRes = await getSliderResults(sId);
            setSliderResults((prev: Record<string, any>) => ({...prev, [sId]: newRes}));
          } catch (err: unknown) {
            console.error(err);
            alert((err as Error).message || 'Error al guardar');
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
      return <img src={p.url} className="w-32 h-auto max-w-[200px] object-contain drop-shadow-md pointer-events-none select-none" alt="sticker" />;
    }
    default:
      return null;
  }
}

