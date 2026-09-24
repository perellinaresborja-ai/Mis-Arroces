"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUserSession } from "@/components/providers/UserSessionProvider"
import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"
import {
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  ChefHat,
  Flame,
  Clock,
  Users,
  Lock,
} from "lucide-react"

export default function ImportInstagramClient() {
  const { user } = useUserSession()
  const { showAuthPrompt } = useAuthPrompt()
  const [url, setUrl] = useState("")

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      window.location.href = `/create/recipe#import`
    } else {
      showAuthPrompt("Únete a misarroces para traer tus recetas y guardarlas en tu recetario digital.")
    }
  }

  const handleActionClick = () => {
    if (user) {
      window.location.href = `/create/recipe#import`
    } else {
      showAuthPrompt("Únete a misarroces para traer tus recetas y guardarlas en tu recetario digital.")
    }
  }

  return (
    <div className="min-h-screen bg-sand/30 text-foreground py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* HERO CARD */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center relative overflow-hidden space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Función Exclusiva
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Trae tus recetas de Instagram
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Pega el enlace de un Reel, una publicación de Instagram o una receta de cualquier web. misarroces organiza ingredientes, cantidades y pasos para integrarlos en tu recetario.
              </p>
            </div>
          </div>

          {/* FORMULARIO INTERACTIVO (DEMO / ACCIÓN) */}
          <form onSubmit={handleImportSubmit} className="pt-2 max-w-xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enlace de Instagram o de una página web..."
                className="w-full h-14 pl-4 pr-32 rounded-2xl border border-border bg-background/80 text-foreground text-sm focus:ring-2 focus:ring-primary outline-none shadow-xs transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-95 transition shadow-xs flex items-center gap-1.5"
              >
                {!user && <Lock className="w-3.5 h-3.5 opacity-80" />}
                Importar
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Funciona con publicaciones y Reels de Instagram y con enlaces de recetas de páginas web.
            </p>
          </form>
        </div>

        {/* PASO A PASO */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-background/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-foreground">Copia el enlace</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Copia el enlace de la receta desde Instagram o desde cualquier página web compatible.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-foreground">Estructuración automática</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                misarroces analiza el contenido y detecta ingredientes, proporciones de caldo y orden de cocina.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-background/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-foreground">En tu recetario</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Se guarda en tu cuaderno lista para cocinar, con escalador de raciones y cálculo de socarrat.
              </p>
            </div>
          </div>
        </div>

        {/* EJEMPLO REAL DE RECETA IMPORTADA (PREVIEW VISUAL) */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Ejemplo de resultado</span>
              <h3 className="font-bold text-base text-foreground">Arroz de Secreto y Boletus</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-bold border border-green-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Estructurada
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-background/60 border border-border">
              <span className="text-muted-foreground block text-[10px]">Raciones</span>
              <span className="font-bold text-foreground">4 personas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 border border-border">
              <span className="text-muted-foreground block text-[10px]">Arroz / Caldo</span>
              <span className="font-bold text-foreground">400g / 1.200ml</span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 border border-border">
              <span className="text-muted-foreground block text-[10px]">Cocción</span>
              <span className="font-bold text-foreground">18 minutos</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-background/40 border border-border/80 text-xs space-y-1">
            <span className="font-bold text-muted-foreground text-[10px] uppercase">Ingredientes identificados:</span>
            <p className="text-muted-foreground">
              Arroz bomba, secreto ibérico, boletus edulis, sofrito de cebolla caramelizada, fondo de carne, aceite de oliva virgen extra.
            </p>
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-black text-xl text-foreground">
              ¿Listo para guardar tus recetas favoritas?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Únete a misarroces gratis y empieza a traer recetas a tu recetario digital.
            </p>
          </div>

          <button
            type="button"
            onClick={handleActionClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2"
          >
            Únete a misarroces
            <ArrowRight className="w-4 h-4" />
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
