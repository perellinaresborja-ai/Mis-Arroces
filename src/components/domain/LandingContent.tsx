import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Flame, Users, BookOpen, Compass, ShoppingCart, Calculator, Coins, Leaf, ChefHat, Mic, Link as LinkIcon, Smartphone } from "lucide-react"
import { InstagramCTA } from "@/app/sobre-misarroces/InstagramCTA"

export function LandingContent({ isHome = false }: { isHome?: boolean }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 space-y-16 pb-24 md:pb-8 pt-4 md:pt-12">
      {/* Hero Section */}
      <header className="text-center space-y-6 pt-8">
        <div className="relative w-48 h-32 md:w-64 md:h-48 mx-auto mb-6">
          <Image src="/logover.png" alt="Mis Arroces Logo" fill sizes="400px" className="object-contain" priority />
        </div>
        {isHome ? (
          <h1 className="sr-only">misarroces</h1>
        ) : (
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            ¿Qué es misarroces.es?
          </h1>
        )}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          La red social de los arroces. Una comunidad exclusiva para arroceros. Descubre, guarda y comparte las mejores recetas y paellas con el mundo.
        </p>
        <div className="pt-6">
          {isHome ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className={buttonVariants({ size: "lg", className: "rounded-xl font-bold text-lg px-10 h-14 w-full sm:w-auto" })}>
                Crear cuenta
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-xl font-bold text-lg px-10 h-14 w-full sm:w-auto" })}>
                Entrar
              </Link>
            </div>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "lg", className: "rounded-xl font-bold text-lg px-10 h-14" })}>
              Unirse a misarroces.es
            </Link>
          )}
        </div>
      </header>

      {/* Core Features */}
      <section className="space-y-8 pt-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Todo lo que necesitas para tus arroces</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Herramientas diseñadas por y para cocineros para llevar tus arroces<br />al siguiente nivel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6" />} 
            title="Tu Recetario Digital" 
            desc="Crea y organiza tu propio recetario de arroces de forma estructurada y profesional."
          />
          <FeatureCard 
            icon={<Compass className="w-6 h-6" />} 
            title="Descubre" 
            desc="Explora recetas de otros arroceros, inspírate con nuevas técnicas y descubre perfiles interesantes."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6" />} 
            title="Comunidad" 
            desc="Interactúa con apasionados del arroz, comenta, valora y comparte tus propios resultados."
          />
          <FeatureCard 
            icon={<Mic className="w-6 h-6" />} 
            title="Creación Inteligente" 
            desc="Añade recetas escribiéndolas paso a paso o simplemente cuéntaselo a la app usando tu voz."
          />
          <FeatureCard 
            icon={<LinkIcon className="w-6 h-6" />} 
            title="Importador Web" 
            desc="Pega el enlace de una receta publicada en una web y la IA la estructurará automáticamente en tu recetario."
          />
          <FeatureCard 
            icon={<ShoppingCart className="w-6 h-6" />} 
            title="Lista de la Compra" 
            desc="Genera la lista de la compra al instante con los ingredientes exactos que necesitas para cocinar."
          />
          <FeatureCard 
            icon={<Calculator className="w-6 h-6" />} 
            title="Calculadora de Paella" 
            desc="Calcula la medida ideal de tu paella y ajusta las raciones automáticamente según los comensales."
          />
          <FeatureCard 
            icon={<ChefHat className="w-6 h-6" />} 
            title="Modo Cocina" 
            desc="Sigue la receta paso a paso de forma cómoda mientras cocinas."
          />
          <FeatureCard 
            icon={<Coins className="w-6 h-6" />} 
            title="Coste de la receta" 
            desc="Nuestra herramienta calcula automáticamente el coste total de la receta y el precio por ración."
          />
          <FeatureCard 
            icon={<Leaf className="w-6 h-6" />} 
            title="Nutrición y Alérgenos" 
            desc="Obtén la información nutricional completa y los avisos de alérgenos de cada elaboración."
          />
        </div>
      </section>

      {/* Instagram Highlight */}
      <section className="bg-gradient-to-br from-[#FFF5ED] to-[#FFE8D6] dark:from-orange-950/40 dark:to-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8 shadow-sm my-12">
        <div className="w-24 h-24 shrink-0 bg-white dark:bg-black rounded-3xl flex items-center justify-center shadow-md">
          <Smartphone className="w-12 h-12 text-orange-600 dark:text-orange-500" />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">¿Ya publicas tus arroces en Instagram?</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            No dejes que tus recetas se pierdan en tu feed. Pega el enlace de tu publicación o Reel y misarroces.es la convierte en un borrador de receta organizado que podrás revisar, editar y guardar en tu recetario.
          </p>
          <InstagramCTA />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-card border border-border rounded-3xl p-8 md:p-14 text-center space-y-6 shadow-sm">
        <Flame className="w-14 h-14 text-orange-500 mx-auto" />
        <h2 className="text-3xl md:text-4xl font-bold">Empieza a cocinar con nosotros</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Únete a una comunidad creada para quienes disfrutan cocinando, compartiendo y aprendiendo sobre arroz.
        </p>
        <div className="pt-6">
          {isHome ? (
            <Link href="/login" className={buttonVariants({ size: "lg", className: "rounded-xl font-bold text-lg px-10 h-14" })}>
              Crear cuenta
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "lg", className: "rounded-xl font-bold text-lg px-10 h-14" })}>
              Crear mi cuenta
            </Link>
          )}
        </div>
      </section>

      {/* SEO Disambiguation (Discreet) */}
      <footer className="pt-12 pb-8">
        <div className="border-t border-border pt-8">
          <p className="text-[11px] text-muted-foreground/50 text-center max-w-4xl mx-auto leading-relaxed">
            misarroces.es es una plataforma digital y red social especializada en gastronomía arrocera. No es un restaurante ni un servicio de restauración o catering.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col space-y-4 hover:border-orange-500/30 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/50 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
