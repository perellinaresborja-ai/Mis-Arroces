"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Flame, PlaySquare, User, Home, MessageCircle, BookOpen, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { NotificationBell } from "@/components/domain/NotificationBell"

export function DesktopNav() {
  const pathname = usePathname()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles')
          .select(`avatar:media_assets!fk_profiles_avatar(storage_path)`)
          .eq('id', user.id)
          .single();
          
        // @ts-ignore
        if (data?.avatar?.storage_path) {
          // @ts-ignore
          setAvatarUrl(`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${data.avatar.storage_path}`);
        }
      }
    };
    fetchUser();
  }, []);

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
      href: "/me",
      icon: User,
      label: "Perfil",
      isAvatar: true
    },
  ]

  if (pathname === "/login" || pathname === "/forgot-password") return null

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-8">
        
        <Link href="/" className="flex items-center gap-2">
            <div className="relative w-56 h-12">
              <Image src="/logohor.png" alt="Mis Arroces Logo" fill sizes="300px" className="object-contain object-left" priority />
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
                {(item as any).isAvatar ? (
                  avatarUrl ? (
                    <div className={cn(
                      "w-8 h-8 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                      isActive ? "border-primary" : "border-transparent"
                    )}>
                      <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border-2",
                      isActive ? "border-primary" : "border-transparent"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                  )
                ) : (
                  <>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </>
                )}
              </Link>
            )
          })}
          
          <div className="flex items-center pl-2 border-l border-border ml-2">
            <NotificationBell />
          </div>
        </nav>
      </div>
    </header>
  )
}
