export default function CookbookLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pt-4 md:pt-0 gap-4">
        <div className="h-9 w-44 rounded-xl bg-muted/80 animate-pulse" />
        <div className="h-10 w-36 rounded-2xl bg-muted/60 animate-pulse" />
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-8 overflow-x-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 rounded-2xl bg-muted/70 animate-pulse shrink-0" />
        ))}
      </div>

      {/* Grid de recetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-3xl p-4 space-y-3.5 shadow-sm animate-pulse"
          >
            <div className="w-full h-48 rounded-2xl bg-muted/70" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-muted/80" />
              <div className="h-3 w-1/2 rounded-md bg-muted/60" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-6 w-16 rounded-lg bg-muted/60" />
              <div className="h-6 w-16 rounded-lg bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
