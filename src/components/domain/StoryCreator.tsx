"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { useRouter } from 'next/navigation';
import { StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay } from '@/types/stories';
import { createClient } from '@/lib/supabase/client';
import { createStory } from '@/app/actions/stories';
import { optimizeStoryVideo } from '@/lib/video-optimizer';
import { globalStoryDraftUrl, globalStoryDraftType, globalStoryDraftFile, globalStoryDraftFresh, clearGlobalStoryDraft, setGlobalStoryDraft, consumeGlobalStoryDraft } from '@/lib/story-draft';
import { SharedStoryRenderer, renderOverlayContent } from './SharedStoryRenderer';
import { DraggableOverlay } from './stories/DraggableOverlay';
import { MentionPicker, RecipePicker, IngredientPicker, LocationPicker, StickerPicker, LinkPicker, QuestionPicker, PollPicker, ProfilePicker, SliderPicker, HashtagPicker, CountdownPicker, cleanIngredientName } from './stories/StickerPickers';
import { Camera, User, ChefHat, MapPin, AlignLeft, AlignCenter, AlignRight, Apple, Image as ImageIcon, Trash2, Paintbrush, Sparkles, Link as LinkIcon, HelpCircle, BarChart2, Music, Volume2, Video, X, Undo2, Globe, Users, AtSign, Smile, Hash, Timer, Play, Pause } from 'lucide-react';
import { StoryMusicSelector } from './StoryMusicSelector';
import { isTapStyleSupported, getNextStickerStyle } from '@/lib/story-sticker-styles';

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
  initialPost?: { id: string, authorName: string, text?: string, coverUrl?: string, mediaType?: 'IMAGE'|'VIDEO' }
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
  const [videoHasAudio, setVideoHasAudio] = useState(true);
  const [draftMediaSize, setDraftMediaSize] = useState<number | null>(null);
  const [mediaTransform, setMediaTransform] = useState({ translateX: 0, translateY: 0, scale: 1, rotation: 0 });
  const stickerTouchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (globalStoryDraftUrl && !initialMedia && globalStoryDraftFresh) {
      setDraftMediaUrl(globalStoryDraftUrl);
      setDraftMediaType(globalStoryDraftType || 'IMAGE');
      setMode('EDIT');
      consumeGlobalStoryDraft();
    } else {
      clearGlobalStoryDraft();
      setDraftMediaUrl(initialMedia?.url);
      setDraftMediaType(initialMedia?.type);
      if (!initialMedia && !initialRecipe && !initialSession && !initialPost) {
        setMode('EDIT');
      }
    }
  }, []);
  
  
  const [mode, setMode] = useState<'EDIT'|'DRAW'|'TEXT'|'STICKER'|'MUSIC'>('EDIT');
  const [musicConfig, setMusicConfig] = useState<any>(null);

  useEffect(() => {
    if (mode === 'MUSIC' && videoRef.current) {
      const v = videoRef.current as any;
      let hasA = false;
      if (v.audioTracks && v.audioTracks.length > 0) hasA = true;
      else if (v.mozHasAudio) hasA = true;
      else if (v.webkitAudioDecodedByteCount > 0) hasA = true;
      else if (v.videoTracks && v.videoTracks.length > 0 && !v.audioTracks) hasA = false; 
      else hasA = true; // Fallback to true if we cannot definitively prove it has no audio
      setVideoHasAudio(hasA);
    }
  }, [mode]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video playback & timeline state
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isScrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const hidePlayOverlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || draftMediaType !== 'VIDEO') return;

    const syncMetadata = () => {
      if (vid.duration && !isNaN(vid.duration)) {
        setDuration(vid.duration);
      }
      setIsPlaying(!vid.paused);
    };

    const handleTime = () => {
      if (!isScrubbingRef.current) {
        setCurrentTime(vid.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowPlayOverlay(true);
    };

    syncMetadata();

    vid.addEventListener('timeupdate', handleTime);
    vid.addEventListener('loadedmetadata', syncMetadata);
    vid.addEventListener('durationchange', syncMetadata);
    vid.addEventListener('play', handlePlay);
    vid.addEventListener('pause', handlePause);

    return () => {
      vid.removeEventListener('timeupdate', handleTime);
      vid.removeEventListener('loadedmetadata', syncMetadata);
      vid.removeEventListener('durationchange', syncMetadata);
      vid.removeEventListener('play', handlePlay);
      vid.removeEventListener('pause', handlePause);
      if (hidePlayOverlayTimeoutRef.current) {
        clearTimeout(hidePlayOverlayTimeoutRef.current);
      }
    };
  }, [draftMediaUrl, draftMediaType]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleVideoPlayback = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid.play().then(() => {
        setIsPlaying(true);
        if (hidePlayOverlayTimeoutRef.current) clearTimeout(hidePlayOverlayTimeoutRef.current);
        hidePlayOverlayTimeoutRef.current = setTimeout(() => {
          setShowPlayOverlay(false);
        }, 300);
      }).catch(err => console.warn('Play error:', err));
    } else {
      vid.pause();
      setIsPlaying(false);
      setShowPlayOverlay(true);
    }
  };

  const handleVideoTap = () => {
    if (!showPlayOverlay) {
      setShowPlayOverlay(true);
      if (isPlaying) {
        if (hidePlayOverlayTimeoutRef.current) clearTimeout(hidePlayOverlayTimeoutRef.current);
        hidePlayOverlayTimeoutRef.current = setTimeout(() => {
          setShowPlayOverlay(false);
        }, 2500);
      }
    } else {
      toggleVideoPlayback();
    }
  };

  const handleTimelineSeek = (clientX: number) => {
    if (!timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const dur = videoRef.current.duration;
    if (!dur || isNaN(dur) || rect.width <= 0) return;

    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const fraction = clickX / rect.width;
    const newTime = fraction * dur;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    isScrubbingRef.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    if (videoRef.current) {
      wasPlayingBeforeScrubRef.current = !videoRef.current.paused;
      videoRef.current.pause();
    }
    handleTimelineSeek(e.clientX);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    handleTimelineSeek(e.clientX);
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    isScrubbingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (wasPlayingBeforeScrubRef.current && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    consumeGlobalStoryDraft();
    const url = URL.createObjectURL(file);
    userHasInteractedRef.current = false;
    setDraftMediaUrl(url);
    setDraftMediaSize(file.size);
    if (file.type.startsWith("video/")) {
      setDraftMediaType("VIDEO");
    } else {
      setDraftMediaType("IMAGE");
    }
    setMode('EDIT');
    e.target.value = '';
  };

  const pendingPhotoStickersRef = useRef<Map<string, File>>(new Map());

  const handlePhotoStickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      // 1. Optimize image using existing service
      const { prepareImage } = await import("@/services/media/client");
      const optimizedImg = await prepareImage(file, 'stories').catch(() => file);
      const fileToUpload = optimizedImg instanceof File 
        ? optimizedImg 
        : new File([optimizedImg], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });

      // 2. Measure dimensions & calculate aspect ratio
      const localUrl = URL.createObjectURL(fileToUpload);
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = (img.naturalWidth && img.naturalHeight) 
          ? img.naturalWidth / img.naturalHeight 
          : 1;

        const overlayId = 'image_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        pendingPhotoStickersRef.current.set(overlayId, fileToUpload);

        saveHistory();
        const newOverlay: StoryOverlay = {
          id: overlayId,
          type: 'IMAGE',
          x: 0.5,
          y: 0.5,
          scale: 1,
          rotation: 0,
          zIndex: overlays.length + 10,
          payload: {
            url: localUrl,
            aspectRatio
          }
        };

        setOverlays(prev => [...prev, newOverlay]);
        setActiveStickerType(null);
        setMode('EDIT');

        // 3. Upload in background to Supabase storage
        const ext = fileToUpload.type === 'image/webp' ? 'webp' : (fileToUpload.name.split('.').pop() || 'jpg');
        const fileName = `stories/stickers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        supabase.storage.from('recipe_media').upload(fileName, fileToUpload, {
          contentType: fileToUpload.type,
          cacheControl: '31536000'
        }).then(({ data, error }) => {
          if (!error && data?.path) {
            const publicUrl = supabase.storage.from('recipe_media').getPublicUrl(data.path).data.publicUrl;
            pendingPhotoStickersRef.current.delete(overlayId);
            setOverlays(current => current.map(o => (o.id === overlayId && o.type === 'IMAGE') ? { ...o, payload: { ...o.payload, url: publicUrl } } : o));
          }
        }).catch(err => {
          console.warn("Background upload of photo sticker failed, will retry on publish:", err);
        });
      };
      img.src = localUrl;
    } catch (err) {
      console.error("Error processing photo sticker:", err);
    }
  };

  const [activeStickerType, setActiveStickerType] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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
  const userHasInteractedRef = useRef(false);
  
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

  useEffect(() => {
    if (!draftMediaUrl) return;
    let isCancelled = false;

    const applyAspectScale = (w: number, h: number) => {
      if (isCancelled || userHasInteractedRef.current) return;
      if (!w || !h) return;
      const aspect = w / h;
      const containerAspect = 9 / 16;
      const fillScale = Math.max(aspect / containerAspect, containerAspect / aspect);
      const initScale = Math.max(1, Number(fillScale.toFixed(3)));
      setMediaTransform({ translateX: 0, translateY: 0, scale: initScale, rotation: 0 });
      mediaTransformRef.current = { translateX: 0, translateY: 0, scale: initScale, rotation: 0 };
      updateDOMTransform({ translateX: 0, translateY: 0, scale: initScale, rotation: 0 });
    };

    if (draftMediaType === 'VIDEO') {
      const vid = document.createElement('video');
      vid.src = draftMediaUrl;
      vid.onloadedmetadata = () => {
        applyAspectScale(vid.videoWidth, vid.videoHeight);
      };
    } else {
      const img = new window.Image();
      img.src = draftMediaUrl;
      img.onload = () => {
        applyAspectScale(img.naturalWidth, img.naturalHeight);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [draftMediaUrl, draftMediaType]);

  const bindBackgroundGestures = useGesture({
    onDrag: ({ offset: [x, y], target, event, last }) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      userHasInteractedRef.current = true;
      mediaTransformRef.current.translateX = x;
      mediaTransformRef.current.translateY = y;
      updateDOMTransform(mediaTransformRef.current);
      if (last) setMediaTransform({ ...mediaTransformRef.current });
    },
    onPinch: ({ offset: [d, a], target, event, last }) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      userHasInteractedRef.current = true;
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
  const [sliderForm, setSliderForm] = useState({ prompt: '', emoji: '😍' });
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

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const isExitingRef = useRef(false);
  const isPublishingRef = useRef(false);

  const hasUnsavedChanges = Boolean(
    draftMediaUrl ||
    overlays.length > 0 ||
    textVal.trim().length > 0 ||
    canvasUndoStack.length > 0 ||
    musicConfig?.track_id ||
    (background.type === 'color' && background.value !== '#18181B') ||
    background.type !== 'color' ||
    initialRecipe ||
    initialSession ||
    initialPost
  );

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const showDiscardDialogRef = useRef(showDiscardDialog);
  useEffect(() => {
    showDiscardDialogRef.current = showDiscardDialog;
  }, [showDiscardDialog]);

  useEffect(() => {
    isPublishingRef.current = isPublishing;
  }, [isPublishing]);

  const safeCloseMode = () => setMode('EDIT');

  const handleCancelDiscard = () => {
    setShowDiscardDialog(false);
  };

  const handleConfirmDiscard = () => {
    isExitingRef.current = true;
    clearGlobalStoryDraft();
    if (draftMediaUrl && draftMediaUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(draftMediaUrl);
      } catch {}
    }
    setDraftMediaUrl(undefined);
    setDraftMediaType(undefined);
    setOverlays([]);
    setTextVal('');
    setMusicConfig(null);
    setCanvasUndoStack([]);
    pendingPhotoStickersRef.current.clear();
    setShowDiscardDialog(false);
    setIsExiting(true);
    router.replace('/');
  };

  const requestExit = () => {
    if (hasUnsavedChangesRef.current) {
      setShowDiscardDialog(true);
    } else {
      isExitingRef.current = true;
      clearGlobalStoryDraft();
      setIsExiting(true);
      router.replace('/');
    }
  };

  const handleCloseClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    requestExit();
  };

  useEffect(() => {
    // Empujar entrada en historial para interceptar el botón o gesto atrás
    window.history.pushState({ isStoryEditor: true }, '');

    const handlePopState = () => {
      if (isPublishingRef.current || isExitingRef.current) {
        return;
      }

      // 1. Si el diálogo de descarte ya está abierto y le dan a atrás:
      // Cerrar el diálogo y permanecer en el editor (Seguir editando)
      if (showDiscardDialogRef.current) {
        setShowDiscardDialog(false);
        window.history.pushState({ isStoryEditor: true }, '');
        return;
      }

      // 2. Si está en un submodo (STICKER, TEXT, MUSIC, DRAW):
      // Volver al modo EDIT y mantener la guardia del editor
      if (modeRef.current !== 'EDIT') {
        setMode('EDIT');
        window.history.pushState({ isStoryEditor: true }, '');
        return;
      }

      // 3. Estamos en modo EDIT:
      if (hasUnsavedChangesRef.current) {
        // Hay contenido o modificaciones: neutralizamos salida y mostramos confirmación
        window.history.pushState({ isStoryEditor: true }, '');
        setShowDiscardDialog(true);
      } else {
        // El editor está vacío: salida directa
        isExitingRef.current = true;
        clearGlobalStoryDraft();
        setIsExiting(true);
        router.replace('/');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current && !isPublishingRef.current && !isExitingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!isPublishingRef.current) {
        clearGlobalStoryDraft();
      }
    };
  }, [router]);

  // Init recipe, session or post if passed
    useEffect(() => {
      if (overlays.length > 0) return;
      let extractedCoverUrl = undefined;
      let newOverlay: any = null;
      if (initialRecipe) {
        extractedCoverUrl = initialRecipe.coverUrl;
        newOverlay = { id: "recipe_"+Date.now(), type: "RECIPE", x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1, payload: { title: initialRecipe.name, recipeId: initialRecipe.id, displayStyle: "compact" } };
      } else if (initialSession) {
        extractedCoverUrl = initialSession.coverUrl;
        newOverlay = { id: "session_"+Date.now(), type: "SESSION", x: 0.5, y: 0.8, scale: 1, rotation: 0, zIndex: 1, payload: { sessionId: initialSession.id, authorName: initialSession.authorName, title: initialSession.title, displayStyle: "compact" } };
      } else if (initialPost) {
        const isVid = initialPost.mediaType === 'VIDEO' || Boolean(
          initialPost.coverUrl && (/\.(mp4|webm|mov)(\?.*)?$/i.test(initialPost.coverUrl) || initialPost.coverUrl.includes('video/'))
        );
        extractedCoverUrl = initialPost.coverUrl;
        newOverlay = { 
          id: "post_"+Date.now(), 
          type: "POST", 
          x: 0.5, 
          y: 0.82, 
          scale: 1, 
          rotation: 0, 
          zIndex: 1, 
          payload: { 
            postId: initialPost.id, 
            authorName: initialPost.authorName, 
            text: initialPost.text, 
            coverUrl: initialPost.coverUrl, 
            mediaType: isVid ? 'VIDEO' : 'IMAGE',
            displayStyle: "pill" 
          } 
        };
      }
      if (newOverlay) {
        userHasInteractedRef.current = false;
        if (extractedCoverUrl) {
           setDraftMediaUrl(extractedCoverUrl);
           const isVid = initialPost ? (initialPost.mediaType === 'VIDEO' || Boolean(initialPost.coverUrl && (/\.(mp4|webm|mov)(\?.*)?$/i.test(initialPost.coverUrl) || initialPost.coverUrl.includes('video/')))) : false;
           setDraftMediaType(isVid ? "VIDEO" : "IMAGE");
        }
        setOverlays([newOverlay]);
        setMode("EDIT");
      }
    }, [initialRecipe, initialSession, initialPost]);

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

  const handleStickerSelect = (type: string, data: any) => {
    saveHistory();
    
    let newOverlay: StoryOverlay | null = null;
    const common = { id: type.toLowerCase() + '_' + Date.now(), x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length + 10 };
    
    if (type === 'MENTION') {
      newOverlay = { ...common, type: 'MENTION', payload: { username: data.title, userId: data.id } };
    } else if (type === 'LOCATION') {
      newOverlay = { ...common, type: 'LOCATION', payload: { name: data.title } };
    } else if (type === 'RECIPE') {
      newOverlay = { ...common, type: 'RECIPE', payload: { title: data.title, recipeId: data.id, displayStyle: 'compact', coverUrl: data.coverUrl } };
    } else if (type === 'INGREDIENT') {
      newOverlay = { ...common, type: 'INGREDIENT', payload: { name: cleanIngredientName(data.title), ingredientId: data.id } };
    } else if (type === 'GIF') {
      newOverlay = { ...common, type: 'GIF', payload: { gifId: data.id, url: data.url, aspectRatio: data.aspectRatio || 1 } };
    } else if (type === 'LINK') {
      newOverlay = { ...common, type: 'LINK', payload: { url: data.url, title: data.title } };
    } else if (type === 'QUESTION') {
      newOverlay = { ...common, type: 'QUESTION', payload: { question: data.title } };
    } else if (type === 'POLL') {
      const pollUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
      newOverlay = { ...common, type: 'POLL', payload: { question: data.title, optionA: data.optionA, optionB: data.optionB, pollId: pollUuid || common.id } };
    } else if (type === 'SESSION') {
      newOverlay = { ...common, type: 'SESSION', payload: { authorName: data.title, sessionId: data.id } };
    } else if (type === 'PROFILE') {
      newOverlay = { ...common, type: 'PROFILE', payload: { username: data.title, userId: data.id } };
    } else if (type === 'SLIDER') {
      newOverlay = { ...common, type: 'SLIDER', payload: { question: data.question || '', emoji: data.emoji || '🔥' } };
    } else if (type === 'HASHTAG') {
      const cleanTag = (data.tag || '').replace(/^#+/, '').trim();
      newOverlay = { ...common, type: 'HASHTAG', payload: { tag: cleanTag } };
    } else if (type === 'COUNTDOWN') {
      newOverlay = { ...common, type: 'COUNTDOWN', payload: { title: data.title, targetDate: data.targetDate } };
    }
    
    if (newOverlay) {
      setOverlays([...overlays, newOverlay]);
    }
    setActiveStickerType(null);
    setMode('EDIT');
  };

  const uploadDraftIfNeeded = async () => {
    if (globalStoryDraftFile) {
      let fileToUpload = globalStoryDraftFile;
      
      if (globalStoryDraftType === 'VIDEO') {
        try {
          setIsOptimizing(true);
          // Only process videos that are over a certain size (e.g. 5MB) or just process all mobile videos.
          // Since we want standard 15s max, we process all videos.
          const optimizedBlob = await optimizeStoryVideo(globalStoryDraftFile);
          fileToUpload = new File([optimizedBlob], globalStoryDraftFile.name.replace(/\.[^/.]+$/, "") + ".mp4", { type: optimizedBlob.type });
          setIsOptimizing(false);
        } catch (err: any) {
          setIsOptimizing(false);
          console.warn("No se pudo optimizar el vídeo localmente, subiendo original o abortando:", err);
          // Fallback: If original is under 40MB, try to upload anyway.
          if (globalStoryDraftFile.size > 40 * 1024 * 1024) {
            throw new Error(`El vídeo pesa demasiado (${(globalStoryDraftFile.size / 1024 / 1024).toFixed(1)}MB) y el dispositivo no pudo optimizarlo. Intenta con un vídeo más corto.`);
          }
        }
      } else {
        try {
          setIsOptimizing(true);
          const { prepareImage } = await import("@/services/media/client");
          const optimizedImg = await prepareImage(globalStoryDraftFile, 'stories');
          fileToUpload = optimizedImg instanceof File 
            ? optimizedImg 
            : new File([optimizedImg], globalStoryDraftFile.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
          setIsOptimizing(false);
        } catch (imgErr) {
          setIsOptimizing(false);
          console.warn("No se pudo optimizar la imagen de la historia, usando fallback:", imgErr);
        }
      }

      const ext = fileToUpload.type === 'image/webp' ? 'webp' : (fileToUpload.name.split('.').pop() || 'jpg');
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { data, error } = await supabase.storage.from('recipe_media').upload(`stories/${fileName}`, fileToUpload, {
        contentType: fileToUpload.type,
        cacheControl: '604800'
      });
      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Error al subir el archivo multimedia: ${error.message}`);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa para subir el contenido");

      let storyThumbPath: string | undefined = undefined;
      if (globalStoryDraftType === 'VIDEO') {
        try {
          const { generateVideoThumbnailFile } = await import("@/lib/video-optimizer");
          const thumbFile = await generateVideoThumbnailFile(fileToUpload, fileName);
          storyThumbPath = `stories/${fileName.replace(/\.[^/.]+$/, "")}.thumb.webp`;
          await supabase.storage.from('recipe_media').upload(storyThumbPath, thumbFile, {
            cacheControl: '31536000',
            upsert: true
          });
        } catch (thumbErr) {
          console.warn("Could not generate story video thumbnail:", thumbErr);
        }
      }

      const insertData: any = {
        storage_path: data.path,
        media_type: globalStoryDraftType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mime_type: fileToUpload.type,
        owner_id: user.id,
        thumbnail_path: storyThumbPath || null
      };

      let { data: assetData, error: dbError } = await supabase.from('media_assets').insert(insertData).select().single();
      if (dbError && (dbError as any).message?.includes("thumbnail_path")) {
        delete insertData.thumbnail_path;
        const retry = await supabase.from('media_assets').insert(insertData).select().single();
        assetData = retry.data;
        dbError = retry.error;
      }
      
      if (dbError || !assetData) {
        console.error("Media asset DB error:", dbError);
        throw new Error(`Error al registrar el archivo multimedia: ${dbError?.message || 'No se pudo registrar'}`);
      }
      return assetData.id;
    }
    return undefined;
  };

  const handlePublish = async () => {
    if (isPublishing || isOptimizing) return;
    setIsPublishing(true);
    isPublishingRef.current = true;
    try {
      const uploadedMediaId = await uploadDraftIfNeeded();

      // Ensure any photo sticker overlay with blob: URL is uploaded
      const finalOverlays = await Promise.all(overlays.map(async (ov) => {
        if (ov.type === 'IMAGE' && ov.payload.url.startsWith('blob:')) {
          const file = pendingPhotoStickersRef.current.get(ov.id);
          if (file) {
            const ext = file.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
            const fileName = `stories/stickers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const { data, error } = await supabase.storage.from('recipe_media').upload(fileName, file, {
              contentType: file.type,
              cacheControl: '31536000'
            });
            if (!error && data?.path) {
              const publicUrl = supabase.storage.from('recipe_media').getPublicUrl(data.path).data.publicUrl;
              return {
                ...ov,
                payload: {
                  ...ov.payload,
                  url: publicUrl
                }
              };
            }
          }
        }
        return ov;
      }));

      await createStory({
        mediaTransform,
        background,
        mediaId: uploadedMediaId,
        recipeId: initialRecipe?.id,
        sessionId: initialSession?.id,
        postId: initialPost?.id,
        overlays: finalOverlays,
        musicConfig
      });
      clearGlobalStoryDraft();
      window.location.href = '/';
    } catch (e: any) {
      console.error("Error al publicar historia:", e);
      alert(e?.message || "Error al publicar la historia. Por favor, inténtalo de nuevo.");
      setIsPublishing(false);
      isPublishingRef.current = false;
      setIsOptimizing(false);
    }
  };

  if (isExiting) {
    return <div className="fixed inset-0 bg-black z-[9999]" />;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden touch-none select-none">
      
      {/* Discard Dialog Modal */}
      {/* Discard Dialog Modal */}
      {showDiscardDialog && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="bg-card border border-border w-full max-w-xs rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-foreground mb-1.5">¿Descartar historia?</h3>
              <p className="text-muted-foreground text-sm">Si sales ahora, perderás los cambios.</p>
            </div>
            <div className="flex flex-col gap-2.5 mt-2">
              <button 
                type="button"
                onClick={handleCancelDiscard}
                className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Seguir editando
              </button>
              <button 
                type="button"
                onClick={handleConfirmDiscard}
                className="w-full py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 9:16 Vertical Story Canvas */}
      <div 
        ref={containerRef} 
        {...bindBackgroundGestures()} 
        className="relative w-full h-[100dvh] max-w-[calc(100dvh*9/16)] md:h-[92vh] md:max-w-[calc(92vh*9/16)] bg-zinc-950 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        style={{ aspectRatio: '9/16' }}
        onClick={(e) => {
          setSelectedOverlayId(null);
          if ((e.target as HTMLElement).closest('.draggable-overlay') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('label')) {
            return;
          }
          if (draftMediaType === 'VIDEO' && draftMediaUrl && mode === 'EDIT') {
            handleVideoTap();
          }
        }}
      >
        {/* Top Floating Controls Bar (Overlaid on canvas) */}
        {mode === 'EDIT' && (
          <div className="absolute top-0 inset-x-0 z-[120] flex items-center justify-between p-3.5 pt-[max(env(safe-area-inset-top),0.85rem)] bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none">
            {/* Overlaid Action Tools: ACCESOS DIRECTOS VISIBLES (Izquierda) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              {/* 1. Texto */}
              <button 
                onClick={() => setMode('TEXT')} 
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 shadow-sm cursor-pointer"
                title="Añadir texto"
              >
                <span className="font-serif font-black text-sm">Aa</span>
              </button>

              {/* 2. Etiquetar personas / Mención */}
              <button 
                onClick={() => { setActiveStickerType('MENTION'); setMode('STICKER'); }} 
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 shadow-sm cursor-pointer"
                title="Etiquetar personas"
              >
                <AtSign size={18} />
              </button>

              {/* 3. Ubicación */}
              <button 
                onClick={() => { setActiveStickerType('LOCATION'); setMode('STICKER'); }} 
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 shadow-sm cursor-pointer"
                title="Ubicación"
              >
                <MapPin size={18} />
              </button>

              {/* 4. Música */}
              <button 
                onClick={() => setMode('MUSIC')} 
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 relative shadow-sm cursor-pointer"
                title="Música"
              >
                <Music size={18} className={musicConfig?.track_id ? "text-primary" : "text-white"} />
                {musicConfig?.track_id && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-zinc-950" />}
              </button>

              {/* 5. Stickers */}
              <button 
                onClick={() => { setActiveStickerType(null); setMode('STICKER'); }} 
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 shadow-sm cursor-pointer"
                title="Stickers y widgets"
              >
                <Sparkles size={18} />
              </button>
            </div>

            {/* Right: Close / Discard Button (Derecha) */}
            <div className="flex items-center pointer-events-auto">
              <button 
                type="button"
                onClick={handleCloseClick}
                className="w-10 h-10 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/15 transition-transform active:scale-90 shadow-sm cursor-pointer"
                aria-label="Cerrar editor"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Top Controls for DRAW Mode */}
        {mode === 'DRAW' && (
          <div className="absolute top-0 inset-x-0 z-[120] flex items-center justify-between p-3 pt-[max(env(safe-area-inset-top),0.75rem)] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
            {/* Left: Clear & Undo */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const ctx = canvasRef.current?.getContext('2d');
                  if (ctx) ctx.clearRect(0,0,400,711);
                  setCanvasUndoStack([]);
                }}
                className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full border border-white/20 transition-transform active:scale-95 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Borrar todo"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => {
                  if (canvasUndoStack.length > 0) {
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx) {
                      const newStack = [...canvasUndoStack];
                      newStack.pop();
                      if (newStack.length > 0) {
                        ctx.putImageData(newStack[newStack.length - 1], 0, 0);
                      } else {
                        ctx.clearRect(0,0,400,711);
                      }
                      setCanvasUndoStack(newStack);
                    }
                  }
                }}
                disabled={canvasUndoStack.length === 0}
                className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full border border-white/20 transition-transform active:scale-95 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                title="Deshacer trazo"
              >
                <Undo2 size={16} />
              </button>
            </div>

            {/* Center: Color dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-2">
              {['#FFFFFF', '#000000', '#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#00BFFF', '#8A2BE2'].map(c => (
                <button
                  key={c}
                  onClick={() => setDrawColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform active:scale-90 shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: c,
                    borderColor: drawColor === c ? 'var(--primary, #E69A21)' : (c === '#000000' ? '#ffffff66' : 'transparent'),
                    transform: drawColor === c ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>

            {/* Right: Brush sizes & Done */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/15 rounded-full p-1">
                {[5, 12, 22].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDrawSize(s)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${drawSize === s ? 'bg-white text-black' : 'text-white'}`}
                  >
                    <div className="rounded-full bg-current" style={{ width: s === 5 ? 4 : s === 12 ? 7 : 11, height: s === 5 ? 4 : s === 12 ? 7 : 11 }} />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setMode('EDIT')} 
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        )}

        {/* Media Background Layer (Scalable, pannable 9:16 cover) */}
        <SharedStoryRenderer 
          mediaUrl={draftMediaUrl} 
          isVideo={draftMediaType === 'VIDEO'}
          videoRef={videoRef}
          background={background}
          overlays={[]} 
          musicConfig={musicConfig}
          mode="EDITOR"
          isPaused={mode !== 'EDIT'}
        />

        {/* Center Camera Upload Button (Visible only when no media and no shared content is loaded) */}
        {mode === 'EDIT' && !draftMediaUrl && !initialRecipe && !initialSession && !initialPost && !overlays.some(o => ['POST', 'RECIPE', 'SESSION'].includes(o.type)) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <label 
              className="w-20 h-20 sm:w-24 sm:h-24 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-2xl pointer-events-auto"
              title="Añadir foto o vídeo"
              aria-label="Añadir foto o vídeo"
            >
              <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
              <Camera size={36} className="text-white drop-shadow-md" />
            </label>
          </div>
        )}

        {/* Center Play/Pause Button for Video */}
        {mode === 'EDIT' && draftMediaType === 'VIDEO' && draftMediaUrl && showPlayOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-black/45 hover:bg-black/65 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all active:scale-90 cursor-pointer shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
              aria-label={isPlaying ? "Pausar vídeo" : "Reproducir vídeo"}
            >
              {isPlaying ? (
                <Pause size={38} className="text-white drop-shadow-md" />
              ) : (
                <Play size={38} className="text-white drop-shadow-md ml-1" />
              )}
            </button>
          </div>
        )}

        {/* Drawing Canvas */}
        <canvas 
          ref={canvasRef}
          width={400} height={711}
          className="absolute inset-0 w-full h-full z-40 touch-none pointer-events-none"
          style={{ pointerEvents: mode === 'DRAW' ? 'auto' : 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Overlays / Stickers */}
        {overlays.map((o) => (
          <DraggableOverlay
            key={o.id}
            overlay={o}
            isSelected={selectedOverlayId === o.id}
            onSelect={() => setSelectedOverlayId(o.id)}
            onUpdate={(updated) => setOverlays(overlays.map(x => x.id === o.id ? updated : x))}
            onDelete={() => { saveHistory(); setOverlays(overlays.filter(x => x.id !== o.id)); }}
            onDragStateChange={setIsDraggingOverlay}
            containerRef={containerRef}
            onTap={() => {
              if (isTapStyleSupported(o.type)) {
                saveHistory();
                const cur = (o.payload as any).styleVariant || (o.payload as any).displayStyle;
                const next = getNextStickerStyle(o.type, cur);
                const updated = {
                  ...o,
                  payload: {
                    ...(o.payload as any),
                    styleVariant: next,
                    ...(o.type === 'RECIPE' ? { displayStyle: next } : {})
                  }
                };
                setOverlays(overlays.map(x => x.id === o.id ? updated : x));
              } else if (o.type === 'POST') {
                saveHistory();
                const cur = (o.payload as any).displayStyle || 'pill';
                const next = cur === 'pill' ? 'white' : (cur === 'white' ? 'minimal' : 'pill');
                const updated = { ...o, payload: { ...(o.payload as any), displayStyle: next } } as any;
                setOverlays(overlays.map(x => x.id === o.id ? updated : x) as any);
              } else if (o.type === 'SESSION') {
                saveHistory();
                const currentStyle = (o.payload as any).displayStyle || 'compact';
                const nextStyle = currentStyle === 'compact' ? 'text' : 'compact';
                const updated = { ...o, payload: { ...(o.payload as any), displayStyle: nextStyle } } as any;
                setOverlays(overlays.map(x => x.id === o.id ? updated : x) as any);
              }
            }}
          >
            <div className="pointer-events-none">
              {renderOverlayContent(o, "PREVIEW")}
            </div>
          </DraggableOverlay>
        ))}

        {/* Inline Text Editor Overlay */}
        {mode === 'TEXT' && (
          <div className="absolute inset-0 z-[300] flex flex-col bg-black/75 backdrop-blur-md pointer-events-auto touch-none" onClick={addText}>
            {/* Top Controls */}
            <div className="flex items-center justify-between p-4 pt-[max(env(safe-area-inset-top),1rem)]" onClick={e=>e.stopPropagation()}>
              <button onClick={() => setTextAlign(textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left')} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-white cursor-pointer">
                {textAlign === 'left' ? <AlignLeft size={20} /> : textAlign === 'center' ? <AlignCenter size={20} /> : <AlignRight size={20} />}
              </button>
              <button onClick={() => setTextBg(textBg === 'transparent' ? '#00000055' : textBg === '#00000055' ? textColor : 'transparent')} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-white font-bold text-xl cursor-pointer">
                A
              </button>
              <button onClick={addText} className="px-5 py-2 bg-white text-black font-bold rounded-full cursor-pointer hover:bg-white/90">
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
                  borderRadius: '0.75rem',
                  textShadow: textBg === 'transparent' ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'
                }}
                rows={3}
                placeholder="Escribe algo..."
              />
            </div>

            {/* Bottom Controls */}
            <div className="mt-auto bg-card border-t border-border rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] flex flex-col gap-4 shadow-2xl" onClick={e=>e.stopPropagation()}>
              {/* Font Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Tipografía</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {TEXT_FONTS.map(font => (
                    <button key={font} onClick={() => setTextFont(font)} className={`px-4 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-colors cursor-pointer ${textFont === font ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`} style={{fontFamily: font}}>
                      {font.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Color Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Color</span>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {TEXT_COLORS.map(c => (
                    <button key={c} onClick={() => setTextColor(c)} className={`w-8 h-8 rounded-full shrink-0 border-2 transition-transform hover:scale-110 cursor-pointer ${textColor === c ? 'border-primary scale-110' : 'border-border'}`} style={{backgroundColor: c}} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trash Zone */}
        {(isDraggingOverlay || selectedOverlayId) && (
          <div 
            id="story-trash" 
            onClick={(e) => {
              e.stopPropagation();
              if (selectedOverlayId) {
                setOverlays(overlays.filter(o => o.id !== selectedOverlayId));
                setSelectedOverlayId(null);
              }
            }}
            className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-[200] transition-all cursor-pointer pointer-events-auto ${
              isDraggingOverlay 
                ? "bg-red-500/90 scale-110 border-2 border-white text-white shadow-2xl" 
                : "bg-black/60 backdrop-blur border border-white/20 text-white shadow-2xl hover:bg-red-500 hover:scale-105"
            }`}
          >
            <Trash2 className="w-6 h-6" />
          </div>
        )}

        {/* Bottom Floating Bar (Overlaid on canvas) */}
        {mode === 'EDIT' && (
          <div className="absolute bottom-0 inset-x-0 z-[120] flex flex-col p-4 pb-[max(env(safe-area-inset-bottom),1rem)] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none gap-2">
            {/* Video Timeline & Progress Bar */}
            {draftMediaType === 'VIDEO' && draftMediaUrl && (
              <div className="w-full flex flex-col gap-1 pointer-events-auto select-none mb-0.5">
                {/* Time Display */}
                <div className="flex items-center justify-between text-[11px] font-mono font-medium text-white/80 select-none px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                {/* Progress Bar / Scrubbing Track */}
                <div 
                  ref={timelineRef}
                  onPointerDown={handleTimelinePointerDown}
                  onPointerMove={handleTimelinePointerMove}
                  onPointerUp={handleTimelinePointerUp}
                  className="relative w-full h-5 flex items-center cursor-pointer touch-none group"
                >
                  {/* Background track */}
                  <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-white rounded-full transition-none"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  {/* Thumb / Draggable scrubber handle */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md -translate-x-1/2 transition-transform group-hover:scale-125"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Controls Row: Privacy pill & Publish button */}
            <div className="flex items-center justify-between w-full">
            {/* Left: Privacy toggle pill */}
            <button 
              type="button"
              onClick={() => setPrivacy(privacy === 'PUBLIC' ? 'FOLLOWERS' : 'PUBLIC')}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white/90 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg pointer-events-auto transition-transform active:scale-95 cursor-pointer"
            >
              {privacy === 'PUBLIC' ? <Globe size={13} className="text-white/80" /> : <Users size={13} className="text-white/80" />}
              <span>{privacy === 'PUBLIC' ? 'Público' : 'Solo seguidores'}</span>
            </button>

            {/* Right: Publish Button */}
            <button 
              onClick={handlePublish} 
              disabled={isPublishing || isOptimizing || (!draftMediaUrl && overlays.length === 0)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-2xl pointer-events-auto transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {(isPublishing || isOptimizing) ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isOptimizing ? "Optimizando..." : "Publicando..."}</span>
                </>
              ) : (
                <>
                  <span>Tu historia</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </button>
            </div>
          </div>
        )}

        {/* Sticker Tray Bottom Sheet */}
        {mode === 'STICKER' && (
          <div 
            className="absolute inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-end justify-center pointer-events-auto animate-in fade-in duration-150"
            onClick={() => { setActiveStickerType(null); setMode('EDIT'); }}
          >
            <div 
              className="w-full max-w-lg mx-auto bg-card border-t border-border/70 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-[max(env(safe-area-inset-bottom),0.75rem)] animate-in slide-in-from-bottom duration-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Pill / Handle with swipe down to close */}
              <div 
                className="w-full pt-2.5 pb-1 flex flex-col items-center cursor-grab active:cursor-grabbing touch-none shrink-0"
                onTouchStart={(e) => {
                  stickerTouchStartY.current = e.touches[0].clientY;
                }}
                onTouchMove={(e) => {
                  if (stickerTouchStartY.current !== null) {
                    const deltaY = e.touches[0].clientY - stickerTouchStartY.current;
                    if (deltaY > 50) {
                      stickerTouchStartY.current = null;
                      if (!activeStickerType) {
                        setMode('EDIT');
                      }
                    }
                  }
                }}
                onTouchEnd={() => {
                  stickerTouchStartY.current = null;
                }}
                onClick={() => {
                  if (!activeStickerType) setMode('EDIT');
                }}
                title="Deslizar o pulsar para cerrar"
              >
                <div className="w-9 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {!activeStickerType ? (
                <div className="px-3.5 pb-2 flex flex-col gap-2 overflow-y-auto">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-foreground/80 tracking-tight">Stickers e interacción</span>
                    <button 
                      onClick={() => setMode('EDIT')} 
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
                      title="Cerrar"
                      aria-label="Cerrar"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {/* Efectos / Brocha */}
                    <button 
                      onClick={() => { setActiveStickerType(null); setMode('DRAW'); }} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Paintbrush size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Brocha</span>
                    </button>
                    {/* Votación */}
                    <button 
                      onClick={() => setActiveStickerType('POLL')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <BarChart2 size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Votación</span>
                    </button>
                    {/* Pregunta */}
                    <button 
                      onClick={() => setActiveStickerType('QUESTION')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <HelpCircle size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Pregunta</span>
                    </button>
                    {/* Receta */}
                    <button 
                      onClick={() => setActiveStickerType('RECIPE')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <ChefHat size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Receta</span>
                    </button>
                    {/* Ingrediente */}
                    <button 
                      onClick={() => setActiveStickerType('INGREDIENT')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Apple size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Ingrediente</span>
                    </button>
                    {/* Enlace */}
                    <button 
                      onClick={() => setActiveStickerType('LINK')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <LinkIcon size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Enlace</span>
                    </button>
                    {/* GIFs */}
                    <button 
                      onClick={() => setActiveStickerType('GIF')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Sparkles size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">GIFs</span>
                    </button>
                    {/* Perfil */}
                    <button 
                      onClick={() => setActiveStickerType('PROFILE')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <User size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Perfil</span>
                    </button>
                    {/* Reacción */}
                    <button 
                      onClick={() => setActiveStickerType('SLIDER')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Smile size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Reacción</span>
                    </button>
                    {/* Foto */}
                    <label 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                      title="Añadir foto"
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handlePhotoStickerUpload} 
                      />
                      <ImageIcon size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Foto</span>
                    </label>
                    {/* Hashtag */}
                    <button 
                      onClick={() => setActiveStickerType('HASHTAG')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Hash size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Hashtag</span>
                    </button>
                    {/* Cuenta atrás */}
                    <button 
                      onClick={() => setActiveStickerType('COUNTDOWN')} 
                      className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-muted/30 hover:bg-muted/60 active:bg-primary/10 rounded-2xl border border-border/40 hover:border-primary/30 text-foreground transition-all active:scale-95 cursor-pointer touch-manipulation group"
                    >
                      <Timer size={21} className="text-primary group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] font-medium text-foreground/85 tracking-tight">Cuenta atrás</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-[65vh]">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <button onClick={() => setActiveStickerType(null)} className="text-sm font-semibold text-primary hover:underline px-2 py-1 flex items-center gap-1 cursor-pointer">
                      ← Volver
                    </button>
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {activeStickerType === 'MENTION' && 'Mención'}
                      {activeStickerType === 'LOCATION' && 'Ubicación'}
                      {activeStickerType === 'RECIPE' && 'Receta'}
                      {activeStickerType === 'INGREDIENT' && 'Ingrediente'}
                      {activeStickerType === 'GIF' && 'Stickers / GIF'}
                      {activeStickerType === 'LINK' && 'Enlace'}
                      {activeStickerType === 'QUESTION' && 'Pregunta'}
                      {activeStickerType === 'POLL' && 'Votación'}
                      {activeStickerType === 'PROFILE' && 'Perfil'}
                      {activeStickerType === 'SLIDER' && 'Reacción'}
                      {activeStickerType === 'HASHTAG' && 'Hashtag'}
                      {activeStickerType === 'COUNTDOWN' && 'Cuenta atrás'}
                    </span>
                    <div className="w-12" />
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    {activeStickerType === 'MENTION' && <MentionPicker onSelect={(u) => handleStickerSelect('MENTION', u)} />}
                    {activeStickerType === 'LOCATION' && <LocationPicker onSelect={(l) => handleStickerSelect('LOCATION', l)} />}
                    {activeStickerType === 'RECIPE' && <RecipePicker onSelect={(r) => handleStickerSelect('RECIPE', r)} />}
                    {activeStickerType === 'INGREDIENT' && <IngredientPicker onSelect={(i) => handleStickerSelect('INGREDIENT', i)} />}
                    {activeStickerType === 'GIF' && <StickerPicker onSelect={(g) => handleStickerSelect('GIF', g)} />}
                    {activeStickerType === 'LINK' && <LinkPicker onSelect={(lk) => handleStickerSelect('LINK', lk)} />}
                    {activeStickerType === 'QUESTION' && <QuestionPicker onSelect={(q) => handleStickerSelect('QUESTION', q)} />}
                    {activeStickerType === 'POLL' && <PollPicker onSelect={(p) => handleStickerSelect('POLL', p)} />}
                    {activeStickerType === 'PROFILE' && <ProfilePicker onSelect={(u) => handleStickerSelect('PROFILE', u)} />}
                    {activeStickerType === 'SLIDER' && <SliderPicker onSelect={(s) => handleStickerSelect('SLIDER', s)} />}
                    {activeStickerType === 'HASHTAG' && <HashtagPicker onSelect={(h) => handleStickerSelect('HASHTAG', h)} />}
                    {activeStickerType === 'COUNTDOWN' && <CountdownPicker onSelect={(c) => handleStickerSelect('COUNTDOWN', c)} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Music Selector Modal */}
      {mode === 'MUSIC' && (
        <StoryMusicSelector
          isVideo={draftMediaType === 'VIDEO'}
          maxDurationMs={draftMediaType === 'VIDEO' ? Math.max(3000, Math.min(15000, ((videoRef.current?.duration || 15) * 1000))) : 15000}
          initialConfig={musicConfig}
          videoRef={videoRef}
          onSelect={(config) => {
            setMusicConfig(config);
            setMode('EDIT');
          }}
          onClose={() => safeCloseMode()}
        />
      )}
    </div>
  );
}
