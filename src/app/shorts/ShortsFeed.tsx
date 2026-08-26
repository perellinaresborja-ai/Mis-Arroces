"use client"

import { ShortPlayer } from "./ShortPlayer"

export function ShortsFeed({ shorts, currentUserId }: { shorts: any[], currentUserId: string | null }) {
  if (shorts.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-white/50">No hay Shorts disponibles</div>
  }

  return (
    <div className="flex-1 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
      {shorts.map(short => (
        <ShortPlayer key={short.id} short={short} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
