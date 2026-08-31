"use client"
import { MediaImage } from "@/components/domain/MediaImage"
import { UnreadBadge } from "@/components/domain/messages/UnreadBadge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, User, Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function BottomNav() {
  const pathname = usePathname();
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
          
        const avatarPath = Array.isArray(data?.avatar) ? data.avatar[0]?.storage_path : data?.avatar?.storage_path;
          if (avatarPath) {
            setAvatarUrl(`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`);
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
      icon: User, // Fallback if no avatar
      label: "Perfil",
      isAvatar: true
    },
  ];

  if (pathname === "/login" || pathname === "/forgot-password" || pathname.includes("/edit") || pathname.includes("/create")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 z-50 w-full border-t border-border bg-background pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-center transition-colors p-1 relative">
                {item.isAvatar && avatarUrl ? (
                  <div className={cn(
                    "relative w-7 h-7 rounded-full overflow-hidden border-2",
                    isActive ? "border-foreground" : "border-transparent"
                  )}>
                    <MediaImage src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" fill={true} unoptimized={true} />
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
