"use client"
import { useState, useRef, useEffect } from "react"
import { Plus, Image as ImageIcon, Clock, ChefHat } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { setGlobalStoryDraft } from "@/lib/story-draft"
import { AlignLeft } from "lucide-react"

export function GlobalCreateMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const options = [
    {
      label: "Publicación",
      icon: ImageIcon,
      href: "/create/post"
    },
    {
      label: "Historia",
      icon: Clock,
      href: "/create/story"
    },
    {
      label: "Nueva Receta",
      icon: ChefHat,
      href: "/create/recipe"
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    setIsOpen(false);
    router.push("/create/story");
    e.target.value = "";
  }

  const handleNavigate = (option: any) => {
    
    setIsOpen(false)
    router.push(option.href)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 hover:opacity-80 shrink-0",
          "bg-primary text-primary-foreground border-primary"
        )}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-card border border-border shadow-lg rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            {options.map((option: any) => (
              option.isFilePicker ? (
                <label
                  key={option.label}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left font-semibold text-sm cursor-pointer m-0"
                >
                  <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  {option.label}
                </label>
              ) : (
                <button
                  key={option.label}
                  onClick={() => handleNavigate(option)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left font-semibold text-sm"
                >
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  {option.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
