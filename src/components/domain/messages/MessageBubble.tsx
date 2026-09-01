"use client"
import { useState, useEffect, useTransition } from "react"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { Reply, Copy, Trash2, SmilePlus } from "lucide-react"
import { unsendMessage } from "@/app/actions/messaging"
import { toggleMessageReaction } from "@/app/actions/reactions"
import { createClient } from "@/lib/supabase/client"
import { StoriesViewer } from "../StoriesViewer"

export function MessageBubble({ message, isOwn, onReply, currentUserId }: { message: Record<string, unknown>, isOwn: boolean, onReply?: () => void, currentUserId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticReactions, setOptimisticReactions] = useState<any[]>(
    Array.isArray(message.message_reactions) ? message.message_reactions : []
  )
  const [showReactionAnim, setShowReactionAnim] = useState(false)
  const [showReactionMenu, setShowReactionMenu] = useState(false)

  const [entityData, setEntityData] = useState<Record<string, unknown> | null>(null)
  const [entityStatus, setEntityStatus] = useState<'LOADING'|'LOADED'|'EXPIRED'|'UNAVAILABLE'>('LOADING')
  
  const mType = message.type as string
  const mEntityId = message.entity_id as string
  const mContent = (message.content || message.body) as string
  const mCreatedAt = message.created_at as string
  
  const attachment = (message.message_attachments as any[])?.[0];
  const attachmentPath = attachment?.storage_path;
  const mediaUrl = attachmentPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${attachmentPath}` : null;
  const supabase = createClient();
  const [showMenu, setShowMenu] = useState(false);
  const [replyData, setReplyData] = useState<Record<string, any> | null>(message.parent as any || null);
  const isDeleted = !!message.deleted_at;

  useEffect(() => {
    if (message.reply_to_id && !replyData) {
      supabase.from('messages').select('type, body').eq('id', message.reply_to_id as string).single().then(({data}) => {
        if (data) setReplyData(data);
      });
    }
  }, [message.reply_to_id, replyData, supabase]);

  const handleCopy = () => {
    const textToCopy = mContent || realtimeUrl || '';
    if (textToCopy) navigator.clipboard.writeText(textToCopy);
    setShowMenu(false);
  };

  const handleUnsend = async () => {
    await unsendMessage(message.id as string);
    setShowMenu(false);
  };

  const handleReply = () => {
    if (onReply) onReply();
    setShowMenu(false);
  };

  const [realtimeUrl, setRealtimeUrl] = useState<string | null>(mediaUrl);
  
  useEffect(() => {
    if (mediaUrl) {
      setRealtimeUrl(mediaUrl);
    } else if ((mType === 'IMAGE' || mType === 'VIDEO') && !mediaUrl) {
      // This happens for brand new messages arriving via Realtime 
      // because Realtime doesn't join the message_attachments table.
      const fetchAttachment = async () => {
        // Wait 500ms to ensure the second insert (attachment) has completed
        await new Promise(r => setTimeout(r, 500));
        const { data } = await supabase.from('message_attachments').select('storage_path').eq('message_id', message.id as string).single();
        if (data?.storage_path) {
          setRealtimeUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${data.storage_path}`);
        } else {
          // If network is slow, retry once after 1.5s
          setTimeout(async () => {
            const { data: retryData } = await supabase.from('message_attachments').select('storage_path').eq('message_id', message.id as string).single();
            if (retryData?.storage_path) {
              setRealtimeUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${retryData.storage_path}`);
            }
          }, 1500);
        }
      };
      fetchAttachment();
    }
  }, [mType, mediaUrl, message.id, supabase]);
  

  useEffect(() => {
    if (mType === 'RECIPE' || mType === 'SESSION' || mType === 'STORY') {
        const fetchEntity = async () => {
          try {
            let query;
            if (mType === 'RECIPE') query = supabase.from('recipes').select('*').eq('id', mEntityId).single();
            else if (mType === 'SESSION') query = supabase.from('cooking_sessions').select('*').eq('id', mEntityId).single();
            else query = supabase.from('stories').select('*, profiles(username), story_media(media:media_assets(storage_path))').eq('id', mEntityId).single();
            
            const { data, error } = await query;
            
            if (error || !data) {
              setEntityStatus('UNAVAILABLE')
              return
            }
            
            if (mType === 'STORY' && 'expires_at' in data && new Date((data as {expires_at: string}).expires_at) < new Date()) {
              setEntityStatus('EXPIRED')
              return
            }
            
            setEntityData(data as Record<string, unknown>)
            setEntityStatus('LOADED')
          } catch(e) {
            setEntityStatus('UNAVAILABLE')
          }
        }
      fetchEntity()
    } else {
      setEntityStatus('LOADED')
    }
  }, [mType, mEntityId, supabase])

  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const handleReact = (emoji: string) => {
    if (!currentUserId) return;
    
    if (emoji === '🥘') {
      setShowReactionAnim(true);
      setTimeout(() => setShowReactionAnim(false), 800);
    }
    
    setShowReactionMenu(false);
    
    // Optimistic UI
    setOptimisticReactions(prev => {
      const existingIdx = prev.findIndex(r => r.user_id === currentUserId);
      if (existingIdx !== -1) {
        if (prev[existingIdx].emoji === emoji) {
          // Remove
          return prev.filter(r => r.user_id !== currentUserId);
        } else {
          // Change
          const newArr = [...prev];
          newArr[existingIdx] = { ...newArr[existingIdx], emoji };
          return newArr;
        }
      } else {
        // Add
        return [...prev, { id: 'temp_' + Date.now(), message_id: message.id, user_id: currentUserId, emoji }];
      }
    });
    
    startTransition(() => {
      toggleMessageReaction(message.id as string, emoji);
    });
  };

  const groupReactions = () => {
    const counts: Record<string, { count: number, hasMine: boolean }> = {};
    optimisticReactions.forEach(r => {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, hasMine: false };
      counts[r.emoji].count += 1;
      if (r.user_id === currentUserId) counts[r.emoji].hasMine = true;
    });
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  };

  if (isDeleted) {
    return (
      <div className={`flex w-full mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[75%] rounded-2xl p-3 ${isOwn ? "bg-primary/50 text-primary-foreground/50 rounded-tr-sm" : "bg-muted/50 text-foreground/50 rounded-tl-sm"}`}>
          <p className="text-sm italic flex items-center gap-2"><Trash2 className="w-4 h-4"/> Mensaje eliminado</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="relative group max-w-[75%]">
        <div 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); setShowReactionMenu(false); }}
          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReactionMenu(true); setShowMenu(false); }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setShowReactionMenu(true); setShowMenu(false); }}
          className={`rounded-2xl p-3 relative cursor-pointer select-none lg:select-auto ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}
        >
          {showReactionAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-bounce">
              <span className="text-5xl drop-shadow-lg scale-110">🥘</span>
            </div>
          )}
          {replyData && (
            <div className="bg-background/20 rounded-xl p-2 mb-2 text-xs opacity-80 border-l-2 border-primary">
              <span className="font-bold block mb-1">Respuesta a:</span>
              <span className="truncate block">
                {replyData.type === 'IMAGE' || replyData.type === 'VIDEO' ? 'Archivo adjunto' : replyData.body || replyData.content}
              </span>
            </div>
          )}

          {mType === 'IMAGE' && realtimeUrl && (
            <img src={realtimeUrl} alt="Media" className="rounded-xl w-full object-cover mb-2 max-h-64 cursor-pointer" />
          )}
          
          {mType === 'VIDEO' && realtimeUrl && (
            <video src={realtimeUrl} controls playsInline className="rounded-xl w-full object-cover mb-2 max-h-64" />
          )}

          {mType === 'LINK' && (
            <a href={mContent} target="_blank" rel="noopener noreferrer" className="text-sm underline break-words">
              {mContent}
            </a>
          )}

          {(mType === 'RECIPE' || mType === 'SESSION' || mType === 'STORY') && (
            <div className="bg-background/10 rounded-xl p-3 mb-2 border border-border text-foreground">
              {entityStatus === 'LOADING' && <p className="text-xs opacity-70">Cargando...</p>}
              {entityStatus === 'EXPIRED' && <p className="text-xs font-bold">Esta historia ya no estÃ¡ disponible.</p>}
              {entityStatus === 'UNAVAILABLE' && <p className="text-xs font-bold">Esta historia ya no estÃ¡ disponible.</p>}
              {entityStatus === 'LOADED' && entityData && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 bg-primary h-4 rounded-full"></div>
                    <p className="font-semibold text-xs opacity-70 uppercase tracking-wide">
                      {mType === 'STORY' ? 'Historia Compartida' : `${mType} Compartido`}
                    </p>
                  </div>
                  
                  {mType === 'STORY' && (entityData as any).story_media?.[0]?.media?.storage_path && (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co'}/storage/v1/object/public/recipe_media/${(entityData as any).story_media[0].media.storage_path}`} className="w-full h-40 object-cover rounded-lg mb-2 opacity-90" />
                  )}
                  {mType === 'STORY' && (entityData as any).profiles?.username && (
                    <p className="text-sm font-bold truncate">@{(entityData as any).profiles.username}</p>
                  )}
                  {mType !== 'STORY' && entityData.title && <p className="text-sm font-bold truncate">{entityData.title as string}</p>}
                  
                  {mType === 'STORY' ? (
                    <button onClick={(e) => { e.stopPropagation(); setShowStoryViewer(true); }} className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 hover:underline">
                      Ver historia &rarr;
                    </button>
                  ) : (
                    <Link href={`/${mType.toLowerCase()}s/${mEntityId}`} className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 hover:underline">
                      Ver {mType.toLowerCase()} &rarr;
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {mType === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap break-words">{mContent}</p>
          )}
          
          {(mType === 'IMAGE' || mType === 'VIDEO') && mContent && (
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{mContent}</p>
          )}

          <div className={`text-[10px] mt-1 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
            {formatRelativeTime(mCreatedAt)}
          </div>
        </div>

        {/* REACTION PILLS */}
        {optimisticReactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {groupReactions().map(([emoji, data]) => (
              <button 
                key={emoji} 
                onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shadow-sm transition-transform active:scale-95 ${data.hasMine ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
              >
                <span>{emoji}</span>
                <span className="font-semibold">{data.count}</span>
              </button>
            ))}
          </div>
        )}
        
        {showStoryViewer && entityData && (
          <StoriesViewer 
            stories={[entityData]} 
            onClose={() => setShowStoryViewer(false)} 
          />
        )}

        {/* DEDICATED EMOJI MENU (For Double Tap) */}
        {showReactionMenu && (
          <div className={`absolute -top-12 ${isOwn ? 'right-0' : 'left-0'} bg-card border border-border shadow-xl rounded-full px-3 py-2 flex items-center gap-3 z-50 animate-in fade-in zoom-in-95 duration-200`}>
            {['🥘', '😂', '🔥', '👏', '😮'].map(em => (
              <button key={em} onClick={(e) => { e.stopPropagation(); handleReact(em); }} className="text-2xl hover:scale-125 transition-transform active:scale-95">
                {em}
              </button>
            ))}
          </div>
        )}

        {/* NORMAL MENU */}
          {showMenu && (
            <div className={`absolute top-8 ${isOwn ? '-left-32' : '-right-32'} w-32 bg-card border border-border shadow-lg rounded-xl overflow-hidden z-50 text-foreground`}>
              <button onClick={(e) => { e.stopPropagation(); setShowReactionMenu(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                <SmilePlus className="w-4 h-4" /> Reaccionar
              </button>
              <button onClick={handleReply} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                <Reply className="w-4 h-4" /> Responder
              </button>
            <button onClick={handleCopy} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
              <Copy className="w-4 h-4" /> Copiar
            </button>
            {isOwn && (
              <button onClick={handleUnsend} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted text-destructive transition-colors">
                <Trash2 className="w-4 h-4" /> Anular
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
