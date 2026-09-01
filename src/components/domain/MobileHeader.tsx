"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { NotificationBell } from "./NotificationBell"
import { GlobalCreateMenu } from "./GlobalCreateMenu"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function MobileHeader() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  if (pathname === "/login" || pathname === "/forgot-password" || pathname.includes("/edit") || pathname.includes("/create")) return null;

  return (
    <div className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between px-4 py-0 bg-background/95 backdrop-blur border-b border-border">
      <Link href="/" className="flex items-center gap-1 shrink-0">
        <div className="relative w-10 h-10 shrink-0">
          <Image src="/logopaellaicono.png" alt="Mis Arroces Icono" fill sizes="80px" className="object-contain" priority />
        </div>
        <div className="relative w-40 h-9 shrink-0">
          <Image src="/logoextto.png" alt="Mis Arroces Texto" fill sizes="180px" className="object-contain object-left" priority />
        </div>
      </Link>
      <div className="flex items-center gap-3">
        {isAuthenticated && <GlobalCreateMenu />}
        {isAuthenticated && <NotificationBell />}
      </div>
    </div>
  )
}
