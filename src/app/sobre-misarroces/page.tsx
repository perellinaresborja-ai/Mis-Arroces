import type { Metadata } from "next"
import { Flame, Users, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Sobre misarroces",
  description: "Conoce qué es misarroces. Somos una plataforma digital y red social especializada en arroz, recetas y comunidad. No somos un servicio de restaurante ni catering.",
}

export default function SobreMisArroces() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8 pt-8">
      <div className="w-full max-w-3xl mx-auto px-4 md:px-8 space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">¿Qué es misarroces?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La red social de los arroces. Una plataforma digital diseñada exclusivamente para amantes de la gastronomía arrocera.
          </p>
        </header>

        <section className="bg-card border border-border rounded-3xl p-6 md:p-10 space-y-6 shadow-sm">
          <h2 className="text-2xl font-bold">Nuestra Identidad</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>misarroces.es</strong> es una comunidad online, un punto de encuentro donde chefs, cocineros aficionados y amantes del arroz pueden compartir sus creaciones, descubrir nuevas técnicas y guardar sus recetas favoritas.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 md:p-6 text-foreground">
            <p className="font-medium">
              Aclaración importante: misarroces es una plataforma de software y red social. No somos un restaurante físico, no preparamos comida a domicilio, ni ofrecemos servicios de catering o eventos.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-lg">Recetario Digital</h3>
            <p className="text-sm text-muted-foreground">Guarda, estructura y calcula automáticamente los costes y medidas de tus paellas y arroces.</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">Comunidad</h3>
            <p className="text-sm text-muted-foreground">Conecta con otros arroceros, intercambia conocimientos y muestra tus resultados al mundo.</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg">Herramientas</h3>
            <p className="text-sm text-muted-foreground">Extrae recetas de redes sociales con Inteligencia Artificial o créalas usando tu voz.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
