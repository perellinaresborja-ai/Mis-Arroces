import { cn } from "@/lib/utils"
import React from "react"

export function PaellaIcon({ filled = false, className, style }: { filled?: boolean, className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("w-6 h-6 shrink-0", className)}
      style={style}
    >
      <circle cx="12" cy="12" r="9" fill={filled ? "currentColor" : "none"} />
      <path d="M 3.71 8.5 a 3.5 3.5 0 0 0 0 7" fill="none" />
      <path d="M 20.29 8.5 a 3.5 3.5 0 0 1 0 7" fill="none" />
    </svg>
  )
}