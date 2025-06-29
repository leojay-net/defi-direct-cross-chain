import { TransactionHeader } from "./transaction-header"
import { TransactionItemSkeleton } from "./transaction-item-skeleton"

export default function TransactionListSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-4 sm:p-6">
      <TransactionHeader />
      <div className="mt-4 sm:mt-6 space-y-4">
        {[1, 2, 3].map((index) => (
          <TransactionItemSkeleton key={index} isLast={index === 3} opacity={1 - index * 0.2} />
        ))}
      </div>
    </div>
  )
}
