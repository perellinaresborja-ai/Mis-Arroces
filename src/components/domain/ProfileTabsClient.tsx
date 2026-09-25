"use client"

import { useState } from "react"
import { Grid, Clapperboard, UserSquare } from "lucide-react"
import { ProfileGridCard } from "@/components/domain/ProfileGridCard"

interface ProfileTabsClientProps {
  initialTab?: string
  postItems: any[]
  videoItems: any[]
  taggedItems: any[]
  currentUserId: string | null
}

export function ProfileTabsClient({
  initialTab = "posts",
  postItems,
  videoItems,
  taggedItems,
  currentUserId
}: ProfileTabsClientProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'tagged'>(() => {
    if (initialTab === 'videos') return 'videos'
    if (initialTab === 'tagged') return 'tagged'
    return 'posts'
  })

  const handleTabChange = (tab: 'posts' | 'videos' | 'tagged') => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (tab === 'posts') {
        url.searchParams.delete('tab')
      } else {
        url.searchParams.set('tab', tab)
      }
      window.history.replaceState(null, '', url.pathname + url.search)
    }
  }

  return (
    <div className="w-full">
      {/* Tab Navigation Buttons */}
      <div className="flex justify-center border-t border-border mb-4">
        <button
          type="button"
          onClick={() => handleTabChange('posts')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === 'posts'
              ? 'text-foreground border-t-[3px] border-primary -mt-[2px]'
              : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'
          }`}
          aria-label="Publicaciones"
          aria-selected={activeTab === 'posts'}
          role="tab"
        >
          <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Publicaciones</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('videos')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === 'videos'
              ? 'text-foreground border-t-[3px] border-primary -mt-[2px]'
              : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'
          }`}
          aria-label="Vídeos"
          aria-selected={activeTab === 'videos'}
          role="tab"
        >
          <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Vídeos</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('tagged')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === 'tagged'
              ? 'text-foreground border-t-[3px] border-primary -mt-[2px]'
              : 'text-muted-foreground hover:text-foreground border-t-[3px] border-transparent -mt-[2px]'
          }`}
          aria-label="Etiquetas"
          aria-selected={activeTab === 'tagged'}
          role="tab"
        >
          <UserSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Etiquetas</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'posts' && (
          postItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
              <Grid className="w-12 h-12 stroke-[1.5] mb-3 opacity-30 text-muted-foreground" />
              <p className="font-semibold text-foreground text-base">Aún no hay publicaciones</p>
              <p className="text-sm text-muted-foreground mt-1">Las recetas, cocinados y publicaciones aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full">
              {postItems.map(item => (
                <ProfileGridCard 
                  key={`post-${item.entity_type}-${item.id}`} 
                  item={item} 
                  currentUserId={currentUserId || undefined}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'videos' && (
          videoItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
              <Clapperboard className="w-12 h-12 stroke-[1.5] mb-3 opacity-30 text-muted-foreground" />
              <p className="font-semibold text-foreground text-base">Aún no hay vídeos</p>
              <p className="text-sm text-muted-foreground mt-1">Los vídeos compartidos en publicaciones aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full">
              {videoItems.map(item => (
                <ProfileGridCard 
                  key={`video-${item.entity_type}-${item.id}`} 
                  item={item} 
                  currentUserId={currentUserId || undefined}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'tagged' && (
          taggedItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
              <UserSquare className="w-12 h-12 stroke-[1.5] mb-3 opacity-30 text-muted-foreground" />
              <p className="font-semibold text-foreground text-base">Sin publicaciones etiquetadas</p>
              <p className="text-sm text-muted-foreground mt-1">Las publicaciones en las que se etiquete a este usuario aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4 mx-auto w-full">
              {taggedItems.map(item => (
                <ProfileGridCard 
                  key={`tagged-${item.entity_type}-${item.id}`} 
                  item={item} 
                  currentUserId={currentUserId || undefined}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
