"use client"

import { useState } from "react"
import Link from "next/link"
import { TopRecipeItem } from "@/lib/admin/dashboard"
import { Sparkles, Eye, Flame, Bookmark, ArrowUpRight, ChefHat } from "lucide-react"

interface TopContentProps {
  topContent: {
    mostViewed: TopRecipeItem[]
    mostCooked: TopRecipeItem[]
    mostSaved: TopRecipeItem[]
  }
}

export function AdminTopContent({ topContent }: TopContentProps) {
  const [tab, setTab] = useState<"viewed" | "cooked" | "saved">("viewed")

  const items =
    tab === "viewed"
      ? topContent.mostViewed
      : tab === "cooked"
      ? topContent.mostCooked
      : topContent.mostSaved

  const metricLabel = tab === "viewed" ? "vistas" : tab === "cooked" ? "cocinados" : "guardados"
  const MetricIcon = tab === "viewed" ? Eye : tab === "cooked" ? Flame : Bookmark
  const iconColor =
    tab === "viewed" ? "text-blue-500" : tab === "cooked" ? "text-orange-500" : "text-amber-500"

  return (
    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-foreground">Lo que está funcionando</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Contenido con mayor impacto orgánico según <strong>Analytics V1</strong>.
          </p>
        </div>

        {/* Pestañas de categoría */}
        <div className="inline-flex items-center bg-muted/60 p-1 rounded-2xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab("viewed")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "viewed"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Más vistas</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("cooked")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "cooked"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Más cocinadas</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "saved"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Más guardadas</span>
          </button>
        </div>
      </div>

      {/* Lista clasificada Top 5 */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/80">
          <ChefHat className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p>Aún no hay suficientes registros para esta clasificación.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((recipe, index) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : index === 1
                      ? "bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-500/30"
                      : index === 2
                      ? "bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {recipe.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    por <span className="font-medium text-foreground/80">@{recipe.authorUsername}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs font-bold text-foreground border border-border/60">
                  <MetricIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                  <span>{recipe.count}</span>
                  <span className="text-[11px] text-muted-foreground font-normal hidden sm:inline">
                    {metricLabel}
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
