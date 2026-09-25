"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { NotificationBell } from "./NotificationBell"
import { GlobalCreateMenu } from "./GlobalCreateMenu"
import { useUserSession } from "@/components/providers/UserSessionProvider"

export function MobileHeader() {
  const pathname = usePathname()
  const { user } = useUserSession()
  const isAuthenticated = !!user

  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/links" || pathname === "/descargar" || pathname.startsWith("/messages") || pathname.includes("/edit") || pathname.includes("/create")) return null;

  return (
    <div className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between px-4 py-0 bg-background/95 backdrop-blur border-b border-border">
      <Link
        href="/"
        prefetch={true}
        onClick={(e) => {
          if (pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex items-center gap-1 shrink-0"
      >
        <div className="relative w-10 h-10 shrink-0">
          <Image src="/logopngver.webp" alt="misarroces" fill sizes="80px" className="object-contain" priority />
        </div>
        <div className="relative w-40 h-9 shrink-0">
          <Image src="/logoextto.png" alt="misarroces" fill sizes="180px" className="object-contain object-left" priority />
        </div>
      </Link>
      <div className="flex items-center gap-3">
        {isAuthenticated && <GlobalCreateMenu />}
        {isAuthenticated && <NotificationBell />}
      </div>
    </div>
  )
}
