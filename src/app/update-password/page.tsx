import Image from "next/image"
import { UpdatePasswordForm } from "./UpdatePasswordForm"

export const dynamic = "force-dynamic"

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams
  
  const covers = [
    "/arroces/carneret.png",
    "/arroces/marret.png",
    "/arroces/lallar.jpg"
  ]
  const randomCover = covers[Math.floor(Math.random() * covers.length)]

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-screen bg-sand overflow-hidden">
      
      {/* LEFT ZONE - VISUAL */}
      <div className="hidden lg:flex relative w-3/5 h-full bg-charcoal items-center justify-center overflow-hidden">
        
        <Image 
          src={randomCover}
          alt="Mis Arroces Cover"
          fill
          className="object-cover opacity-80"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-charcoal/80" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

        <div className="absolute inset-0 flex flex-col p-12 md:p-16 lg:p-24 justify-between z-10">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image 
              src="/mpng.png" 
              alt="Símbolo Mis Arroces" 
              fill
              className="object-contain object-left-top drop-shadow-2xl"
            />
          </div>

          <div className="space-y-0">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-cream drop-shadow-2xl leading-[0.85]">
              Vamos al
              <br />
              <span className="text-primary">grano.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* RIGHT ZONE - FORM */}
      <div className="flex-1 flex flex-col items-center pt-8 lg:pt-[12vh] px-6 relative h-full">
        <div className="w-full max-w-sm flex flex-col items-center shrink-0 mb-4">
          <div className="relative w-40 h-40 lg:w-56 lg:h-56">
            <Image 
              src="/mpng.png" 
              alt="Mis Arroces" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <UpdatePasswordForm error={resolvedParams.error} />
        
        <div className="lg:hidden mt-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            Vamos al grano.
          </p>
        </div>
      </div>
    </div>
  )
}
