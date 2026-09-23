export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 max-w-4xl mx-auto w-full animate-in fade-in duration-200">
      {/* Portada / Header */}
      <div className="px-4 pt-6 space-y-6">
        
        {/* Cabecera con avatar e información */}
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/80 border-2 border-border shrink-0 animate-pulse" />
          
          <div className="flex-1 space-y-3 pt-1">
            <div className="flex items-center justify-between gap-2">
              <div className="h-6 w-36 rounded-lg bg-muted/80 animate-pulse" />
              <div className="h-9 w-24 rounded-2xl bg-muted/60 animate-pulse" />
            </div>
            
            {/* Estadísticas */}
            <div className="flex items-center gap-6 pt-1">
              <div className="h-4 w-16 rounded-md bg-muted/70 animate-pulse" />
              <div className="h-4 w-16 rounded-md bg-muted/70 animate-pulse" />
              <div className="h-4 w-16 rounded-md bg-muted/70 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2 max-w-md">
          <div className="h-3.5 w-full rounded-md bg-muted/70 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded-md bg-muted/60 animate-pulse" />
        </div>

        {/* Historias destacadas skeleton */}
        <div className="flex items-center gap-4 overflow-x-hidden pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted/70 border border-border" />
              <div className="w-12 h-2 rounded-full bg-muted/50" />
            </div>
          ))}
        </div>

        {/* Pestañas de perfil */}
        <div className="flex border-t border-border pt-4 gap-4 justify-around">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>

      </div>
    </div>
  )
}
