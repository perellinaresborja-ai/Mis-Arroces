import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="w-32 h-8 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-2xl bg-card">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-1/3 h-5" />
              <Skeleton className="w-2/3 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
