export default function MessagesLoading() {
  return (
    <div className="fixed inset-0 h-[100dvh] md:h-auto md:top-[64px] flex w-full max-w-2xl mx-auto md:border-x border-border/50 overflow-hidden bg-background z-40 overscroll-none select-none">
      <div className="flex flex-col w-full shrink-0 h-full">
        {/* Top Header */}
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 z-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <div className="w-28 h-7 bg-muted rounded-full animate-pulse" />
        </div>

        {/* Skeleton list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 md:pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center p-3 rounded-2xl border border-border bg-card animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
              <div className="ml-4 flex-1 space-y-2">
                <div className="w-28 h-4 bg-muted rounded-full" />
                <div className="w-48 h-3 bg-muted/60 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
