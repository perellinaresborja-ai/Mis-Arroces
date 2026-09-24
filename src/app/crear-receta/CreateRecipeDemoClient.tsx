"use client"

import React, { useState } from "react"
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
  Trash2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  Save,
  Send,
  Eye,
} from "lucide-react"

export default function CreateRecipeDemoClient() {
  const { user } = useUserSession()
  const { showAuthPrompt } = useAuthPrompt()

  const handleActionClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (user) {
      window.location.href = "/create/recipe"
    } else {
      showAuthPrompt("Únete a misarroces para guardar tus propias recetas, calcular proporciones y crear tu recetario digital.")
    }
  }

  return (
    <div className="min-h-screen bg-sand/30 text-foreground pb-24 font-sans">
      
      {/* BANNER FLOTANTE DE MODO DEMOSTRACIÓN */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-xs px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Vista previa del Editor de Recetas
              </p>
              <p className="text-[11px] text-muted-foreground">
                Modo demostración solo lectura. Pulsa cualquier botón para empezar tu recetario.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleActionClick()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-xs hover:opacity-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {user ? "Crear nueva receta" : "Únete para crear la tuya"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL EDITOR EN MODO DEMO */}
      <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

        {/* DATOS PRINCIPALES */}
        <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-base text-foreground">Datos del Arroz</h2>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              Demostración
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Nombre de la receta</label>
              <div
                onClick={() => handleActionClick()}
                className="w-full p-3.5 rounded-2xl border border-border bg-background/60 font-bold text-base text-foreground cursor-pointer flex items-center justify-between hover:border-primary/40 transition"
              >
                <span>Arroz del Senyoret tradicional</span>
                <Lock className="w-4 h-4 text-muted-foreground/60" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Estilo de arroz</label>
                <div onClick={() => handleActionClick()} className="p-3 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  <span>Arroz seco en paella</span>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Variedad de arroz</label>
                <div onClick={() => handleActionClick()} className="p-3 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  <span>Arroz Albufera</span>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Fuente de calor</label>
                <div onClick={() => handleActionClick()} className="p-3 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  <span>Gas (Paellero)</span>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARÁMETROS DE ARROZ Y CALDO (LA CLAVE DE MISARROCES) */}
        <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Cantidades y Proporciones</h2>
              <p className="text-xs text-muted-foreground">Cálculo milimétrico de gramaje y líquidos.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div onClick={() => handleActionClick()} className="p-4 rounded-2xl bg-background/60 border border-border text-center cursor-pointer hover:border-primary/40 transition">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Raciones</span>
              <span className="text-base font-black text-foreground">4 personas</span>
            </div>

            <div onClick={() => handleActionClick()} className="p-4 rounded-2xl bg-background/60 border border-border text-center cursor-pointer hover:border-primary/40 transition">
              <ChefHat className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Arroz</span>
              <span className="text-base font-black text-foreground">400 gramos</span>
            </div>

            <div onClick={() => handleActionClick()} className="p-4 rounded-2xl bg-background/60 border border-border text-center cursor-pointer hover:border-primary/40 transition">
              <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Caldo</span>
              <span className="text-base font-black text-foreground">1.200 ml (1:3)</span>
            </div>

            <div onClick={() => handleActionClick()} className="p-4 rounded-2xl bg-background/60 border border-border text-center cursor-pointer hover:border-primary/40 transition">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Cocción</span>
              <span className="text-base font-black text-foreground">18 min + 5 rep.</span>
            </div>
          </div>
        </section>

        {/* INGREDIENTES */}
        <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="font-bold text-base text-foreground">Ingredientes estructurados</h2>
            <button
              type="button"
              onClick={() => handleActionClick()}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir ingrediente
            </button>
          </div>

          <div className="space-y-2">
            {[
              { qty: "400 g", name: "Arroz Albufera" },
              { qty: "1.200 ml", name: "Caldo de pescado y morralla" },
              { qty: "250 g", name: "Calamar limpio troceado" },
              { qty: "200 g", name: "Gamba pelada fresca" },
              { qty: "200 g", name: "Rape limpio en dados" },
              { qty: "2 cdas", name: "Salmorreta alicantina" },
              { qty: "80 ml", name: "Aceite de oliva virgen extra" },
              { qty: "4 hebras", name: "Azafrán en hebra" },
            ].map((ing, i) => (
              <div
                key={i}
                onClick={() => handleActionClick()}
                className="flex items-center justify-between p-3 rounded-2xl bg-background/60 border border-border/80 text-xs cursor-pointer hover:border-primary/30 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary w-16">{ing.qty}</span>
                  <span className="font-medium text-foreground">{ing.name}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        </section>

        {/* PASOS DE COCINA */}
        <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="font-bold text-base text-foreground">Elaboración paso a paso</h2>
            <button
              type="button"
              onClick={() => handleActionClick()}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir paso
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                title: "Marcar el marisco",
                desc: "Sofreír el rape y los calamares con el aceite a fuego medio durante 4-5 minutos hasta dorar. Retirar y reservar.",
              },
              {
                num: 2,
                title: "Nacarar el arroz con la salmorreta",
                desc: "Añadir la salmorreta al centro de la paella, remover con el aceite residual e incorporar el arroz para nacararlo durante 2 minutos.",
              },
              {
                num: 3,
                title: "Cocción y socarrat",
                desc: "Verter el caldo hirviendo con el azafrán disuelto. Cocinar 8 min a fuego vivo y 10 min a fuego suave. En los últimos 3 minutos buscar el socarrat.",
              },
            ].map((step) => (
              <div
                key={step.num}
                onClick={() => handleActionClick()}
                className="p-4 rounded-2xl bg-background/60 border border-border space-y-1.5 cursor-pointer hover:border-primary/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                      {step.num}
                    </span>
                    <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BARRA DE ACCIÓN INFERIOR */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-sm text-foreground">¿Quieres empezar tu recetario digital?</p>
            <p className="text-xs text-muted-foreground">
              Guarda tus recetas, añade fotos y calcula raciones automáticamente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleActionClick()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Crear mi recetario gratis
          </button>
        </div>

        {/* VOLVER */}
        <div className="text-center text-xs text-muted-foreground">
          <Link href="/links" className="hover:underline font-semibold">
            Volver a enlaces
          </Link>
        </div>

      </main>
    </div>
  )
}
