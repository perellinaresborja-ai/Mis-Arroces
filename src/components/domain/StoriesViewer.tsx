"use client"
import { ShareDMModal } from "./ShareDMModal"

import { useState, useEffect, useRef } from "react"
import { formatRelativeTime } from "@/lib/utils"
import { X, Trash2, MoreHorizontal, Copy, Share2, MessageCircle, Flag, BarChart2 as BarChartIcon } from "lucide-react"
import { markStoryViewed, fetchStoryViewers, deleteStory } from "@/app/actions/stories"
import Link from "next/link"
import { SharedStoryRenderer } from "./SharedStoryRenderer"
import { getOrCreateConversation, sendMessage } from "@/app/actions/messaging"
import { toggleStoryReaction } from "@/app/actions/stories"

import { EntityInsightsModal } from "./EntityInsightsModal"
import { SaveRecipeButton } from "./SaveRecipeButton"
import { BarChart2 } from "lucide-react"
import { trackClickAction } from "@/app/actions/tracking"

export function StoriesViewer({ groupedStories, initialGroupIndex, onClose, currentUser }: any) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0) // 0 to 100 per story
  const [showMenu, setShowMenu] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply) return;
    setIsSendingReply(true);
    try {
      const convId = await getOrCreateConversation(currentStory.owner_id);
      await sendMessage({
        conversationId: convId,
        type: 'STORY',
        body: replyText,
        entityId: currentStory.id
      });
      console.log("Mensaje enviado");
      setReplyText("");
    } catch (err) {
      console.error("No se pudo enviar el mensaje");
    } finally {
      setIsSendingReply(false);
    }
  }
  
  const handleReaction = async (reaction: string) => {
    try {
      await toggleStoryReaction(currentStory.id, reaction);
      console.log(`Reaccionaste con ${reaction}`);
    } catch(err) {
      console.error("Error al reaccionar");
    }
  }
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setShowMenu(true);
  }
  
  const closeMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowMenu(false);
    setIsPaused(false);
  }
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '/?story=' + currentStory.id);
    alert('Enlace copiado');
    closeMenu();
  }
  const [viewers, setViewers] = useState<any[]>([])
  const [showViewers, setShowViewers] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)

  const currentGroup = groupedStories[groupIndex]
  const currentStory = currentGroup?.stories[storyIndex]
  const isMe = currentUser?.id === currentGroup?.author?.id || currentUser?.id === currentStory?.owner_id;
  // console.log("DEBUG ISME", { isMe, currentUserId: currentUser?.id, authorId: currentGroup?.author?.id, ownerId: currentStory?.owner_id });

  // Navigate next/prev story
  const handleDelete = async (e: React.MouseEvent) => { e.stopPropagation(); setIsPaused(true); if(!confirm('¿Eliminar esta historia?')) { setIsPaused(false); return; } try { await deleteStory(currentStory.id); window.location.reload(); } catch(e) { alert('Error al eliminar la historia'); setIsPaused(false); } };

  const nextStory = () => {
    if (!currentGroup) return
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((s: number) => s + 1)
    } else if (groupIndex < groupedStories.length - 1) {
      setGroupIndex((g: number) => g + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }

  const prevStory = () => {
    if (!currentGroup) return
    if (storyIndex > 0) {
      setStoryIndex((s: number) => s - 1)
    } else if (groupIndex > 0) {
      setGroupIndex((g: number) => g - 1)
      setStoryIndex(groupedStories[groupIndex - 1].stories.length - 1)
    } else {
      // First story of first user -> close? Or do nothing?
      // Do nothing or maybe close. Let's do nothing but reset progress.
      setProgress(0)
    }
  }

  // Handle Mark Viewed
  useEffect(() => {
    if (currentStory && !isMe) {
      // Ensure we don't spam if already marked, though action handles it
      markStoryViewed(currentStory.id)
    }
    setProgress(0)
    setIsPaused(false)
    setShowViewers(false)
  }, [currentStory, isMe])

  // Handle fetching viewers for owner
  useEffect(() => {
    if (isMe && currentStory) {
      fetchStoryViewers(currentStory.id).then(setViewers)
    }
  }, [currentStory, isMe])

  // Handle Progress Auto-advance
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isPaused || showViewers) return

    const isVideo = currentStory?.story_media?.[0]?.media?.storage_path?.match(/\.(mp4|webm|ogg)$/i)
    let timer: NodeJS.Timeout
    let step = 0

    if (!isVideo) {
      // Image: 5 seconds advance
      const duration = 5000
      const interval = 50
      timer = setInterval(() => {
        step += (interval / duration) * 100
        if (step >= 100) {
          clearInterval(timer)
          nextStory()
        } else {
          setProgress(step)
        }
      }, interval)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [currentStory, isPaused, showViewers]) // Dependencies

  // Video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(p)
    }
  }
  const handleVideoEnded = () => {
    nextStory()
  }

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") nextStory()
      if (e.key === "ArrowLeft") prevStory()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [groupIndex, storyIndex]) // Needs latest state inside closures, wait actually it's fine if we re-bind or use refs, but since effect re-runs it's ok

  if (!currentStory) return null

    const fallbackRecipeMediaObj = currentStory.recipe?.recipe_media?.[0]?.media;
  const mediaObj = currentStory.story_media?.[0]?.media || fallbackRecipeMediaObj;
  const mediaPath = mediaObj?.storage_path;
  const isVideo = mediaPath?.match(/\.(mp4|webm|ogg)$/i);
  const fullUrl = mediaObj?.signed_url || (mediaPath ? `${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${mediaPath}` : "");

  const handlePointerDown = () => setIsPaused(true)
  const handlePointerUp = () => setIsPaused(false)

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex items-center justify-center overscroll-none touch-none">
      <div className="relative w-full h-full max-w-lg md:h-[90vh] md:rounded-3xl md:overflow-hidden bg-zinc-900 shadow-2xl flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 w-full z-50 flex gap-1 p-2 bg-gradient-to-b from-black/50 to-transparent pt-safe pointer-events-none">
          {currentGroup.stories.map((s: any, idx: number) => {
            let width = "0%"
            if (idx < storyIndex) width = "100%"
            else if (idx === storyIndex) width = `${progress}%`
            
            return (
              <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width }} />
              </div>
            )
          })}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 w-full z-50 flex items-center justify-between px-4 pt-safe mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
              {currentGroup.author?.avatar?.storage_path ? (
                <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${currentGroup.author.avatar.storage_path}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-muted-foreground text-sm">{(currentGroup.author?.display_name || currentGroup.author?.username || "?").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col drop-shadow-md">
              <span className="font-bold text-sm leading-tight">{currentGroup.author?.display_name || currentGroup.author?.username}</span>
              <span className="text-xs text-white/80">{formatRelativeTime(currentStory.created_at)}</span>
            </div>
          </div>
          
                      <div className="flex gap-2 relative z-50 pointer-events-auto">
              <button onClick={handleMenuClick} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <MoreHorizontal className="w-6 h-6 drop-shadow-md text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <X className="w-6 h-6 drop-shadow-md text-white" />
              </button>
            </div>
        </div>

                {/* Context Menu Overlay */}
          {showMenu && (
            <div className="absolute inset-0 z-[60] bg-black/60 flex items-end justify-center pointer-events-auto" onClick={closeMenu}>
              <div className="w-full max-w-lg bg-zinc-900 rounded-t-3xl overflow-hidden flex flex-col pb-safe animate-in slide-in-from-bottom-full duration-200" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3" />
                
                {isMe ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowViewers(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <BarChartIcon className="w-6 h-6" /> <span className="font-semibold">Ver estadísticas</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Share2 className="w-6 h-6" /> <span className="font-semibold">Compartir</span>
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Copy className="w-6 h-6" /> <span className="font-semibold">Copiar enlace</span>
                    </button>
                    <button onClick={(e) => { handleDelete(e); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                      <Trash2 className="w-6 h-6" /> <span className="font-semibold">Eliminar Story</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Share2 className="w-6 h-6" /> <span className="font-semibold">Compartir</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <MessageCircle className="w-6 h-6" /> <span className="font-semibold">Enviar por mensaje</span>
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Copy className="w-6 h-6" /> <span className="font-semibold">Copiar enlace</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); alert('Reportado'); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                      <Flag className="w-6 h-6" /> <span className="font-semibold">Reportar</span>
                    </button>
                  </>
                )}
                <button onClick={closeMenu} className="w-full p-4 text-center text-white/70 hover:bg-white/5 font-semibold transition-colors mt-2">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {showShare && (
            <div className="absolute inset-0 z-[70] pointer-events-auto">
              <ShareDMModal isOpen={showShare} onClose={() => { setShowShare(false); setIsPaused(false); }} entityType="STORY" entityId={currentStory.id} />
            </div>
          )}

          {/* Media Container */}
        <div 
          className="flex-1 relative w-full h-full overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <SharedStoryRenderer storyId={currentStory.id} mode="VIEWER"
            mediaUrl={fullUrl}
            transform={currentStory.media_transform}
            background={currentStory.background}
            overlays={currentStory.overlays || []}
            isVideo={!!isVideo}
            videoRef={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            isPaused={isPaused}
          />
          
          {/* Invisible Click Zones for navigation (only active if not showing viewers) */}
          {!showViewers && (
            <>
              <div className="absolute top-0 left-0 w-1/3 h-full z-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
              <div className="absolute top-0 right-0 w-2/3 h-full z-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </>
          )}
        </div>

        
        {/* Reply Bar */}
        <div className="absolute bottom-0 left-0 w-full p-4 pb-safe bg-gradient-to-t from-black/80 to-transparent z-40 flex flex-col gap-3 pointer-events-auto">
          {/* Caption */}
          {currentStory.caption && (
            <p className="text-sm drop-shadow-md text-white">{currentStory.caption}</p>
          )}
          
          {!isMe && (
            <div className="flex items-center gap-3 w-full max-w-lg mx-auto">
              <form onSubmit={handleReplySubmit} className="flex-1">
                <input 
                  type="text" 
                  placeholder="Responder..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full h-11 bg-black/40 border border-white/20 rounded-full px-4 text-white placeholder-white/50 backdrop-blur-md outline-none focus:border-white/50 transition-colors"
                />
              </form>
              <div className="flex gap-2 text-2xl shrink-0">
                {['❤️', '😂', '🔥'].map(emoji => (
                  <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="hover:scale-125 transition-transform drop-shadow-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isMe && (
            <div className="flex justify-center w-full">
               <button onClick={() => setShowViewers(true)} className="text-sm font-bold bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-2 hover:bg-black/60 transition-colors">
                 <span>👀</span> {currentStory.viewCount} {currentStory.viewCount === 1 ? 'vista' : 'vistas'}
               </button>
            </div>
          )}
        </div>

        {/* Linked Content CTA */}
        {currentStory.recipe_id && (
          <div className="absolute bottom-24 left-0 w-full flex justify-center z-20 pointer-events-none px-4">
            <Link 
              href={`/recipes/${currentStory.recipe_id}`} 
              className="w-full max-w-sm flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl p-2 gap-3 shadow-2xl pointer-events-auto transition-transform hover:scale-105 border border-white/10"
            >
              {currentStory.recipe?.recipe_media?.[0]?.media?.storage_path ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentStory.recipe.recipe_media[0].media.storage_path}`} 
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center">
                  <span className="text-white/50 text-xs font-bold">R</span>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Ver receta</p>
                <p className="text-sm font-bold text-white truncate">{currentStory.recipe?.name || "Receta compartida"}</p>
              </div>
              <div className="w-6 h-6 shrink-0 mr-1 flex items-center justify-center text-white/50">
                &rarr;
              </div>
            </Link>
          </div>
        )}
        {currentStory.session_id && (
          <div className="absolute bottom-24 left-0 w-full flex justify-center z-20 pointer-events-none px-4">
            <Link 
              href={`/sessions/${currentStory.session_id}`} 
              className="w-full max-w-sm flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl p-2 gap-3 shadow-2xl pointer-events-auto transition-transform hover:scale-105 border border-white/10"
            >
              {currentStory.session?.session_media?.[0]?.media?.storage_path ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${currentStory.session.session_media[0].media.storage_path}`} 
                    alt="Session"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center">
                  <span className="text-white/50 text-xs font-bold">C</span>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Ver resultado</p>
                <p className="text-sm font-bold text-white truncate">Sesión de cocinado</p>
              </div>
              <div className="w-6 h-6 shrink-0 mr-1 flex items-center justify-center text-white/50">
                &rarr;
              </div>
            </Link>
          </div>
        )}

        
        {/* Interaction Bar (Viewers only) */}
        {!isMe && (
          <div className="absolute bottom-4 left-0 w-full px-4 z-40 pointer-events-auto">
            <div className="flex items-center gap-2">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem('reply') as HTMLInputElement).value;
                  if (!val.trim()) return;
                  try {
                    const { submitQuestionReply } = await import('@/app/actions/stories');
                    await submitQuestionReply(currentStory.id, currentGroup.author.id, "Historia", val);
                    (e.currentTarget.elements.namedItem('reply') as HTMLInputElement).value = '';
                    alert('Respuesta enviada a DM');
                    setIsPaused(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1"
              >
                <input 
                  name="reply"
                  type="text" 
                  placeholder="Responder..."
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 backdrop-blur-md rounded-full px-4 py-2 text-sm outline-none border border-white/20 text-white transition-all focus:border-white/50"
                  onClick={(e) => e.stopPropagation()}
                />
              </form>
              <div className="flex gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                {['❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={async () => {
                      try {
                        const { votePoll } = await import('@/app/actions/stories');
                        // Using votePoll as a generic upsert into story_reactions since we built it that way
                        await votePoll(currentStory.id, "REACTION", emoji as any);
                        alert('Reacción ' + emoji + ' enviada');
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Owner Viewers Footer */}
        {isMe && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-30 gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowViewers(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Visto por {currentStory.viewCount || viewers.length}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setInsightsOpen(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Estadísticas
            </button>
          </div>
        )}

        {/* Viewers Modal (Owner only) */}
        {showViewers && isMe && (
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl z-40 flex flex-col border-t border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="font-bold text-sm flex items-center gap-2"><EyeIcon className="w-4 h-4" /> Vistas ({viewers.length})</h3>
              <button onClick={() => { setShowViewers(false); setIsPaused(false); }} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {viewers.length === 0 ? (
                <p className="text-center text-sm text-white/50 pt-8">Aún no hay visualizaciones.</p>
              ) : (
                viewers.map(v => (
                  <Link href={`/@${v.username}`} key={v.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {v.avatar?.storage_path ? (
                        <img src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${v.avatar.storage_path}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-muted-foreground text-sm">{(v.display_name || v.username || "?").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{v.display_name || v.username}</p>
                      <p className="text-xs text-white/50">@{v.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      <EntityInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => { setInsightsOpen(false); setIsPaused(false); }} 
        entityType="STORY" 
        entityId={currentStory.id} 
      />
    </div>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}





