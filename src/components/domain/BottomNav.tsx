"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { UnreadBadge } from "@/components/domain/messages/UnreadBadge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, User, Home, MessageCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserSession } from "@/components/providers/UserSessionProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { avatarUrl, username } = useUserSession();
  const displayAvatar = avatarUrl;
  const cleanUsername = username ? username.replace(/^@+/, '') : null;
  const profileHref = cleanUsername ? `/@${cleanUsername}` : "/me";

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
      icon: User, // Fallback if no avatar
      label: "Perfil",
      isAvatar: true
    },
  ];

  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/links" || pathname.startsWith("/messages/") || pathname.includes("/edit") || pathname.includes("/create")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 z-50 w-full border-t border-border bg-background pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : (item.isAvatar
                ? (pathname === "/me" || (username ? pathname === `/@${username}` || pathname.startsWith(`/@${username}/`) : false))
                : (pathname === item.href || pathname.startsWith(`${item.href}/`)));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full relative active:scale-95 transition-transform",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-center transition-colors p-1 relative">
                {item.isAvatar && displayAvatar ? (
                  <div className={cn(
                    "relative w-7 h-7 rounded-full overflow-hidden border-2",
                    isActive ? "border-foreground" : "border-transparent"
                  )}>
                    <MediaImage src={displayAvatar} alt="Perfil" className="w-full h-full object-cover" fill={true} variant="avatar" fallbackType="avatar" />
                  </div>
                ) : (
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                )}
                
                {item.href === '/messages' && <UnreadBadge />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
