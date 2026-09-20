"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Check, AlertCircle, Music, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImportRow {
  file: File;
  id: string;
  status: 'pending' | 'hashing' | 'checking' | 'ready' | 'uploading' | 'success' | 'error' | 'duplicate';
  hash?: string;
  duration_ms?: number;
  title: string;
  artist: string;
  category: string;
  source: string;
  source_license: string;
  source_url: string;
  errorMsg?: string;
}

export function MusicBulkImporter() {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const defaultCategory = 'Cooking'
  const defaultSource = 'Pixabay'
  const defaultLicense = 'Pixabay Free'
  const defaultSourceUrl = 'https://pixabay.com/music/'

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration * 1000))
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        resolve(0)
        URL.revokeObjectURL(url)
      }
    })
  }

  const parseFilename = (filename: string) => {
    let clean = filename.replace(/\.mp3$/i, '').replace(/\.m4a$/i, '').replace(/-/g, ' ')
    clean = clean.replace(/\(\d+\)/g, '').trim()
    
    let artist = 'Desconocido'
    let title = clean

    const parts = filename.split('-')
    if (parts.length > 1) {
      artist = parts[0]
      title = parts.slice(1, -1).join(' ') || title
      title = title.replace(/\.mp3$/i, '').replace(/\.m4a$/i, '').replace(/\(\d+\)/g, '').trim()
    }

    // Title case
    title = title.replace(/\b\w/g, l => l.toUpperCase())
    artist = artist.replace(/\b\w/g, l => l.toUpperCase())

    return { title, artist }
  }

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.m4a'))
    
    const newRows: ImportRow[] = newFiles.map(file => {
      const { title, artist } = parseFilename(file.name)
      return {
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        title,
        artist,
        category: defaultCategory,
        source: defaultSource,
        source_license: defaultLicense,
        source_url: defaultSourceUrl
      }
    })

    setRows(prev => [...prev, ...newRows])
    if (fileInputRef.current) fileInputRef.current.value = ''
    
    // Process metadata for new rows asynchronously
    for (const row of newRows) {
      processRowMetadata(row.id, row.file)
    }
  }

  const processRowMetadata = async (id: string, file: File) => {
    try {
      updateRow(id, { status: 'hashing' })
      const hash = await computeHash(file)
      
      updateRow(id, { status: 'checking', hash })
      
      // Check duplicate
      const { data: existing } = await (supabase as any)
        .from('story_music_tracks')
        .select('id')
        .eq('file_hash', hash)
        .maybeSingle()
        
      if (existing) {
        updateRow(id, { status: 'duplicate', errorMsg: 'El archivo ya existe en la base de datos' })
        return
      }

      // Get duration
      const duration_ms = await getAudioDuration(file)
      
      updateRow(id, { 
        status: 'ready', 
        duration_ms,
        errorMsg: duration_ms === 0 ? 'No se pudo leer la duración' : undefined 
      })

    } catch (err: any) {
      updateRow(id, { status: 'error', errorMsg: err.message })
    }
  }

  const updateRow = (id: string, updates: Partial<ImportRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const handleUploadAll = async () => {
    const readyRows = rows.filter(r => r.status === 'ready')
    if (readyRows.length === 0) return

    setIsProcessing(true)

    for (const row of readyRows) {
      updateRow(row.id, { status: 'uploading' })
      try {
        const safeName = `${Date.now()}-${row.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('music_assets')
          .upload(safeName, row.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('music_assets')
          .getPublicUrl(safeName)

        const audio_url = publicUrlData.publicUrl

        const { error: dbError } = await (supabase as any)
          .from('story_music_tracks')
          .insert({
            title: row.title,
            artist: row.artist,
            audio_url,
            duration_ms: row.duration_ms,
            category: row.category,
            source_license: row.source_license,
            source_url: row.source_url,
            file_hash: row.hash
          })

        if (dbError) throw dbError

        updateRow(row.id, { status: 'success' })
      } catch (err: any) {
        updateRow(row.id, { status: 'error', errorMsg: err.message || 'Error en subida' })
      }
    }

    setIsProcessing(false)
  }

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const stats = {
    total: rows.length,
    ready: rows.filter(r => r.status === 'ready').length,
    success: rows.filter(r => r.status === 'success').length,
    error: rows.filter(r => r.status === 'error' || r.status === 'duplicate').length
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Music className="w-8 h-8 text-orange-500" />
            Importador Masivo de Música
          </h1>
          <p className="text-muted-foreground mt-2">
            Añade múltiples pistas MP3. Se calculará el hash (para evitar duplicados) y la duración automáticamente.
          </p>
        </div>
        
        <div className="flex gap-4">
          <input 
            type="file" 
            multiple 
            accept="audio/mpeg,audio/mp4,audio/aac,.mp3,.m4a"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFiles}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Seleccionar archivos
          </button>
          
          <button
            onClick={handleUploadAll}
            disabled={isProcessing || stats.ready === 0}
            className="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Subir {stats.ready} pistas
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Archivo</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Artista</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Duración</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      {row.status === 'pending' && <span className="text-gray-500">Pendiente</span>}
                      {row.status === 'hashing' && <span className="text-blue-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Hash</span>}
                      {row.status === 'checking' && <span className="text-blue-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Check</span>}
                      {row.status === 'ready' && <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3"/> Listo</span>}
                      {row.status === 'uploading' && <span className="text-orange-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Subiendo</span>}
                      {row.status === 'success' && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4"/> OK</span>}
                      {row.status === 'duplicate' && <span className="text-yellow-600 flex items-center gap-1" title={row.errorMsg}><AlertCircle className="w-4 h-4"/> Duplicado</span>}
                      {row.status === 'error' && <span className="text-red-500 flex items-center gap-1" title={row.errorMsg}><AlertCircle className="w-4 h-4"/> Error</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[150px] truncate" title={row.file.name}>
                      {row.file.name}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        className="w-full bg-transparent border-b border-transparent focus:border-orange-500 focus:outline-none px-1 py-1"
                        value={row.title}
                        onChange={e => updateRow(row.id, { title: e.target.value })}
                        disabled={row.status === 'success' || row.status === 'uploading'}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        className="w-full bg-transparent border-b border-transparent focus:border-orange-500 focus:outline-none px-1 py-1"
                        value={row.artist}
                        onChange={e => updateRow(row.id, { artist: e.target.value })}
                        disabled={row.status === 'success' || row.status === 'uploading'}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select 
                        className="bg-transparent border-b border-transparent focus:border-orange-500 focus:outline-none"
                        value={row.category}
                        onChange={e => updateRow(row.id, { category: e.target.value })}
                        disabled={row.status === 'success' || row.status === 'uploading'}
                      >
                        <option>Cooking</option>
                        <option>Chill</option>
                        <option>Mediterráneo</option>
                        <option>Fiesta</option>
                        <option>Elegante</option>
                        <option>Otros</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {row.duration_ms ? `${Math.floor(row.duration_ms / 1000)}s` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => removeRow(row.id)}
                        disabled={row.status === 'uploading'}
                        className="text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-between text-sm">
            <span className="text-muted-foreground">Total: <strong>{stats.total}</strong></span>
            <span className="text-green-600">Listos: <strong>{stats.ready}</strong></span>
            <span className="text-yellow-600">Duplicados/Error: <strong>{stats.error}</strong></span>
            <span className="text-green-600 font-bold">Subidos: <strong>{stats.success}</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}
