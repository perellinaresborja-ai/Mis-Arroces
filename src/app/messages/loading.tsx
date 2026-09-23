export default function MessagesLoading() {
  return (
    <div className="flex-1 flex flex-col h-full p-4 max-w-4xl mx-auto w-full animate-in fade-in duration-200">
      {/* Barra de búsqueda skeleton */}
      <div className="h-11 w-full rounded-2xl bg-muted/70 mb-4 animate-pulse" />

      {/* Lista de conversaciones */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border shadow-xs animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-muted/80 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-md bg-muted/80" />
                <div className="h-3 w-12 rounded-md bg-muted/50" />
              </div>
              <div className="h-3 w-48 rounded-md bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
