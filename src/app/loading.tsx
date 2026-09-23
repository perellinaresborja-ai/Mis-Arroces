export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        
        {/* Barra de historias skeleton */}
        <div className="bg-card border border-border rounded-3xl p-3.5 shadow-xs overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-muted/70 border-2 border-border" />
                <div className="w-12 h-2.5 rounded-full bg-muted/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Publicaciones skeleton */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5 animate-pulse"
          >
            {/* Cabecera post */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/80 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-28 h-3.5 rounded-md bg-muted/80" />
                <div className="w-16 h-2.5 rounded-md bg-muted/60" />
              </div>
            </div>

            {/* Imagen post */}
            <div className="w-full h-64 sm:h-80 rounded-2xl bg-muted/60" />

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-16 h-7 rounded-xl bg-muted/60" />
              <div className="w-16 h-7 rounded-xl bg-muted/60" />
              <div className="w-16 h-7 rounded-xl bg-muted/60 ml-auto" />
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
