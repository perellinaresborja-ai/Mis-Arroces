"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { useState, useEffect } from "react"
import { getFollowsList } from "@/app/actions/social"
import { FeedFollowButton } from "@/components/domain/FeedFollowButton"
import Link from "next/link"
import { Loader2, X } from "lucide-react"

export function FollowsModal({
  targetUserId,
  currentUserId,
  followersCount,
  followingCount
}: {
  targetUserId: string
  currentUserId: string | null
  followersCount: number
  followingCount: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'followers' | 'following'>('followers')
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData(tab)
    } else {
      setUsers([]) // clear on close
    }
  }, [isOpen, tab])

  const loadData = async (type: 'followers' | 'following') => {
    setIsLoading(true)
    try {
      const data = await getFollowsList(targetUserId, type)
      setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const openTab = (selectedTab: 'followers' | 'following') => {
    setTab(selectedTab)
    setIsOpen(true)
  }

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      <div className="flex gap-8">
        <button onClick={() => openTab('followers')} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <span className="font-bold text-foreground text-[17px] leading-none">{followersCount || 0}</span>
          <span className="text-muted-foreground text-[11px] uppercase tracking-wider mt-1">Seguidores</span>
        </button>
        <button onClick={() => openTab('following')} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <span className="font-bold text-foreground text-[17px] leading-none">{followingCount || 0}</span>
          <span className="text-muted-foreground text-[11px] uppercase tracking-wider mt-1">Siguiendo</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-md bg-background rounded-3xl overflow-hidden flex flex-col max-h-[85vh] border border-border shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              {tab === 'followers' ? <h2 className="text-lg font-bold">Seguidores</h2> : <h2 className="text-lg font-bold">Siguiendo</h2>}
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4 pb-48">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  {tab === 'followers' ? 'Aún no tiene seguidores.' : 'Aún no sigue a nadie.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((u) => {
                    const avatarUrl = u.avatar?.storage_path ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${u.avatar.storage_path}` : null
                    return (
                      <div key={u.id} className="flex items-center justify-between">
                        <Link href={`/@${u.username}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 relative">
                            {avatarUrl && <MediaImage src={avatarUrl} alt={u.username} className="w-full h-full object-cover" fill={true} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[15px]">{u.display_name || `@${u.username}`}</span>
                          </div>
                        </Link>
                        
                        {currentUserId !== u.id && (
                          <div className="shrink-0 ml-2">
                            <FeedFollowButton 
                              isAuthenticated={!!currentUserId} 
                              initialStatus={u.followStatus} 
                              targetId={u.id} 
                              isPrivate={u.privacy_level === 'PRIVATE'} 
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
