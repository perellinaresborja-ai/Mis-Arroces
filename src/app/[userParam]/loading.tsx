import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center mb-8 space-y-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-32 h-4" />
        <div className="flex gap-4 mt-2">
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="w-full border-b border-border mb-6 flex gap-4">
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-20 h-10" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  )
}
