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
    <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b border-border">
      <Link href="/">
        <div className="relative w-32 h-8">
          <Image src="/logohor.png" alt="Mis Arroces Logo" fill sizes="150px" className="object-contain object-left" priority />
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated && <GlobalCreateMenu />}
        {isAuthenticated && <NotificationBell />}
      </div>
    </div>
  )
}
