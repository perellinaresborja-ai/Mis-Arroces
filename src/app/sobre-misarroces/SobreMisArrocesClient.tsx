"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  Flame,
  Compass,
  Smartphone,
  Sparkles,
  Download,
  ArrowRight,
  Calculator,
  UtensilsCrossed,
  Users,
  CheckCircle2,
} from "lucide-react"

export default function SobreMisArrocesClient() {
  return (
    <div className="min-h-screen bg-sand/30 text-foreground py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* 1. HERO */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center relative overflow-hidden space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-36 h-40 sm:w-44 sm:h-48 mx-auto">
              <Image
                src="/logopngver.webp"
                alt="misarroces"
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Comunidad & Recetario
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                ¿Qué es misarroces?
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                La comunidad y el recetario digital para los apasionados del arroz. Descubre, crea, organiza y comparte tus arroces en un solo lugar.
              </p>
            </div>
          </div>
        </div>

        {/* 2. FUNCIONES AGRUPADAS EN 4 PILARES VISUALES */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="pb-2 border-b border-border/60">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Funcionalidades reales
            </span>
            <h2 className="text-lg sm:text-xl font-black text-foreground">
              Todo lo que necesitas para tus arroces
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

            {/* Pilar 1: Tu recetario */}
            <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border space-y-2.5 hover:border-primary/40 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-foreground">Tu recetario</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crea y organiza tus arroces, cantidades, ingredientes, elaboración, fotos y datos técnicos.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Cantidades exactas
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Paso a paso
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Fotos & ficha
                </span>
              </div>
            </div>

            {/* Pilar 2: Cocina mejor */}
            <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border space-y-2.5 hover:border-primary/40 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Flame className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-foreground">Cocina mejor</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculadora de paella, ajuste de raciones, lista de la compra, modo cocina, costes, nutrición y alérgenos.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Calculadora paella
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Modo cocina
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Escandallo costes
                </span>
              </div>
            </div>

            {/* Pilar 3: Descubre y comparte */}
            <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border space-y-2.5 hover:border-primary/40 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Compass className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-foreground">Descubre y comparte</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Descubre recetas y arroceros, guarda favoritas, publica tus resultados e interactúa con la comunidad.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Comunidad arrocera
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Guardar favoritas
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Publicar platos
                </span>
              </div>
            </div>

            {/* Pilar 4: Trae tus recetas */}
            <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border space-y-2.5 hover:border-primary/40 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-foreground">Trae tus recetas</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Importa tus recetas desde publicaciones o Reels de Instagram o pega el enlace de una receta de cualquier web. misarroces la organiza para que puedas revisarla y guardarla en tu recetario.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Desde Instagram Reels
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Desde cualquier web
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                  Organización lista
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. BLOQUE INSTAGRAM / WEB */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5 pb-2 border-b border-border/60">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Instagram & Páginas Web
              </span>
              <h3 className="font-bold text-base sm:text-lg text-foreground">
                ¿Publicas en Instagram o tienes recetas en la web?
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            No dejes que tus recetas se pierdan en tu feed ni guardadas en pestañas del navegador. Pega el enlace de un post, Reel o de cualquier página web y misarroces la organiza en una ficha lista para que puedas revisarla y añadirla a tu recetario.
          </p>

          <div className="pt-1">
            <Link
              href="/importar-instagram"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-xs sm:text-sm shadow-xs transition hover:bg-muted/40 inline-flex items-center justify-center gap-2"
            >
              <span>Ver cómo importar recetas</span>
              <ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 4. CTA FINAL */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto" aria-hidden="true">
            <Flame className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Lleva misarroces contigo
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tu recetario, tus arroces y toda la comunidad siempre a mano.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              href="/descargar"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2.5"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Descargar la app
            </Link>
          </div>
        </div>

        {/* VOLVER A ENLACES */}
        <div className="text-center text-xs text-muted-foreground">
          <Link href="/links" className="hover:underline font-semibold">
            Volver a enlaces
          </Link>
        </div>

        {/* TEXTO LEGAL */}
        <footer className="pt-4 pb-8">
          <div className="border-t border-border pt-6">
            <p className="text-[11px] text-muted-foreground/60 text-center max-w-xl mx-auto leading-relaxed">
              misarroces.es es una plataforma digital y red social especializada en gastronomía arrocera. No es un restaurante ni un servicio de restauración o catering.
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
