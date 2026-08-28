"use client"

import { useEffect } from "react"

export function SetInviteCookie({ code }: { code: string }) {
  useEffect(() => {
    // Set the cookie client-side so it can be read by server components later
    // Max age is 7 days (60 * 60 * 24 * 7 = 604800 seconds)
    document.cookie = `misarroces_invite_code=${code}; path=/; max-age=604800; SameSite=Lax`
  }, [code])

  return null
}
