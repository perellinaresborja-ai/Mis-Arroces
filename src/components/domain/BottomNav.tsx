"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/cookbook",
      icon: BookOpen,
      label: "Recetario",
    },
    {
      href: "/discover",
      icon: Compass,
      label: "Descubrir",
    },
    {
      href: "/create",
      icon: PlusCircle,
      label: "Cocinar",
      isPrimary: true,
    },
    {
      href: "/profile",
      icon: User,
      label: "Perfil",
    },
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-border bg-background pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full",
                item.isPrimary 
                  ? "text-primary -mt-6" 
                  : isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div 
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  item.isPrimary ? "bg-background p-2 shadow-sm border border-border" : "p-1"
                )}
              >
                <Icon 
                  className={cn(
                    item.isPrimary ? "h-8 w-8 text-primary" : "h-6 w-6"
                  )} 
                  strokeWidth={isActive && !item.isPrimary ? 2.5 : 2}
                />
              </div>
              {!item.isPrimary && (
                <span className="text-[10px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
