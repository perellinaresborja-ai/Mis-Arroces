"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame, PlaySquare, User, Home, MessageCircle, BookOpen, Compass, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { NotificationBell } from "@/components/domain/NotificationBell"
import { GlobalCreateMenu } from "@/components/domain/GlobalCreateMenu"
import { useUserSession } from "@/components/providers/UserSessionProvider"

export function DesktopNav() {
  const pathname = usePathname()
  const { user, avatarUrl } = useUserSession()
  const displayAvatar = avatarUrl

  console.log("[AUTH DEBUG] DesktopNav render", {
    userId: user ? user.id : null,
    avatarUrl
  })

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

  if (pathname === "/login" || pathname === "/forgot-password") return null

  return (
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
            <Link href="/me" className={cn("transition-colors hover:opacity-80", pathname === "/me" || pathname.startsWith("/me/") ? "opacity-100" : "opacity-80")}>
              {displayAvatar ? (
                <div className={cn(
                  "relative w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                  (pathname === "/me" || pathname.startsWith("/me/")) ? "border-primary" : "border-transparent"
                )}>
                  <MediaImage src={displayAvatar} alt="Perfil" fallbackType="avatar" className="w-full h-full object-cover" fill={true} variant="avatar" />
                </div>
              ) : (
                <div className={cn(
                  "w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 border-2",
                  (pathname === "/me" || pathname.startsWith("/me/")) ? "border-primary" : "border-transparent"
                )}>
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
