export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-200">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-7 w-36 rounded-lg bg-muted/80 animate-pulse" />
        </div>

        {/* Bloques de ajustes skeleton */}
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className="space-y-3">
            <div className="h-3 w-20 rounded-md bg-muted/60 ml-4 animate-pulse" />
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm p-4 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-muted/80" />
                  <div className="h-4 w-32 rounded-md bg-muted/70" />
                </div>
                <div className="w-4 h-4 rounded-md bg-muted/40" />
              </div>
              <div className="h-px bg-border/60" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-muted/80" />
                  <div className="h-4 w-40 rounded-md bg-muted/70" />
                </div>
                <div className="w-4 h-4 rounded-md bg-muted/40" />
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
