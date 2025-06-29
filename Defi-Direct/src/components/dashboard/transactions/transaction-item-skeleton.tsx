import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight } from "lucide-react"

export function TransactionItemSkeleton({
  isLast = false,
  opacity = 1,
}: {
  isLast?: boolean
  opacity?: number
}) {
  return (
    <div className="relative" style={{ opacity }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-2 sm:gap-0">
        {/* Left side - Recipient Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#2F2F3A] flex-shrink-0">
            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500/50" />
          </div>
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-24 bg-white/10 mb-1" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
        </div>

        {/* Right side - Amount and Status */}
        <div className="text-right ml-12 sm:ml-0">
          <Skeleton className="h-5 w-24 bg-white/10 mb-1 ml-auto" />
          <Skeleton className="h-4 w-32 bg-white/10 ml-auto" />
        </div>
      </div>

      {/* Separator */}
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      )}
    </div>
  )
}
