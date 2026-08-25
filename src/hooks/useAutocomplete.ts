"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { searchUsersForMention, searchHashtags } from "@/app/actions/social_features"

type SuggestionType = "mention" | "hashtag" | null

export function useAutocomplete() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<SuggestionType>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Position is just used if we want floating, but V1 prefers fixed above keyboard on mobile
  const [cursorPos, setCursorPos] = useState(0)
  
  const close = () => {
    setIsOpen(false)
    setType(null)
    setQuery("")
    setSuggestions([])
  }

  // Debounced search
  useEffect(() => {
    if (!isOpen || !type || !query) return
    
    const delay = setTimeout(async () => {
      if (type === "mention") {
        const users = await searchUsersForMention(query)
        setSuggestions(users)
      } else if (type === "hashtag") {
        const tags = await searchHashtags(query)
        setSuggestions(tags)
      }
    }, 300)
    
    return () => clearTimeout(delay)
  }, [query, isOpen, type])

  const handleInput = useCallback((text: string, selectionStart: number) => {
    const textBeforeCursor = text.slice(0, selectionStart)
    
    // Check if we are typing a mention or hashtag
    const match = textBeforeCursor.match(/(?:^|\s)([@#])([a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]*)$/)
    
    if (match) {
      const trigger = match[1]
      const typed = match[2]
      
      setType(trigger === "@" ? "mention" : "hashtag")
      setQuery(typed)
      setIsOpen(true)
      setCursorPos(selectionStart)
    } else {
      close()
    }
  }, [])

  const insertSuggestion = (currentText: string, suggestionText: string) => {
    const textBeforeCursor = currentText.slice(0, cursorPos)
    const textAfterCursor = currentText.slice(cursorPos)
    
    // Find where the trigger started
    const triggerIndex = Math.max(
      textBeforeCursor.lastIndexOf("@"),
      textBeforeCursor.lastIndexOf("#")
    )
    
    if (triggerIndex !== -1) {
      const beforeTrigger = currentText.slice(0, triggerIndex + 1)
      const newText = beforeTrigger + suggestionText + " " + textAfterCursor
      close()
      return { newText, newCursorPos: beforeTrigger.length + suggestionText.length + 1 }
    }
    close()
    return { newText: currentText, newCursorPos: cursorPos }
  }

  return {
    isOpen,
    type,
    suggestions,
    query,
    handleInput,
    insertSuggestion,
    close
  }
}
