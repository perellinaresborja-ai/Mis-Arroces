"use client"

import React, { useState } from "react"
import { UserPlus, ChevronRight } from "lucide-react"
import { FindFriendsModal } from "@/components/domain/FindFriendsModal"

export function FindFriendsSettingsRow() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="font-medium text-sm text-foreground block">
              Encontrar e invitar amigos
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Agenda, WhatsApp y enlace personal
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <FindFriendsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
