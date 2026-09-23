export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 max-w-2xl mx-auto w-full px-4 pt-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 animate-pulse">
        {/* Cabecera post */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/80" />
          <div className="space-y-1.5 flex-1">
            <div className="w-28 h-4 rounded-md bg-muted/80" />
            <div className="w-16 h-2.5 rounded-md bg-muted/50" />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <div className="w-full h-3.5 rounded-md bg-muted/70" />
          <div className="w-3/4 h-3.5 rounded-md bg-muted/60" />
        </div>

        {/* Imagen */}
        <div className="w-full h-72 sm:h-96 rounded-2xl bg-muted/70" />

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-20 h-8 rounded-xl bg-muted/60" />
          <div className="w-20 h-8 rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  )
}
