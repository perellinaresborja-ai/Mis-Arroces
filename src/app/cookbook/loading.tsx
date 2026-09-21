import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="w-48 h-10 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
            <Skeleton className="w-3/4 h-4 ml-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
