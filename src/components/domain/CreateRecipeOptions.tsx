"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createAiRecipeDraft } from "@/app/actions/ai-recipe"
import { importRecipeFromUrlAction } from "@/app/actions/import-recipe"
import { Loader2, Wand2, PenLine, Globe, Link as LinkIcon, Mic, MicOff } from "lucide-react"

export default function CreateRecipeOptions({ createManualAction }: { createManualAction: () => Promise<void> }) {
  const router = useRouter()
  const [mode, setModeState] = useState<'CHOICE' | 'AI' | 'IMPORT' | 'VOICE'>('CHOICE')
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#ai') setModeState('AI');
      else if (hash === '#import') setModeState('IMPORT');
      else if (hash === '#voice') setModeState('VOICE');
      else setModeState('CHOICE');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setMode = (newMode: 'CHOICE' | 'AI' | 'IMPORT' | 'VOICE') => {
    if (newMode === 'CHOICE') {
      router.back();
    } else {
      window.location.hash = newMode.toLowerCase();
    }
  }

  const [aiText, setAiText] = useState("")
  const [importUrl, setImportUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isListening, setIsListening] = useState(false)
  const isListeningRef = useRef(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      isListeningRef.current = false
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListen = () => {
    if (isListeningRef.current) {
      isListeningRef.current = false
      recognitionRef.current?.stop()
      setIsListening(false)
      setInterimText("")
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setError(null)
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError("Tu navegador no soporta reconocimiento de voz nativo. Prueba Chrome o Safari.")
        isListeningRef.current = false
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'es-ES'
      // Use continuous to avoid stopping constantly, and we'll restart on end if needed
      recognition.continuous = true
      recognition.interimResults = true

      let hasError = false

      recognition.onstart = () => {
        setIsListening(true)
        isListeningRef.current = true
        setError(null)
      }

      recognition.onresult = (event: any) => {
        let currentInterim = ''
        let finalTranscripts = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscripts += transcript + ' '
          } else {
            currentInterim += transcript
          }
        }
        
        if (finalTranscripts) {
          setAiText(prev => (prev ? prev.trim() + ' ' : '') + finalTranscripts.trim())
        }
        setInterimText(currentInterim)
      }

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          hasError = true
          isListeningRef.current = false
          setIsListening(false)
          setInterimText("")
          
          if (event.error === 'network') {
            setError("Error de red: El navegador bloqueó el servicio de voz nativo. Si usas Brave o Edge, prueba con Google Chrome.")
          } else if (event.error === 'not-allowed') {
            setError("Debes conceder permisos de micrófono en el navegador.")
          } else {
            setError("Error de reconocimiento: " + event.error)
          }
        }
      }

      recognition.onend = () => {
        setInterimText("")
        if (isListeningRef.current && !hasError) {
          try {
            recognition.start()
          } catch (e) {
            isListeningRef.current = false
            setIsListening(false)
          }
        } else {
          isListeningRef.current = false
          setIsListening(false)
        }
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (err: any) {
      setError("No se pudo iniciar el micrófono. Revisa los permisos.")
      isListeningRef.current = false
      setIsListening(false)
    }
  }

  const handleManual = async () => {
    setIsLoading(true)
    await createManualAction()
  }

  const handleAi = async () => {
    if (!aiText.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await createAiRecipeDraft(aiText)
      router.push(`/recipes/${res.recipeId}/edit`)
    } catch (err: any) {
      setError(err.message || "Error procesando la receta con IA.")
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importUrl.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await importRecipeFromUrlAction(importUrl, true)
      if (res.success && res.recipeId) {
        router.push(`/recipes/${res.recipeId}/edit`)
      } else {
        throw new Error(res.error || "Error al importar la receta.")
      }
    } catch (err: any) {
      setError(err.message || "Error al importar la receta.")
      setIsLoading(false)
    }
  }

  if (mode === 'AI') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-orange-500" />
            Crear con IA
          </h1>
          <p className="text-muted-foreground">
            Pega o escribe tu receta aquí. Extraeremos automáticamente los ingredientes, caldo, arroz, cantidades y pasos para que no tengas que introducirlos a mano.
          </p>
        </div>
        
        <div className="space-y-4">
          <textarea
            className="w-full h-64 p-4 rounded-xl border border-border bg-card text-foreground resize-none focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Ejemplo: Paella valenciana para 4 personas. Necesitas 400g de arroz bomba, 1.2 litros de agua, 500g de pollo, 250g de conejo, garrofón, judía plana..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            disabled={isLoading}
          />
          
          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMode('CHOICE')}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAi}
              disabled={isLoading || aiText.trim().length < 15}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Procesando..." : "Generar borrador"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'VOICE') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-6 h-6 text-orange-500" />
            Por voz
          </h1>
          <p className="text-muted-foreground">
            Cuentanos tu receta paso a paso. Transcribiremos tu voz y rellenaremos el borrador automáticamente.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl shadow-sm gap-4">
            <button
              onClick={toggleListen}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-green-500/20 text-green-500 animate-pulse border-2 border-green-500/50'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-xl hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className={`font-semibold ${isListening ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`}>
              {isListening ? "Escuchando..." : "Pulsa para hablar"}
            </p>
          </div>

          <div className="relative">
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-border bg-card text-foreground resize-none focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Puedes editar la transcripción aquí..."
              value={aiText + (interimText ? (aiText ? ' ' : '') + interimText : '')}
              onChange={(e) => setAiText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMode('CHOICE')}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAi}
              disabled={isLoading || aiText.trim().length < 15}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Procesando..." : "Generar borrador"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'IMPORT') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-orange-500" />
            Importar receta
          </h1>
          <p className="text-muted-foreground">
            Pega el enlace de una receta de una web. La importaremos y crearemos un borrador que podrás revisar y completar.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="url"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="https://www.instagram.com/p/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMode('CHOICE')}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading || importUrl.trim().length < 5}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Importando..." : "Importar y crear borrador"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Crear nueva receta</h1>
        <p className="text-muted-foreground">¿Cómo prefieres empezar?</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleManual}
          disabled={isLoading}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border border-border bg-card hover:border-orange-500 hover:bg-orange-500/5 transition-all text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            {isLoading ? <Loader2 className="w-8 h-8 text-orange-500 animate-spin" /> : <PenLine className="w-8 h-8 text-orange-500" />}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Manualmente</h3>
            <p className="text-sm text-muted-foreground mt-1">Crea tu receta paso a paso.</p>
          </div>
        </button>

        <button
          onClick={() => setMode('AI')}
          disabled={isLoading}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border border-border bg-card hover:border-orange-500 hover:bg-orange-500/5 transition-all text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Wand2 className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Con IA</h3>
            <p className="text-sm text-muted-foreground mt-1">Escribe o pega tu receta y nosotros la organizamos por ti.</p>
          </div>
        </button>

        <button
          onClick={() => setMode('VOICE')}
          disabled={isLoading}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border border-border bg-card hover:border-orange-500 hover:bg-orange-500/5 transition-all text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Mic className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Por voz</h3>
            <p className="text-sm text-muted-foreground mt-1">Cuéntanos tu receta y nosotros la organizamos por ti.</p>
          </div>
        </button>

        <button
          onClick={() => setMode('IMPORT')}
          disabled={isLoading}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border border-border bg-card hover:border-orange-500 hover:bg-orange-500/5 transition-all text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Globe className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Importar receta</h3>
            <p className="text-sm text-muted-foreground mt-1">Pega el enlace de una receta de una web. La importaremos y crearemos un borrador que podrás revisar y completar.</p>
          </div>
        </button>
      </div>
    </div>
  )
}
