"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { WhatDoIHaveView } from "@/components/domain/discover/WhatDoIHaveView"

export function WhatDoIHaveContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("mode")
    const queryStr = params.toString()
    router.push(queryStr ? `/discover?${queryStr}` : "/discover")
  }

  return <WhatDoIHaveView onBack={handleBack} />
}
