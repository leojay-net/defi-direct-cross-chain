import { Skeleton } from "@/components/ui/skeleton"

export function StableCoinItemSkeleton({
  opacity = 1,
  isLast = false,
}: {
  opacity?: number
  isLast?: boolean
}) {
  return (
    <div className="relative" style={{ opacity }}>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
          </div>
          <div>
            <Skeleton className="h-5 w-24 bg-white/10 mb-1" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-5 w-16 bg-white/10 mb-1" />
          <Skeleton className="h-4 w-20 bg-white/10" />
        </div>
      </div>
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      )}
    </div>
  )
}
