"use client"
import { useState, useEffect } from "react"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function MessageBubble({ message, isOwn }: { message: Record<string, unknown>, isOwn: boolean }) {
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

  return (
    <div className={`flex w-full mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl p-3 ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
        
        {mType === 'IMAGE' && realtimeUrl && (
          <img src={realtimeUrl} alt="Media" className="rounded-xl w-full object-cover mb-2 max-h-64 cursor-pointer" />
        )}
        
        {mType === 'VIDEO' && realtimeUrl && (
          <video src={realtimeUrl} controls playsInline className="rounded-xl w-full max-h-64 mb-2 bg-black/10" />
        )}

        {mType === 'LINK' && (
          <a href={mContent} target="_blank" rel="noopener noreferrer" className="underline break-all">
            {mContent}
          </a>
        )}

        {(mType === 'RECIPE' || mType === 'SESSION' || mType === 'STORY') && (
          <div className="bg-background/10 rounded-xl p-3 mb-2 border border-border/20">
            {entityStatus === 'LOADING' && <p className="text-xs opacity-70">Cargando...</p>}
            {entityStatus === 'EXPIRED' && <p className="text-xs font-bold">Story caducada</p>}
            {entityStatus === 'UNAVAILABLE' && <p className="text-xs font-bold">Contenido no disponible</p>}
            {entityStatus === 'LOADED' && entityData && (
              <>
                <p className="font-semibold text-sm mb-1">{mType} Compartido</p>
                {entityData.title && <p className="text-xs truncate">{entityData.title as string}</p>}
                <Link href={`/${mType.toLowerCase()}s/${mEntityId}`} className="text-xs underline block mt-2 opacity-90 hover:opacity-100">
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
    </div>
  )
}
