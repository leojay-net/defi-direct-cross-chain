import Link from "next/link"

interface TransactionHeaderProps {
  showViewAll?: boolean
}

export function TransactionHeader({ showViewAll = true }: TransactionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg sm:text-2xl font-semibold text-white">Recent transactions</h2>
      {showViewAll && (
        <Link href="/transaction" className="text-sm sm:text-base text-purple-500 hover:text-purple-400">
          view all
        </Link>
      )}
    </div>
  )
}
