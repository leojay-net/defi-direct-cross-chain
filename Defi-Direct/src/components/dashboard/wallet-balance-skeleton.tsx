import { Skeleton } from "@/components/ui/skeleton"

export default function WalletBalanceSkeleton() {
  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-36 bg-white/10" />
        <Skeleton className="h-10 w-48 bg-white/10" />
        <div className="mt-4">
          <Skeleton className="h-12 w-full rounded-2xl bg-purple-600/30" />
        </div>
      </div>
    </div>
  )
}
