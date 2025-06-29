"use client"

import { Suspense } from "react"
import WalletBalance from "@/components/dashboard/wallet-balance"
import TransactionList from "./transactions/transaction-list"
import StableCoinList from "./stablecoins/stable-coin-list"
import { CrossChainWidget } from "./CrossChainWidget"
import WalletBalanceSkeleton from "@/components/dashboard/wallet-balance-skeleton"
import TransactionListSkeleton from "./transactions/transaction-list-skeleton"
import StableCoinListSkeleton from "@/components/dashboard/stablecoins/stable-coin-list-skeleton"

export default function Dashboard() {
  return (
    <div className="grid gap-4 sm:gap-6 p-4 sm:p-6 grid-cols-1 lg:grid-cols-3 min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:overflow-hidden">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:overflow-hidden flex flex-col">
        <Suspense fallback={<WalletBalanceSkeleton />}>
          <div className="flex-shrink-0">
            <WalletBalance />
          </div>
        </Suspense>
        <Suspense fallback={<TransactionListSkeleton />}>
          <div className="flex-1 lg:overflow-hidden">
            <TransactionList />
          </div>
        </Suspense>
      </div>
      <div className="space-y-4 sm:space-y-6 lg:overflow-y-auto">
        <CrossChainWidget />
        <Suspense fallback={<StableCoinListSkeleton />}>
          <StableCoinList />
        </Suspense>
      </div>
    </div>
  )
}