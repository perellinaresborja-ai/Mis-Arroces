"use client"
import { useRef } from "react"
import { MediaImage } from "@/components/domain/MediaImage"
import { UnreadBadge } from "@/components/domain/messages/UnreadBadge"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Compass, User, Home, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { useMultiAccount } from "@/components/providers/MultiAccountProvider"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { avatarUrl, username } = useUserSession()
  const { quickSwitchLastAccount, openSwitcher } = useMultiAccount()

  const displayAvatar = avatarUrl
  const cleanUsername = username ? username.replace(/^@+/, '') : null
  const profileHref = cleanUsername ? `/@${cleanUsername}` : "/me"

  // Gestos avanzados para el avatar: doble toque y pulsación prolongada
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const lastTapRef = useRef<number>(0)
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const isTouchDeviceRef = useRef(false)

  const handleAvatarTouchStart = (e: React.TouchEvent) => {
    isTouchDeviceRef.current = true
    isLongPressRef.current = false
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    // Pulsación prolongada (400ms)
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([40])
        } catch {}
      }
      openSwitcher()
    }, 400)
  }

  const handleAvatarTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const diffX = Math.abs(touch.clientX - touchStartPos.current.x)
    const diffY = Math.abs(touch.clientY - touchStartPos.current.y)

    // Si hay desplazamiento mayor a 10px se cancela la pulsación prolongada (es scroll)
    if (diffX > 10 || diffY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }

  const handleAvatarTouchEnd = (e: React.TouchEvent, isAvatarActive: boolean) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Si se activó pulsación prolongada, cancelar cualquier acción de click o navegación
    if (isLongPressRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const now = Date.now()
    const diff = now - lastTapRef.current

    if (diff < 250) {
      // DOBLE TOQUE RÁPIDO (< 250ms) -> Conmutar a la última cuenta usada
      e.preventDefault()
      e.stopPropagation()
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current)
        singleTapTimerRef.current = null
      }
      lastTapRef.current = 0
      quickSwitchLastAccount()
    } else {
      // PRIMER TOQUE: esperar 250ms para diferenciar de doble toque
      lastTapRef.current = now
      singleTapTimerRef.current = setTimeout(() => {
        if (isAvatarActive) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          router.push(profileHref)
        }
      }, 250)
    }
  }

  const handleAvatarClick = (e: React.MouseEvent, isAvatarActive: boolean) => {
    // Si fue evento touch, handleAvatarTouchEnd ya gestionó la navegación
    if (isTouchDeviceRef.current) {
      return
    }
    if (isAvatarActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(profileHref)
    }
  }

  const handleAvatarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openSwitcher()
  }

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
    {
      href: profileHref,
      icon: User,
      label: "Perfil",
      isAvatar: true,
    },
  ]

  if (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/links" ||
    pathname.startsWith("/messages/") ||
    pathname.includes("/edit") ||
    pathname.includes("/create")
  ) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 z-50 w-full border-t border-border bg-background pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.isAvatar
              ? pathname === "/me" ||
                (username
                  ? pathname === `/@${username}` || pathname.startsWith(`/@${username}/`)
                  : false)
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          const Icon = item.icon

          if (item.isAvatar) {
            return (
              <div
                key={item.label}
                onTouchStart={handleAvatarTouchStart}
                onTouchMove={handleAvatarTouchMove}
                onTouchEnd={(e) => handleAvatarTouchEnd(e, isActive)}
                onContextMenu={handleAvatarContextMenu}
                onClick={(e) => handleAvatarClick(e, isActive)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full relative select-none cursor-pointer active:scale-95 transition-transform",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                role="button"
                tabIndex={0}
                aria-label="Perfil y cambio de cuenta"
              >
                <div className="flex items-center justify-center transition-colors p-1 relative">
                  {displayAvatar ? (
                    <div
                      className={cn(
                        "relative w-7 h-7 rounded-full overflow-hidden border-2",
                        isActive ? "border-foreground" : "border-transparent"
                      )}
                    >
                      <MediaImage
                        src={displayAvatar}
                        alt="Perfil"
                        className="w-full h-full object-cover"
                        fill={true}
                        variant="avatar"
                        fallbackType="avatar"
                      />
                    </div>
                  ) : (
                    <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" focusable="false" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full relative active:scale-95 transition-transform",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-center transition-colors p-1 relative">
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" focusable="false" />
                {item.href === '/messages' && <UnreadBadge />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
