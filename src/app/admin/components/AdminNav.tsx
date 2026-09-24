"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  UtensilsCrossed,
  Crown,
  BellRing,
  AlertTriangle,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderacion", label: "Moderación", icon: ShieldAlert },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/contenidos", label: "Contenido", icon: UtensilsCrossed },
  { href: "/admin/fundadores", label: "Fundadores", icon: Crown },
  { href: "/admin/comunicaciones", label: "Comunicaciones", icon: BellRing },
  { href: "/admin/incidencias", label: "Incidencias", icon: AlertTriangle },
  { href: "/admin/auditoria", label: "Auditoría", icon: History },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-1 scrollbar-none">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
