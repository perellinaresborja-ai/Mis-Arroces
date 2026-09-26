"use client"

import React, { useState } from "react"
import { Users, UserPlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FindFriendsModal } from "./FindFriendsModal"

interface FindFriendsBannerProps {
  className?: string
  variant?: "card" | "compact" | "button"
  initialTab?: "invite" | "contacts" | "search"
}

export function FindFriendsBanner({
  className = "",
  variant = "card",
  initialTab = "invite",
}: FindFriendsBannerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "button") {
    return (
      <>
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`rounded-2xl font-bold text-xs flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Encontrar amigos</span>
        </Button>
        <FindFriendsModal isOpen={isOpen} onClose={() => setIsOpen(false)} initialTab={initialTab} />
      </>
    )
  }

  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between p-3.5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-muted/30 transition text-left cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                Encuentra a tus amigos
              </p>
              <p className="text-[11px] text-muted-foreground">
                Agenda, WhatsApp y enlace personal
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary shrink-0 px-2.5 py-1 rounded-xl bg-primary/10">
            Abrir
          </span>
        </button>
        <FindFriendsModal isOpen={isOpen} onClose={() => setIsOpen(false)} initialTab={initialTab} />
      </>
    )
  }

  return (
    <>
      <div
        className={`bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${className}`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                Encuentra a tus amigos
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Contactos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
              Descubre qué contactos ya están en misarroces o invítalos con tu enlace personal.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-2xl font-bold text-xs sm:text-sm h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Buscar o invitar</span>
        </Button>
      </div>

      <FindFriendsModal isOpen={isOpen} onClose={() => setIsOpen(false)} initialTab={initialTab} />
    </>
  )
}
