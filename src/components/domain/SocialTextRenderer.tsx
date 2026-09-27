"use client"

import Link from "next/link"
import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

export interface SocialTextRendererProps {
  text?: string
  content?: string
  className?: string
  mentionClassName?: string
  hashtagClassName?: string
}

type Token =
  | { type: "text"; value: string }
  | { type: "mention"; username: string; display: string }
  | { type: "hashtag"; tag: string; normalized: string; display: string }

function parseSocialContent(rawText: string): Token[] {
  if (!rawText) return []

  // Token regex:
  // 1. Email: standard email pattern to prevent false-positive mentions like user@domain.com
  // 2. Mention: @ preceded by non-email/non-word char or start of string, followed by username chars
  // 3. Hashtag: # preceded by non-word char or start of string, followed by hashtag chars
  const tokenRegex = /(?:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))|(?:(?<![a-zA-Z0-9._%+-])@([a-zA-Z0-9_.-]+))|(?:(?<![a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ])#([a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+))/gu

  const tokens: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(rawText)) !== null) {
    const matchStart = match.index
    const matchEnd = tokenRegex.lastIndex

    // Plain text before the current token
    if (matchStart > lastIndex) {
      tokens.push({ type: "text", value: rawText.slice(lastIndex, matchStart) })
    }

    if (match[1]) {
      // 1. Email address -> keep strictly as plain text (never treat as mention)
      tokens.push({ type: "text", value: match[1] })
    } else if (match[2]) {
      // 2. Mention candidate
      let rawUsername = match[2]
      // Strip trailing punctuation that often attaches to mentions in sentences (e.g. "@usuario,", "@usuario.")
      const trailingPunctMatch = rawUsername.match(/[.,:;!?'"()\[\]{}«»“”]+$/)
      let trailingPunct = ""
      if (trailingPunctMatch) {
        trailingPunct = trailingPunctMatch[0]
        rawUsername = rawUsername.slice(0, -trailingPunct.length)
      }

      if (rawUsername.length > 0) {
        tokens.push({
          type: "mention",
          username: rawUsername.toLowerCase(),
          display: `@${rawUsername}`,
        })
      } else {
        tokens.push({ type: "text", value: "@" })
      }

      if (trailingPunct) {
        tokens.push({ type: "text", value: trailingPunct })
      }
    } else if (match[3]) {
      // 3. Hashtag candidate
      let rawTag = match[3]
      const trailingPunctMatch = rawTag.match(/[.,:;!?'"()\[\]{}«»“”]+$/)
      let trailingPunct = ""
      if (trailingPunctMatch) {
        trailingPunct = trailingPunctMatch[0]
        rawTag = rawTag.slice(0, -trailingPunct.length)
      }

      if (rawTag.length > 0) {
        const normalized = rawTag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        tokens.push({
          type: "hashtag",
          tag: rawTag,
          normalized,
          display: `#${rawTag}`,
        })
      } else {
        tokens.push({ type: "text", value: "#" })
      }

      if (trailingPunct) {
        tokens.push({ type: "text", value: trailingPunct })
      }
    }

    lastIndex = matchEnd
  }

  if (lastIndex < rawText.length) {
    tokens.push({ type: "text", value: rawText.slice(lastIndex) })
  }

  return tokens
}

export function SocialTextRenderer({
  text,
  content,
  className,
  mentionClassName,
  hashtagClassName,
}: SocialTextRendererProps) {
  const rawText = text ?? content ?? ""

  const tokens = useMemo(() => parseSocialContent(rawText), [rawText])

  if (!rawText) return null

  const rendered = tokens.map((token, i) => {
    if (token.type === "mention") {
      return (
        <Link
          key={`m-${i}-${token.username}`}
          href={`/@${token.username}`}
          className={cn(
            "font-semibold text-primary hover:underline active:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs relative z-20 pointer-events-auto cursor-pointer",
            mentionClassName
          )}
          onClick={(e) => {
            // Prevent triggering card click handlers, modals, or parent accordions
            e.stopPropagation()
          }}
        >
          {token.display}
        </Link>
      )
    }

    if (token.type === "hashtag") {
      return (
        <Link
          key={`h-${i}-${token.normalized}`}
          href={`/discover?hashtag=${encodeURIComponent(token.normalized)}`}
          className={cn(
            "font-semibold text-primary hover:underline active:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs relative z-20 pointer-events-auto cursor-pointer",
            hashtagClassName
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {token.display}
        </Link>
      )
    }

    return <React.Fragment key={`t-${i}`}>{token.value}</React.Fragment>
  })

  if (className) {
    return <span className={className}>{rendered}</span>
  }

  return <>{rendered}</>
}
