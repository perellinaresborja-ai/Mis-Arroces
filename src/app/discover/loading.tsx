import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="w-full h-12 rounded-2xl" /> {/* Search bar */}
      
      <div className="space-y-4">
        <Skeleton className="w-40 h-6 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
