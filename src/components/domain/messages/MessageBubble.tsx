"use client"
import { useState, useEffect } from "react"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { ChevronDown, Reply, Copy, Trash2 } from "lucide-react"
import { unsendMessage } from "@/app/actions/messaging"
import { createClient } from "@/lib/supabase/client"

export function MessageBubble({ message, isOwn, onReply }: { message: Record<string, unknown>, isOwn: boolean, onReply?: () => void }) {
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
      supabase.from('messages').select('type, body, content').eq('id', message.reply_to_id as string).single().then(({data}) => {
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
          else query = supabase.from('stories').select('*').eq('id', mEntityId).single();
          
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
        <div className={`rounded-2xl p-3 relative ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
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
              {entityStatus === 'EXPIRED' && <p className="text-xs font-bold">Story expirada</p>}
              {entityStatus === 'UNAVAILABLE' && <p className="text-xs font-bold">No disponible</p>}
              {entityStatus === 'LOADED' && entityData && (
                <>
                  <p className="font-semibold text-sm mb-1">{mType} Compartido</p>
                  {entityData.title && <p className="text-xs truncate">{entityData.title as string}</p>}
                  <Link href={`/${mType.toLowerCase()}s/${mEntityId}`} className="text-xs underline mt-2 block">
                    Ver {mType}
                  </Link>
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
        
        {/* Dropdown Menu */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`absolute top-1 ${isOwn ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 p-1 bg-card rounded-full shadow-sm border border-border text-foreground transition-opacity`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className={`absolute top-8 ${isOwn ? '-left-32' : '-right-32'} w-32 bg-card border border-border shadow-lg rounded-xl overflow-hidden z-50 text-foreground`}>
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
  )
}
