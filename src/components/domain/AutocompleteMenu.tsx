"use client"

import { User } from "lucide-react"

export function AutocompleteMenu({ 
  isOpen, 
  type, 
  suggestions, 
  onSelect 
}: { 
  isOpen: boolean
  type: "mention" | "hashtag" | null
  suggestions: any[]
  onSelect: (val: string) => void
}) {
  if (!isOpen || suggestions.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border shadow-lg rounded-xl overflow-hidden z-[100] max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
      {suggestions.map((s, i) => (
        <button
          key={s.id || i}
          type="button"
          onClick={() => onSelect(type === "mention" ? s.username : s.name)}
          className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-0 flex items-center gap-3 transition-colors"
        >
          {type === "mention" ? (
            <>
              <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                {s.avatar?.storage_path ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={`${"https://zvesoygqssyyojqyswwm.supabase.co"}/storage/v1/object/public/recipe_media/${s.avatar.storage_path}`} 
                    alt={s.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">{s.display_name || `@${s.username}`}</span>
                <span className="text-xs text-muted-foreground">@{s.username}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <span className="font-bold text-sm">#{s.name}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
