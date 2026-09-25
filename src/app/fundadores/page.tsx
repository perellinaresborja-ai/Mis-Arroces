import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Lock } from "lucide-react"
import { FundadoresCTA } from "./FundadoresCTA"

export const metadata: Metadata = {
  title: "Los 100 Arroceros Fundadores | misarroces",
  description: "Una invitación para formar parte del inicio de misarroces.",
  openGraph: {
    title: "Los 100 Arroceros Fundadores | misarroces",
    description: "Una invitación para formar parte del inicio de misarroces.",
    url: "/fundadores",
    siteName: "misarroces",
    images: [
      {
        url: "/logover.png",
        width: 1200,
        height: 630,
        alt: "Los 100 Arroceros Fundadores | misarroces",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Los 100 Arroceros Fundadores | misarroces",
    description: "Una invitación para formar parte del inicio de misarroces.",
    images: ["/logover.png"],
  },
}

export const dynamic = "force-dynamic"

export default async function FundadoresPage() {
  const supabase = await createClient()
  
  // Comprobar únicamente si el cupo ya está completado
  let isClosed = false
  try {
    const { count } = await supabase
      .from('founders')
      .select('*', { count: 'exact', head: true })
    isClosed = (count || 0) >= 100
  } catch {
    isClosed = false
  }

  return (
    <div className="min-h-[100dvh] bg-[#F7F5F0] text-[#18181B] selection:bg-[#EA580C] selection:text-white flex flex-col items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#EA580C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#EA580C]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Logo misarroces */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6">
          <Image
            src="/logopngver.webp"
            alt="misarroces"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-balance">
          Los 100 <br />
          Arroceros <span className="text-[#EA580C]">Fundadores</span>
        </h1>

        <p className="text-base md:text-lg text-[#52525B] mb-8 text-balance max-w-xl leading-relaxed">
          Solo existirán 100 Arroceros Fundadores en misarroces.es. Una distinción permanente e irrepetible para quienes forman parte del inicio de la comunidad.
        </p>

        {/* Action Card */}
        <div className="bg-white border border-[#EAE7E0] p-8 rounded-[2rem] shadow-sm w-full max-w-md mb-10 relative overflow-hidden">
          {isClosed ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-600">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#18181B] mb-2">Plazas cerradas</h2>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Los 100 Arroceros Fundadores ya se han completado. Esta distinción ha quedado cerrada para siempre.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-[#52525B] leading-relaxed mb-6">
                Para formar parte de Los 100, regístrate y publica tu primera receta mientras el acceso siga abierto. Una vez completadas las plazas, se cerrará de forma automática y definitiva.
              </p>
              <FundadoresCTA />
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-xl text-left">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-[#EAE7E0]">
            <h3 className="font-bold text-[#18181B] mb-1.5 text-sm">ID Fundador Permanente</h3>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Tu identificación digital como miembro de Los 100. Personal, permanente e intransferible.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-[#EAE7E0]">
            <h3 className="font-bold text-[#18181B] mb-1.5 text-sm">Cultura y Experiencias</h3>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Tu condición de Arrocero Fundador estará vinculada a futuras jornadas, catas, concursos y experiencias de la comunidad.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
