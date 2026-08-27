
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {  BookOpen, Compass, User, ShoppingCart, Home , MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/domain/NotificationBell";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Inicio",
    },
    {
      href: "/me",
      icon: User,
      label: "Perfil",
    },
    {
      href: "/discover",
      icon: Compass,
      label: "Descubrir",
    },
    {
      href: "/cookbook",
      icon: BookOpen,
      label: "Recetario",
    },
    
  ];

  if (pathname === "/login" || pathname === "/forgot-password") return null;

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
                "flex flex-col items-center justify-center gap-1 w-full h-full",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div 
                className="flex items-center justify-center rounded-full transition-colors p-1"
              >
                <Icon 
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
            <NotificationBell className="flex flex-col items-center justify-center pt-2" />
      </div>
    </nav>
  );
}

