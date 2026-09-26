"use client"

import { useState } from "react"
import { GrowthPoint } from "@/lib/admin/dashboard"
import { TrendingUp, Calendar } from "lucide-react"

interface GrowthChartProps {
  growth: {
    d7: GrowthPoint[]
    d30: GrowthPoint[]
    d90: GrowthPoint[]
  }
}

export function AdminUserGrowthChart({ growth }: GrowthChartProps) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d")
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const points = (range === "7d" ? growth?.d7 : range === "30d" ? growth?.d30 : growth?.d90) || []
  const maxCumulative = points.length > 0 ? Math.max(...points.map((p) => p.cumulative), 1) : 1
  const maxDaily = points.length > 0 ? Math.max(...points.map((p) => p.count), 1) : 1
  const safeLength = Math.max(points.length, 1)

  // Dimensiones SVG
  const width = 600
  const height = 180
  const paddingX = 20
  const paddingY = 24
  const chartW = width - paddingX * 2
  const chartH = height - paddingY * 2

  // Calcular coordenadas para la curva acumulada
  const svgPoints = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * chartW
    const y = paddingY + chartH - (p.cumulative / maxCumulative) * chartH
    return { x, y, point: p }
  })

  // Generar path continuo
  const pathD = svgPoints.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x},${curr.y}`
    // Suavizado cúbico sencillo
    const prev = svgPoints[idx - 1]
    const cx = (prev.x + curr.x) / 2
    return `${acc} C ${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`
  }, "")

  // Path cerrado para el área de relleno con gradiente
  const areaD = pathD ? `${pathD} L ${paddingX + chartW},${height - paddingY} L ${paddingX},${height - paddingY} Z` : ""

  // Total de altas en el periodo seleccionado
  const periodNewUsers = points.reduce((acc, p) => acc + p.count, 0)
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1]

  return (
    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-foreground">Crecimiento de Usuarios</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Evolución de registros en <strong>misarroces</strong> ({periodNewUsers} altas en este periodo).
          </p>
        </div>

        {/* Selector de rango de días */}
        <div className="inline-flex items-center bg-muted/60 p-1 rounded-2xl border border-border self-start sm:self-auto">
          {(
            [
              { key: "7d", label: "7 días" },
              { key: "30d", label: "30 días" },
              { key: "90d", label: "90 días" },
            ] as const
          ).map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => {
                setRange(btn.key)
                setHoveredIdx(null)
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                range === btn.key
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjeta de tooltip interactivo / resumen */}
      <div className="flex items-center justify-between text-xs bg-muted/30 px-3.5 py-2 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {activePoint ? activePoint.label : "Selecciona un día"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-muted-foreground mr-1">Nuevos:</span>
            <strong className="text-blue-500">+{activePoint?.count || 0}</strong>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Total acumulado:</span>
            <strong className="text-foreground">{activePoint?.cumulative || 0}</strong>
          </div>
        </div>
      </div>

      {/* Gráfico SVG nativo */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #ea580c)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary, #ea580c)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={width - paddingX}
            y2={paddingY + chartH / 2}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            strokeOpacity="0.12"
          />

          {/* Área con gradiente */}
          <path d={areaD} fill="url(#growthGradient)" />

          {/* Curva de línea principal */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-primary, #ea580c)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Barras de altas diarias tenues en la base */}
          {points.map((p, idx) => {
            const barW = Math.max(chartW / safeLength - 2, 2)
            const barH = (p.count / maxDaily) * (chartH * 0.45)
            const bx = paddingX + (idx / Math.max(points.length - 1, 1)) * chartW - barW / 2
            const by = height - paddingY - barH

            return (
              <rect
                key={`bar-${p.date}`}
                x={bx}
                y={by}
                width={barW}
                height={barH}
                rx="1"
                fill="currentColor"
                className="text-blue-500/30"
              />
            )
          })}

          {/* Zonas interactivas táctiles / ratón */}
          {svgPoints.map((pt, idx) => (
            <g key={pt.point.date}>
              {/* Círculo resaltado cuando está activo */}
              {hoveredIdx === idx && (
                <>
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="var(--color-primary, #ea580c)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="var(--color-primary, #ea580c)"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Área invisible grande para facilitar el toque */}
              <rect
                x={pt.x - chartW / safeLength / 2}
                y={paddingY}
                width={chartW / safeLength}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onTouchStart={() => setHoveredIdx(idx)}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Leyenda inferior */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>{points[0]?.label}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-primary rounded-full" />
            <span>Usuarios acumulados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500/40 rounded-sm" />
            <span>Altas diarias</span>
          </div>
        </div>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  )
}
