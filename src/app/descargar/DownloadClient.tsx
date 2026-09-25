"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePwa } from "@/components/providers/PwaProvider"
import { APP_STORE_CONFIG } from "@/lib/constants/app-stores"
import {
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  Check,
  Copy,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react"

export default function DownloadClient() {
  const { isInstalled, canInstall, promptInstall } = usePwa()
  const [platform, setPlatform] = useState<"ios" | "android">("android")
  const [copied, setCopied] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)

  // Enlaces oficiales configurados (vacíos mientras se completa la publicación en tiendas)
  const hasGooglePlay = Boolean(APP_STORE_CONFIG.googlePlayUrl)
  const hasAppStore = Boolean(APP_STORE_CONFIG.appStoreUrl)

  // Detección automática en montaje
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform("ios")
      } else {
        setPlatform("android")
      }

      // Detectar si estamos en un navegador incrustado de redes sociales (Instagram, TikTok, FB, etc.)
      const inApp = /fban|fbav|instagram|tiktok|line|twitter|micromessenger|snapchat/i.test(navigator.userAgent || "")
      setIsInAppBrowser(inApp)
    }
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://www.misarroces.es/descargar")
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback silencioso
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Descarga misarroces",
          text: "Recetas, cálculo de arroz milimétrico, bitácora y comunidad en la palma de tu mano.",
          url: "https://www.misarroces.es/descargar",
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleAndroidInstallClick = async () => {
    if (isInstalled) return

    setInstalling(true)
    try {
      // 1. Si el prompt de instalación nativo está disponible, lanzarlo directamente
      const hasPrompt = canInstall || (typeof window !== "undefined" && Boolean((window as any).__deferredPrompt))
      if (hasPrompt) {
        const accepted = await promptInstall()
        if (accepted) return
      }

      // 2. Si todavía no está listo pero podría recibirse, esperar brevemente a pwa-prompt-ready
      if (typeof window !== "undefined" && !(window as any).__deferredPrompt) {
        const ready = await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => resolve(false), 500)
          const onReady = () => {
            clearTimeout(timer)
            window.removeEventListener("pwa-prompt-ready", onReady)
            resolve(true)
          }
          window.addEventListener("pwa-prompt-ready", onReady, { once: true })
        })

        if (ready) {
          const accepted = await promptInstall()
          if (accepted) return
        }
      }

      // 3. Si el navegador no admite prompt nativo o no lo proporciona, SIEMPRE responder:
      // Mostrar modal interactivo con instrucciones paso a paso
      setShowInstructionsModal(true)
      const el = document.getElementById("android-steps")
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    } finally {
      setInstalling(false)
    }
  }

  const handleIosInstallClick = () => {
    if (isInstalled) return
    setShowInstructionsModal(true)
    const el = document.getElementById("ios-steps")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-sand/30 text-foreground py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        
        {/* CABECERA / HERO */}
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
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> App Oficial
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Descarga misarroces
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Recetas, cálculo de arroz milimétrico, bitácora y comunidad en la palma de tu mano.
              </p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE PLATAFORMA */}
        <div className="bg-card border border-border rounded-2xl p-1.5 shadow-xs flex gap-1.5">
          <button
            type="button"
            onClick={() => setPlatform("ios")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              platform === "ios"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {/* Apple Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170" aria-hidden="true">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.98-12.03-14.7-6.02-9.24-10.74-19.81-14.15-31.73-3.41-11.91-5.12-23.1-5.12-33.56 0-15.01 3.8-27.42 11.39-37.22 7.6-9.8 17.06-14.83 28.4-15.09 5.03 0 10.59 1.34 16.68 4.02 6.09 2.68 10.15 4.08 12.18 4.2 1.83 0 6.04-1.47 12.63-4.41 6.59-2.94 12.35-4.29 17.27-4.05 13.06.84 23.33 5.48 30.82 13.92-11.51 6.96-17.15 16.58-16.92 28.87.23 9.71 3.96 17.7 11.19 23.97 7.23 6.27 15.7 9.87 25.4 10.8-2.35 7.18-4.78 13.8-7.29 19.86zM119.22 33.16c0-6.96 2.5-13.62 7.5-19.98 5-6.36 11.16-10.74 18.49-13.14-.11 1.25-.17 2.4-.17 3.44 0 6.96-2.58 13.66-7.75 20.1-5.17 6.44-11.33 10.7-18.49 12.78-.11-1.04-.17-2.1-.17-3.2z" />
            </svg>
            iPhone (iOS)
          </button>

          <button
            type="button"
            onClick={() => setPlatform("android")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              platform === "android"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {/* Android Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5896 8.358 13.8566 8 12 8s-3.5896.358-5.1368.9497L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
            Android
          </button>
        </div>

        {/* CONTENIDO IPHONE (iOS) */}
        {platform === "ios" && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/60">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-foreground">
                  {hasAppStore ? "Descarga para iPhone" : "Instalar en iPhone"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {hasAppStore ? "Disponible en el App Store oficial" : "Instalación en 3 toques desde Safari, sin descargas pesadas."}
                </p>
              </div>
            </div>

            {/* ESTADO INSTALADA O BOTÓN DE INSTALACIÓN */}
            {isInstalled ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base text-foreground">misarroces ya está instalada</p>
                  <p className="text-xs text-muted-foreground">La aplicación ya está instalada en tu iPhone.</p>
                </div>
                <Link
                  href="/feed"
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-xs"
                >
                  Abrir
                </Link>
              </div>
            ) : hasAppStore ? (
              <a
                href={APP_STORE_CONFIG.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-foreground text-background font-black text-sm shadow-md hover:opacity-90 active:scale-[0.99] transition"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170" aria-hidden="true">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.98-12.03-14.7-6.02-9.24-10.74-19.81-14.15-31.73-3.41-11.91-5.12-23.1-5.12-33.56 0-15.01 3.8-27.42 11.39-37.22 7.6-9.8 17.06-14.83 28.4-15.09 5.03 0 10.59 1.34 16.68 4.02 6.09 2.68 10.15 4.08 12.18 4.2 1.83 0 6.04-1.47 12.63-4.41 6.59-2.94 12.35-4.29 17.27-4.05 13.06.84 23.33 5.48 30.82 13.92-11.51 6.96-17.15 16.58-16.92 28.87.23 9.71 3.96 17.7 11.19 23.97 7.23 6.27 15.7 9.87 25.4 10.8-2.35 7.18-4.78 13.8-7.29 19.86zM119.22 33.16c0-6.96 2.5-13.62 7.5-19.98 5-6.36 11.16-10.74 18.49-13.14-.11 1.25-.17 2.4-.17 3.44 0 6.96-2.58 13.66-7.75 20.1-5.17 6.44-11.33 10.7-18.49 12.78-.11-1.04-.17-2.1-.17-3.2z" />
                </svg>
                <span>Descargar en App Store</span>
              </a>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleIosInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base shadow-md hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                >
                  <PlusSquare className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                  Añadir misarroces al iPhone
                </button>
                <p className="text-[11px] text-muted-foreground/70 text-center">
                  Publicación en App Store en proceso.
                </p>
              </div>
            )}

            {/* PASOS SAFARI */}
            <div id="ios-steps" className="space-y-3 pt-1">
              {/* Paso 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Abre en Safari</p>
                  <p className="text-muted-foreground">
                    Abre este enlace directamente en el navegador <strong>Safari</strong> de tu iPhone.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    Toca Compartir
                    <Share className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </p>
                  <p className="text-muted-foreground">
                    En la barra inferior de Safari, pulsa el botón central de <strong>Compartir</strong> (icono del recuadro con flecha arriba).
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    "Añadir a pantalla de inicio"
                    <PlusSquare className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </p>
                  <p className="text-muted-foreground">
                    Desliza hacia abajo en el menú y selecciona <strong>Añadir a pantalla de inicio</strong>. Pulsa <strong>Añadir</strong> arriba a la derecha.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO ANDROID */}
        {platform === "android" && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/60">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-foreground">
                  {hasGooglePlay ? "Descarga para Android" : "Instalar en Android"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {hasGooglePlay ? "Disponible en Google Play Store oficial" : "Instalación directa en tu móvil a pantalla completa."}
                </p>
              </div>
            </div>

            {/* ESTADO INSTALADA O BOTÓN DE INSTALACIÓN */}
            {isInstalled ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base text-foreground">misarroces ya está instalada</p>
                  <p className="text-xs text-muted-foreground">La aplicación ya está instalada en tu dispositivo Android.</p>
                </div>
                <Link
                  href="/feed"
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-xs"
                >
                  Abrir
                </Link>
              </div>
            ) : hasGooglePlay ? (
              <a
                href={APP_STORE_CONFIG.googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-foreground text-background font-black text-sm shadow-md hover:opacity-90 active:scale-[0.99] transition"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.61-.937V2.751c.14-.38.358-.707.61-.937zm11.242 11.244l2.455 2.455-10.98 6.223 8.525-8.678zm2.455-2.116L14.85 8.487l-8.525-8.68 10.98 6.225 2.455 2.455a1.5 1.5 0 0 1 0 2.456zm1.058-1.058l3.155 1.787a1.498 1.498 0 0 1 0 2.628l-3.155 1.787-2.197-2.197 2.197-2.205z" />
                </svg>
                <span>Descargar en Google Play</span>
              </a>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleAndroidInstallClick}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base shadow-md hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                  {installing ? "Abriendo instalador..." : "Instalar misarroces"}
                </button>
                <p className="text-[11px] text-muted-foreground/70 text-center">
                  Publicación en Google Play Store en proceso.
                </p>
              </div>
            )}

            {/* PASOS CHROME */}
            <div id="android-steps" className="space-y-3 pt-1">
              {/* Paso 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Abre en Google Chrome</p>
                  <p className="text-muted-foreground">
                    Abre este enlace en tu navegador <strong>Chrome</strong> en Android.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    Menú de opciones
                    <MoreVertical className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </p>
                  <p className="text-muted-foreground">
                    Toca en el menú de los <strong>3 puntos (⋮)</strong> arriba a la derecha de Chrome (o en el banner de "Instalar" si te aparece abajo).
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-border/80">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground">
                    "Instalar aplicación" o "Añadir a pantalla de inicio"
                  </p>
                  <p className="text-muted-foreground">
                    Selecciona <strong>Instalar aplicación</strong>. Se creará el acceso directo con el icono oficial y abrirá a pantalla completa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPARTIR EL ENLACE DE INSTALACIÓN */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-sm sm:text-base text-foreground">¿Quieres pasárselo a un amigo?</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Comparte este enlace para que ellos lo instalen en iPhone o Android.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-muted/80 hover:bg-muted text-foreground text-xs sm:text-sm font-bold transition"
            >
              <Share className="w-3.5 h-3.5" aria-hidden="true" />
              Compartir
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-border hover:bg-muted/50 text-foreground text-xs sm:text-sm font-bold transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* VOLVER A ENLACES */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <Link href="/links" className="hover:underline font-semibold">
            Volver a enlaces
          </Link>
        </div>

      </div>

      {/* MODAL DE INSTRUCCIONES CLARAS DE INSTALACIÓN */}
      {showInstructionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowInstructionsModal(false)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {platform === "ios" ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    Cómo instalar misarroces
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isInAppBrowser
                      ? "Abre el enlace en tu navegador habitual"
                      : platform === "ios"
                      ? "En 3 sencillos toques desde Safari"
                      : "Desde el menú de tu navegador"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso para navegadores internos (Instagram, TikTok, WhatsApp, etc.) */}
            {isInAppBrowser ? (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  Navegador interno detectado
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Estás usando el navegador integrado de una red social. Para poder instalar misarroces:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-foreground font-medium pl-1">
                  <li>Toca los tres puntos (⋮ o ⋯) en la esquina superior.</li>
                  <li>Selecciona <strong>"Abrir en Chrome"</strong> o <strong>"Abrir en Safari"</strong>.</li>
                  <li>Pulsa de nuevo <strong>"Instalar misarroces"</strong>.</li>
                </ol>
              </div>
            ) : platform === "ios" ? (
              /* Pasos iOS */
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Abre en Safari</p>
                    <p className="text-muted-foreground">Asegúrate de estar navegando desde Safari en tu iPhone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1">
                      Toca Compartir <Share className="w-3.5 h-3.5 text-primary inline" />
                    </p>
                    <p className="text-muted-foreground">En la barra inferior de Safari, pulsa el botón central de Compartir.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1">
                      Añadir a pantalla de inicio <PlusSquare className="w-3.5 h-3.5 text-primary inline" />
                    </p>
                    <p className="text-muted-foreground">Desliza hacia abajo, pulsa "Añadir a pantalla de inicio" y luego "Añadir".</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Pasos Android */
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Menú del navegador</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      Toca los <strong>3 puntos (⋮)</strong> arriba a la derecha en Chrome <MoreVertical className="w-3.5 h-3.5 text-primary inline" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-foreground">"Instalar aplicación" o "Añadir a inicio"</p>
                    <p className="text-muted-foreground">Selecciona la opción de instalación en el menú desplegable.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Confirma la instalación</p>
                    <p className="text-muted-foreground">Toca "Instalar" en el diálogo del sistema para añadir el icono oficial a tu pantalla de inicio.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón Entendido */}
            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-95 active:scale-[0.99] transition shadow-xs text-center cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
