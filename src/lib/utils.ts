import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "ahora"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours} h`
  if (diffDays < 7) return `${diffDays} d`

  const isCurrentYear = date.getFullYear() === now.getFullYear()
  const formatter = new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: isCurrentYear ? undefined : 'numeric'
  })
  
  return formatter.format(date).replace(/\./g, '')
}


export function formatUnitSymbol(unitName: string | null | undefined): string {
  if (!unitName) return ""
  const lower = unitName.toLowerCase()
  if (lower.includes("gramo")) return "g."
  if (lower.includes("kilo")) return "kg."
  if (lower.includes("mililitro")) return "ml."
  if (lower.includes("litro")) return "L."
  if (lower.includes("cuchara")) return "cda."
  if (lower.includes("pizca")) return "pizca."
  if (lower.includes("unidad")) return "ud."
  return unitName // fallback if unknown
}
