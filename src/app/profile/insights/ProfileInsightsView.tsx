"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, BarChart2, Eye, Users, Heart, Star, TrendingUp, ShoppingCart, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ProfileInsightsView({ ownerId }: { ownerId: string }) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<any>(null)
  const [topContent, setTopContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topMetric, setTopMetric] = useState('cooked')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()
      
      const { data: insights } = await supabase.rpc('get_profile_insights', { 
        owner_id_param: ownerId, 
        days_param: days 
      })
      setData(insights)

      const { data: top } = await supabase.rpc('get_top_content', {
        owner_id_param: ownerId,
        days_param: days,
        metric_param: topMetric
      })

      // Hydrate top content with basic recipe info
      if (top && (top as any[]).length > 0) {
        const recipeIds = (top as any[]).map((t: any) => t.entity_id)
        const { data: recipes } = await supabase.from("recipes").select("id, name, primary_media_id(storage_path)").in("id", recipeIds)
        
        const hydrated = (top as any[]).map((t: any) => {
          const rec = recipes?.find(r => r.id === t.entity_id)
          return {
            ...t,
            recipe: rec
          }
        })
        setTopContent(hydrated)
      } else {
        setTopContent([])
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [ownerId, days, topMetric])

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/me" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Mis estadísticas
            </h1>
          </div>
          
          <select 
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-muted text-sm font-medium rounded-full px-3 py-1 outline-none border-none cursor-pointer"
          >
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <div className="py-20 text-center text-muted-foreground">Error cargando datos.</div>
        ) : (
          <>
            {/* Global Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-3xl border border-border flex flex-col justify-center">
                <span className="text-3xl font-black">{data.views || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1 flex items-center gap-1"><Eye className="w-3 h-3"/> Vistas</span>
              </div>
              <div className="bg-card p-5 rounded-3xl border border-border flex flex-col justify-center">
                <span className="text-3xl font-black">{data.reach || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1 flex items-center gap-1"><Users className="w-3 h-3"/> Alcance</span>
              </div>
              <div className="bg-card p-5 rounded-3xl border border-border flex flex-col justify-center">
                <span className="text-3xl font-black">{data.interactions || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1 flex items-center gap-1"><Heart className="w-3 h-3"/> Interacciones</span>
              </div>
              <div className="bg-card p-5 rounded-3xl border border-border flex flex-col justify-center">
                <span className="text-3xl font-black text-green-500">+{data.followers_gained || 0}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Seguidores</span>
              </div>
            </div>

            {/* Impact Block */}
            <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" /> Impacto de mis recetas
              </h2>
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Star className="w-6 h-6 fill-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">La comunidad ha cocinado tus recetas</div>
                  <div className="text-2xl font-black">{data.impact?.cooked_times || 0} veces</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{data.impact?.saved_times || 0}</span>
                  <span className="text-sm text-muted-foreground">Guardadas</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{data.impact?.shopping_list_adds || 0}</span>
                  <span className="text-sm text-muted-foreground">En Listas de Compra</span>
                </div>
              </div>
            </div>

            {/* Top Content */}
            <div className="bg-card rounded-3xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-bold text-lg">Contenido destacado</h2>
                <select 
                  value={topMetric}
                  onChange={e => setTopMetric(e.target.value)}
                  className="bg-background text-sm font-medium rounded-full px-3 py-1 outline-none border border-border cursor-pointer"
                >
                  <option value="cooked">Más cocinada</option>
                  <option value="saved">Más guardada</option>
                  <option value="views">Más vista</option>
                </select>
              </div>
              <div className="p-4 space-y-3">
                {topContent.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No hay suficiente actividad en este periodo.</p>
                ) : (
                  topContent.map((item, idx) => (
                    <Link key={idx} href={item.entity_type === 'recipe' ? `/recipes/${item.entity_id}` : '#'} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-muted transition-colors">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {item.recipe?.primary_media_id?.storage_path ? (
                          <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${item.recipe.primary_media_id.storage_path}`} alt="cover" className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground text-xs">Sin foto</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{item.recipe?.name || 'Receta eliminada'}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {topMetric === 'cooked' && `Cocinada ${item.count} veces`}
                          {topMetric === 'saved' && `Guardada ${item.count} veces`}
                          {topMetric === 'views' && `Vista ${item.count} veces`}
                        </p>
                      </div>
                      <div className="w-8 font-black text-muted-foreground text-right">
                        #{idx + 1}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
