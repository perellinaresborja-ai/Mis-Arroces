import { cn } from "@/lib/utils"
import { PaellaIcon } from "@/components/icons/PaellaIcon"

interface PaellaLikeProps {
  active?: boolean
  className?: string
  filledClassName?: string
}

export function PaellaLike({ active, className, filledClassName }: PaellaLikeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center transition-transform duration-300",
        active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105",
        active && filledClassName
      )}
      aria-hidden="true"
    >
      <PaellaIcon filled={active} className={cn("w-7 h-7", className)} />
    </span>
  )
}
