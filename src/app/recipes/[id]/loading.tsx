export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 max-w-4xl mx-auto w-full px-4 pt-4 animate-in fade-in duration-200">
      <div className="space-y-6">
        
        {/* Foto de portada de la receta */}
        <div className="w-full h-72 sm:h-96 rounded-3xl bg-muted/70 border border-border shadow-sm animate-pulse" />

        {/* Información principal */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
          <div className="h-8 w-2/3 rounded-xl bg-muted/80" />
          
          {/* Autor */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted/80" />
            <div className="space-y-1">
              <div className="h-3.5 w-28 rounded-md bg-muted/80" />
              <div className="h-2.5 w-16 rounded-md bg-muted/50" />
            </div>
          </div>

          {/* Chips de tiempos y raciones */}
          <div className="flex gap-2 pt-2 overflow-x-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>

        {/* Sección ingredientes */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-3 animate-pulse">
          <div className="h-5 w-32 rounded-lg bg-muted/80 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <div className="h-3.5 w-40 rounded-md bg-muted/70" />
              <div className="h-3.5 w-16 rounded-md bg-muted/50" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
