import { StableCoinItemSkeleton } from "./stable-coin-item-skeleton"

export default function StableCoinListSkeleton() {
  return (
    <div className="w-full h-full rounded-3xl p-6">
      <h2 className="text-2xl font-semibold text-white">Your Stable coins</h2>
      <div className="mt-6">
        {[1, 2].map((index) => (
          <StableCoinItemSkeleton key={index} opacity={1 - index * 0.2} isLast={index === 2} />
        ))}
      </div>
    </div>
  )
}
