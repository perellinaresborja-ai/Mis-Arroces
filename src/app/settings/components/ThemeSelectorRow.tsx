"use client"
import { useTheme } from "next-themes"
import { Moon, Check, X } from "lucide-react"
import { useState } from "react"

export default function ThemeSelectorRow() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { id: "light", name: "Claro" },
    { id: "dark", name: "Oscuro" },
    { id: "system", name: "Sistema" }
  ]

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Apariencia</span>
        </div>
        <span className="text-sm text-muted-foreground capitalize">
          {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)}>
          <div className="bg-card border-t border-border rounded-t-3xl p-6 pb-10 sm:pb-6 w-full max-w-2xl mx-auto shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Elige un tema</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-muted/50 hover:bg-muted transition"
                >
                  <span className="font-medium">{t.name}</span>
                  {theme === t.id && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
