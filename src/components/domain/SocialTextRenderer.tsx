"use client"

import Link from "next/link"
import React from "react"

export function SocialTextRenderer({ text }: { text: string }) {
  if (!text) return null

  // A very basic parser that splits by spaces but preserves tokens
  const words = text.split(/(\s+)/)
  
  return (
    <>
      {words.map((word, i) => {
        if (word.startsWith("@") && word.length > 1) {
          const username = word.substring(1).replace(/[^\w.-]/g, "")
          const punctuation = word.substring(1 + username.length)
          return (
            <React.Fragment key={i}>
              <Link 
                href={`/@${username}`} 
                className="font-bold text-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                @{username}
              </Link>
              {punctuation}
            </React.Fragment>
          )
        }
        
        if (word.startsWith("#") && word.length > 1) {
          const tag = word.substring(1).replace(/[^\wñÑáéíóúÁÉÍÓÚ]/g, "")
          const punctuation = word.substring(1 + tag.length)
          const normalized = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          return (
            <React.Fragment key={i}>
              <Link 
                href={`/discover?hashtag=${normalized}`} 
                className="font-bold text-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
              {punctuation}
            </React.Fragment>
          )
        }
        
        return <span key={i}>{word}</span>
      })}
    </>
  )
}
