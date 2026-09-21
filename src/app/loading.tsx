import { Skeleton } from "@/components/ui/skeleton"
import { Flame } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      {/* Main Feed Content Skeleton */}
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4 pt-4 px-2 sm:px-0">
        
        {/* Stories Bar Skeleton */}
        <div className="w-full bg-card border border-border p-4 rounded-3xl flex gap-4 overflow-hidden shadow-sm">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-12 h-3 mt-1" />
            </div>
          ))}
        </div>

        {/* Feed Cards Skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card md:rounded-3xl border-y md:border border-border p-4 sm:p-5 space-y-4 shadow-sm w-full">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
              </header>
              <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-8 rounded-full" />
                <Skeleton className="w-16 h-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
