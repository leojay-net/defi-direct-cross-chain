// src/components/transaction-item.tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import { Transaction } from "@/types/transaction";

const statusColors = {
  successful: "text-green-500",
  pending: "text-orange-500",
  failed: "text-red-500",
};

interface TransactionItemProps {
  transaction: Transaction;
  isLast: boolean;
  opacity: number;
  onClick: () => void;
}

export function TransactionItem({
  transaction,
  isLast,
  opacity,
  onClick,
}: TransactionItemProps) {
  const { recipient, bank, amount, status, timestamp } = transaction;

  return (
    <div className="relative" style={{ opacity }}>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-2 sm:gap-0 cursor-pointer hover:bg-[#2F2F3A]/50 rounded-lg px-2 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#2F2F3A] flex-shrink-0">
            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white text-sm sm:text-base truncate">
              {recipient}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{bank}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="text-right">
            <p className={`font-medium ${statusColors[status]} text-sm sm:text-base`}>
              ₦{amount.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              <span className="capitalize">{status}</span> | {timestamp}
            </p>
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      )}
    </div>
  );
}