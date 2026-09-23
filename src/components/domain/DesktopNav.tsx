"use client"

import { useState, useEffect } from "react"
import { MediaImage } from "@/components/domain/MediaImage"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame, PlaySquare, User, Home, MessageCircle, BookOpen, Compass, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { NotificationBell } from "@/components/domain/NotificationBell"
import { GlobalCreateMenu } from "@/components/domain/GlobalCreateMenu"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { fetchUserActiveStories } from "@/app/actions/stories"
import { StoriesViewer } from "@/components/domain/StoriesViewer"

export function DesktopNav() {
  const pathname = usePathname()
  const { user, avatarUrl, username } = useUserSession()
  const displayAvatar = avatarUrl
  const profileHref = username ? `/@${username}` : "/me"
  const isProfileActive = pathname === "/me" || (username ? pathname === `/@${username}` : false)

  const [activeStoryGroup, setActiveStoryGroup] = useState<any | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    let isCancelled = false
    if (user?.id) {
      fetchUserActiveStories(user.id)
        .then((group) => {
          if (!isCancelled) {
            setActiveStoryGroup(group)
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setActiveStoryGroup(null)
          }
        })
    } else {
      setActiveStoryGroup(null)
    }
    return () => {
      isCancelled = true
    }
  }, [user?.id, pathname])

  const hasActiveStory = Boolean(activeStoryGroup && activeStoryGroup.stories?.length > 0)

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Inicio",
    },
    {
      href: "/discover",
      icon: Compass,
      label: "Descubrir",
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Mensajes",
    },
    {
      href: "/cookbook",
      icon: BookOpen,
      label: "Recetario",
    },
  ]

  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/links") return null

  return (
    <>
      <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-8">
          
          <Link href="/" className="flex items-center gap-1">
              <div className="relative w-12 h-12 shrink-0">
                <Image src="/logopaellaicono.png" alt="Mis Arroces Icono" fill sizes="100px" className="object-contain" priority />
              </div>
              <div className="relative w-48 h-10 shrink-0">
                <Image src="/logoextto.png" alt="Mis Arroces Texto" fill sizes="200px" className="object-contain object-left" priority />
              </div>
            </Link>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </>
                </Link>
              )
            })}
            
            <div className="flex items-center gap-4 pl-6 border-l border-border ml-2">
              <GlobalCreateMenu />
              <NotificationBell />
              
              {hasActiveStory ? (
                <div 
                  className="relative w-10 h-10 shrink-0 flex items-center justify-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  {/* Outer Ring Button: triggers Story */}
                  <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-[2.5px] shadow-sm shadow-orange-500/25 transition-transform hover:scale-105 active:scale-95 focus:outline-none z-10 cursor-pointer"
                    title="Ver tu historia"
                    aria-label="Ver mi historia"
                  >
                    {/* Ring background spacing gap */}
                    <div className="w-full h-full rounded-full bg-background" />
                  </button>

                  {/* Inner Photo Link: triggers Profile navigation */}
                  <Link
                    href={profileHref}
                    prefetch={true}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "relative z-20 w-[31px] h-[31px] rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-105 focus:outline-none cursor-pointer",
                      isProfileActive ? "ring-1 ring-primary/60" : ""
                    )}
                    title="Ver mi perfil"
                    aria-label="Ver mi perfil"
                  >
                    {displayAvatar ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <MediaImage src={displayAvatar} alt="Perfil" fallbackType="avatar" className="w-full h-full object-cover" fill={true} variant="avatar" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                </div>
              ) : (
                <Link 
                  href={profileHref} 
                  prefetch={true}
                  className={cn("transition-colors hover:opacity-80 shrink-0", isProfileActive ? "opacity-100" : "opacity-80")}
                  title="Ver mi perfil"
                  aria-label="Ver mi perfil"
                >
                  {displayAvatar ? (
                    <div className={cn(
                      "relative w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center",
                      isProfileActive ? "border-primary" : "border-transparent"
                    )}>
                      <MediaImage src={displayAvatar} alt="Perfil" fallbackType="avatar" className="w-full h-full object-cover" fill={true} variant="avatar" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-9 h-9 rounded-full bg-muted flex items-center justify-center border-2",
                      isProfileActive ? "border-primary" : "border-transparent"
                    )}>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {isViewerOpen && activeStoryGroup && (
        <StoriesViewer
          groupedStories={[activeStoryGroup]}
          initialGroupIndex={0}
          onClose={() => setIsViewerOpen(false)}
          currentUser={user}
          currentUserId={user?.id}
        />
      )}
    </>
  )
}

