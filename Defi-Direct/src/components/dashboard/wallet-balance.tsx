"use client"

import { ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { TransferModal } from "./wallet/transfer-modal"
import { useWallet } from "@/context/WalletContext"
import WalletBalanceSkeleton from "./wallet-balance-skeleton"

export default function WalletBalance() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { totalNgnBalance } = useWallet()

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <WalletBalanceSkeleton />
  }

  return (
    <>
      <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-4 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-base sm:text-lg font-medium text-white">Wallet Balance</h2>
          <p className="text-2xl sm:text-4xl font-semibold text-white">
            ₦
            {totalNgnBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white transition-opacity hover:opacity-90"
          >
            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>
      <TransferModal open={isOpen} onOpenChange={setIsOpen} balance={totalNgnBalance} />
    </>
  )
}