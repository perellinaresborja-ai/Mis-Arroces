"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Compass, PlusCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"

export function DesktopNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/cookbook", icon: BookOpen, label: "Recetario" },
    { href: "/discover", icon: Compass, label: "Descubrir" },
    { href: "/me", icon: User, label: "Perfil" },
  ]

  // Only show inside the app
  if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") return null

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-8">
        
        <Link href="/cookbook" className="flex items-center gap-2">
            <div className="relative w-56 h-12">
              <Image src="/mpng.png" alt="Mis Arroces Logo" fill className="object-contain object-left" priority />
            </div>
          </Link>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
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
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          
          
        </nav>
      </div>
    </header>
  )
}
