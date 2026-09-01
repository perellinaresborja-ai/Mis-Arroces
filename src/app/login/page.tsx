import Image from "next/image"
import { LoginForm } from "./LoginForm"

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const resolvedParams = await searchParams
  
  const covers = [
    {
      src: "/arroces/carneret.png",
      title: <>Tu pasión por el <span className="text-primary">arroz</span>, en un solo lugar.</>,
      subtitle: "Descubre nuevas recetas y nuevos arroceros."
    },
    {
      src: "/arroces/marret.png",
      title: <>Comparte tus <span className="text-primary">arroces</span>.</>,
      subtitle: "Inspira, descubre y conecta con otros arroceros."
    },
    {
      src: "/arroces/lallar.jpg",
      title: <>Cocina. Aprende. <span className="text-primary">Mejora.</span></>,
      subtitle: "Guarda cada elaboración y construye tu propia experiencia arrocera."
    }
  ]
  const randomCover = covers[Math.floor(Math.random() * covers.length)]

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-screen bg-sand overflow-hidden">
      
      {/* LEFT ZONE - VISUAL (Hidden on Mobile, 60% on Desktop) */}
      <div className="hidden lg:flex relative w-3/5 h-full bg-charcoal items-center justify-center overflow-hidden">
        
        {/* Background Image */}
        <Image 
          src={randomCover.src}
          alt="Mis Arroces Cover"
          fill
          className="object-cover opacity-80"
          priority
        />

        {/* Visual Treatments (Vignette, Gradients) */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-charcoal/80" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

        {/* Content over image */}
        <div className="absolute inset-0 flex flex-col p-12 md:p-16 lg:p-24 justify-end z-10">
          {/* Slogan */}
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-cream drop-shadow-2xl leading-tight">
              {randomCover.title}
            </h1>
            <p className="text-xl lg:text-2xl text-cream/80 font-medium max-w-2xl drop-shadow-md leading-snug">
              {randomCover.subtitle}
            </p>
          </div>
        </div>

        {/* Photo Attribution */}
        {randomCover.src === "/arroces/lallar.jpg" && (
          <div className="absolute bottom-4 right-6 z-20">
            <p className="text-[14px] text-white/35 font-medium tracking-wide drop-shadow-md">
              Foto cedida por La Llar Arròs i Brases
            </p>
          </div>
        )}
      </div>

      {/* RIGHT ZONE - LOGIN FORM (Full width on Mobile, 40% on Desktop) */}
      <div className="flex-1 flex flex-col items-center pt-8 lg:pt-[12vh] px-6 relative h-full">
        
        <div className="w-full max-w-sm flex flex-col items-center shrink-0 mb-4">
          <div className="relative w-56 h-56 lg:w-[320px] lg:h-[320px]">
            <Image 
              src="/logover.png" 
              alt="Mis Arroces" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <LoginForm error={resolvedParams.error} message={resolvedParams.message} />
        
        {/* Mobile slogan fallback (very discreet) */}
        <div className="lg:hidden mt-12 text-center px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
            {randomCover.title}
          </p>
        </div>
      </div>

    </div>
  )
}
