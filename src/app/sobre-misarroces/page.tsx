import type { Metadata } from "next"
import { LandingContent } from "@/components/domain/LandingContent"

export const metadata: Metadata = {
  title: "¿Qué es misarroces.es?",
  description: "Conoce qué es misarroces.es. Somos una plataforma digital y red social especializada en arroz, recetas y comunidad. No somos un servicio de restaurante ni catering.",
}

export default function SobreMisArroces() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingContent isHome={false} />
    </div>
  )
}

