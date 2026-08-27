"use client"

import { CSSProperties } from "react"
import { StoryOverlay, StoryTransform, StoryBackground } from "@/types/stories"
import { MapPin, Utensils } from "lucide-react"

interface SharedStoryRendererProps {
  mediaUrl?: string | null;
  transform?: StoryTransform | null;
  background?: StoryBackground | null;
  overlays: StoryOverlay[];
  mode: 'EDITOR' | 'PREVIEW' | 'VIEWER';
  onOverlayClick?: (overlay: StoryOverlay) => void;
  selectedOverlayId?: string | null;
}

export function SharedStoryRenderer({
  mediaUrl,
  transform,
  background,
  overlays,
  mode,
  onOverlayClick,
  selectedOverlayId
}: SharedStoryRendererProps) {
  
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
  
  // Apply blur if requested and media is present
  const showBlurBg = background?.type === 'blur' && mediaUrl;

      const mediaStyle: CSSProperties = {
      position: 'relative',
      transform: transform ? `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotation || 0}deg)` : 'none',
      transformOrigin: 'center center',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      zIndex: 1,
      pointerEvents: 'none',
    }px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotation || 0}deg)` : 'none',
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 1,
    pointerEvents: 'none',
  }

  return (
    <div className="story-canvas" style={containerStyle}>
      {/* Blurred Background Layer */}
      {showBlurBg && (
        <div 
          className="absolute inset-0 z-0 opacity-50 scale-110"
          style={{
            backgroundImage: `url(${mediaUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
          }}
        />
      )}
      
      {/* Main Media Layer */}
      {mediaUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={mediaUrl} alt="Story Media" style={mediaStyle} />
      )}

      {/* Overlays Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {overlays.map((overlay) => {
          const isSelected = mode === 'EDITOR' && selectedOverlayId === overlay.id;
          
          const overlayStyle: CSSProperties = {
            position: 'absolute',
            left: `${overlay.x * 100}%`,
            top: `${overlay.y * 100}%`,
            transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
            zIndex: overlay.zIndex + 10,
            pointerEvents: mode === 'EDITOR' ? 'auto' : 'none',
            cursor: mode === 'EDITOR' ? 'grab' : 'default',
            boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none', // highlight if selected
          }

          return (
            <div 
              key={overlay.id} 
              style={overlayStyle}
              onClick={(e) => {
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
              {renderOverlayContent(overlay)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function renderOverlayContent(overlay: StoryOverlay) {
  switch (overlay.type) {
    case 'TEXT':
      return (
        <div 
          className="px-4 py-2 font-bold text-center whitespace-pre-wrap break-words"
          style={{ 
            color: overlay.payload.color, 
            backgroundColor: overlay.payload.backgroundColor || 'transparent',
            textAlign: overlay.payload.align || 'center',
            borderRadius: overlay.payload.backgroundColor ? '0.5rem' : '0',
            fontSize: '1.5rem',
            textShadow: !overlay.payload.backgroundColor ? '0px 1px 3px rgba(0,0,0,0.8)' : 'none',
            maxWidth: '300px'
          }}
        >
          {overlay.payload.text}
        </div>
      )
    case 'MENTION':
      return (
        <div className="px-4 py-2 bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-bold rounded-full text-lg shadow-lg">
          @{overlay.payload.username}
        </div>
      )
    case 'LOCATION':
      return (
        <div className="px-4 py-2 bg-white/90 text-primary font-bold rounded-xl text-sm shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
          <MapPin className="w-4 h-4" />
          {overlay.payload.name}
        </div>
      )
    case 'RECIPE':
      return (
        <div className="w-48 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-2 border border-black/5">
          {overlay.payload.coverUrl ? (
            <div className="w-full h-32 rounded-xl overflow-hidden mb-2 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={overlay.payload.coverUrl} className="w-full h-full object-cover" alt="Recipe" />
            </div>
          ) : (
            <div className="w-full h-24 rounded-xl bg-muted flex items-center justify-center mb-2 text-muted-foreground">
              <Utensils className="w-6 h-6" />
            </div>
          )}
          <p className="text-xs text-primary font-bold uppercase tracking-wider text-center w-full truncate">Ver receta</p>
          <p className="text-sm font-bold text-foreground text-center w-full truncate px-1">{overlay.payload.title}</p>
        </div>
      )
    case 'GIF':
      return (
        <div style={{ width: '150px', aspectRatio: overlay.payload.aspectRatio || 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={overlay.payload.url} className="w-full h-full object-contain pointer-events-none" alt="GIF" />
        </div>
      )
    default:
      return null
  }
}
