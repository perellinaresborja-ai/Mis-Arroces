"use client"

import React from "react"
import Link from "next/link"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import {
  BookOpen,
  ChefHat,
  Flame,
  Clock,
  Users,
  Plus,
  Lock,
  ArrowRight,
  Sparkles,
  Scale,
  FolderHeart,
  Share2,
  Eye,
  PenLine,
} from "lucide-react"

export default function CreateRecipeDemoClient() {
  const { user } = useUserSession()
  const { showAuthPrompt } = useAuthPrompt()

  const handleActionClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Si es visitante sin sesión: NUNCA redirige. Permanece en /crear-receta y abre el modal.
    if (!user) {
      showAuthPrompt("Únete a misarroces para guardar tus propias recetas, calcular proporciones y tener tu recetario digital.")
      return
    }
    // Usuario con sesión activa
    window.location.href = "/create/recipe"
  }

  return (
    <div className="min-h-screen bg-sand/30 text-foreground py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* 1. CABECERA PRINCIPAL */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center relative overflow-hidden space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-md" aria-hidden="true">
              <BookOpen className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Tu Recetario Digital
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Crea tu recetario de arroces
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Todos tus arroces, organizados en un único lugar. Guarda cantidades, ingredientes, elaboración, fotos y todos los datos necesarios para volver a cocinarlos siempre que quieras.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2"
            >
              <PenLine className="w-4 h-4" aria-hidden="true" />
              {user ? "Crear nueva receta" : "Empezar mi recetario"}
            </button>
          </div>
        </div>

        {/* 2. BLOQUE VISUAL SENCILLO: Crea → Organiza → Cocina → Comparte */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <h2 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" aria-hidden="true" />
              ¿Cómo funciona?
            </h2>
            <div className="inline-flex items-center justify-center max-w-full gap-1 sm:gap-1.5 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-black text-primary uppercase tracking-normal sm:tracking-wider bg-primary/10 py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full border border-primary/20 w-fit shrink-0">
              <span className="shrink-0">Crea</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/70 shrink-0" aria-hidden="true" />
              <span className="shrink-0">Organiza</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/70 shrink-0" aria-hidden="true" />
              <span className="shrink-0">Cocina</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/70 shrink-0" aria-hidden="true" />
              <span className="shrink-0">Comparte</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span>1. Crea</span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Introduce ingredientes, proporciones de caldo y tiempos con precisión.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <FolderHeart className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span>2. Organiza</span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Clasifica por variedad de grano, estilo de paella y número de raciones.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span>3. Cocina</span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Sigue el paso a paso en modo cocina con temporizadores y aviso de socarrat.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span>4. Comparte</span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Publica tus resultados en la comunidad o consérvalas para ti.
              </p>
            </div>
          </div>
        </div>

        {/* 3. TRANSICIÓN A LA DEMO DEL EDITOR */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Vista previa en vivo
              </span>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                Así es tu recetario en misarroces
              </h2>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Solo lectura
            </span>
          </div>

          {/* DATOS DEL ARROZ */}
          <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                  <ChefHat className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-foreground">Datos del Arroz</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                Editor
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Nombre de la receta</label>
                <div
                  onClick={handleActionClick}
                  className="w-full p-3.5 rounded-2xl border border-border bg-background/60 font-bold text-sm sm:text-base text-foreground cursor-pointer flex items-center justify-between hover:border-primary/40 transition"
                >
                  <span>Arroz del Senyoret tradicional</span>
                  <Lock className="w-4 h-4 text-muted-foreground/60" aria-hidden="true" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div onClick={handleActionClick} className="p-3 rounded-2xl border border-border bg-background/60 cursor-pointer hover:border-primary/40 transition">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variedad</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">Arroz Albufera</span>
                </div>
                <div onClick={handleActionClick} className="p-3 rounded-2xl border border-border bg-background/60 cursor-pointer hover:border-primary/40 transition">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estilo</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">Seco en paella</span>
                </div>
                <div onClick={handleActionClick} className="p-3 rounded-2xl border border-border bg-background/60 cursor-pointer hover:border-primary/40 transition">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Raciones</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">4 personas</span>
                </div>
                <div onClick={handleActionClick} className="p-3 rounded-2xl border border-border bg-background/60 cursor-pointer hover:border-primary/40 transition">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Caldo</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">1.200 ml (1:3)</span>
                </div>
              </div>
            </div>
          </section>

          {/* INGREDIENTES ESTRUCTURADOS (MÁXIMO 3) */}
          <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">Ingredientes estructurados</h3>
              <button
                type="button"
                onClick={handleActionClick}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Añadir ingrediente
              </button>
            </div>

            <div className="space-y-2">
              {[
                { qty: "400 g", name: "Arroz Albufera" },
                { qty: "1.200 ml", name: "Caldo de pescado y morralla" },
                { qty: "250 g", name: "Calamar limpio troceado" },
              ].map((ing, i) => (
                <div
                  key={i}
                  onClick={handleActionClick}
                  className="flex items-center justify-between p-3 rounded-2xl bg-background/60 border border-border/80 text-xs cursor-pointer hover:border-primary/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary w-16">{ing.qty}</span>
                    <span className="font-medium text-foreground">{ing.name}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {/* ELABORACIÓN PASO A PASO (MÁXIMO 2) */}
          <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">Elaboración paso a paso</h3>
              <button
                type="button"
                onClick={handleActionClick}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Añadir paso
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  num: 1,
                  title: "Marcar los ingredientes",
                  desc: "Dorar el calamar a fuego vivo durante 4 minutos hasta sellar y reservar.",
                },
                {
                  num: 2,
                  title: "Cocción y reposo",
                  desc: "Añadir arroz y caldo hirviendo: 8 min a fuego fuerte, 10 min a fuego suave y 5 min de reposo.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  onClick={handleActionClick}
                  className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-1 cursor-pointer hover:border-primary/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                        {step.num}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">{step.title}</h4>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FRASE DE CIERRE DE LA DEMO */}
          <div className="text-center py-1">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>Y todo lo que necesites para documentar tu arroz.</span>
            </p>
          </div>
        </div>

        {/* 4. CTA FINAL */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-black text-xl text-foreground">
              ¿Listo para empezar tu recetario?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Únete a misarroces gratis y ten tus mejores arroces organizados y listos para volver a cocinar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleActionClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2"
          >
            Únete a misarroces
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* VOLVER */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <Link href="/links" className="hover:underline font-semibold">
            Volver a enlaces
          </Link>
        </div>

      </div>
    </div>
  )
}
