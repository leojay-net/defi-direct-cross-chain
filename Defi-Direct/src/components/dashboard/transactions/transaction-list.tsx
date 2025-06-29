"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { Transaction } from "@/types/transaction";
import { retrieveTransactions } from "@/services/retrieveTransactions";
import { TransactionHeader } from "./transaction-header";
import { TransactionItem } from "./transaction-item";
import { TransactionDetailsModal } from "./transaction-details-modal";
import TransactionListSkeleton from "./transaction-list-skeleton";
import { usePathname } from "next/navigation";
import { TOKEN_ADDRESSES } from "@/config";
import { TransactionResult } from "@/types/transaction";

// Define the valid token names
type TokenName = keyof typeof TOKEN_ADDRESSES;

const formatTimestamp = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) * 1000);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return {
    formatted: date.toLocaleString("en-US", options).replace(",", "."),
    raw: Number(timestamp) * 1000, // Store raw timestamp in milliseconds
  };
};

const getStatus = (
  isCompleted: boolean,
  isRefunded: boolean
): "successful" | "pending" | "failed" => {
  if (!isCompleted && !isRefunded) return "pending";
  if (isCompleted && isRefunded) return "failed";
  return "successful";
};

const formatTransaction = (
  transaction: TransactionResult,
  index: number,
  pendingTransactions: Transaction[]
): Transaction => {
  const { formatted, raw } = formatTimestamp(transaction.transactionTimestamp);
  // Map token address to token name
  const tokenName = (Object.entries(TOKEN_ADDRESSES) as [TokenName, `0x${string}`][]).find(
    ([, address]) => address === transaction.token
  )?.[0] || "Unknown";

  // Check for matching pending transaction
  const pendingTx = pendingTransactions.find(
    (pt) => pt.txHash && pt.txHash === transaction.txId
  );

  // Use pending transaction's transactionFee if available
  let transactionFee: number | undefined;
  if (pendingTx && pendingTx.transactionFee !== undefined) {
    transactionFee = pendingTx.transactionFee; // Use approvalFee from TransferModal
  } else {
    try {
      // Convert backend's bigint transactionFee to number
      const feeValue = Number(transaction.transactionFee) / 1e18;
      if (isNaN(feeValue) || !isFinite(feeValue)) {
        console.error(`Invalid transactionFee for txId ${transaction.txId}: ${transaction.transactionFee}`);
        transactionFee = undefined; // Don't display invalid fees
      } else {
        transactionFee = Math.abs(feeValue) / 1e6; // Ensure positive, matching TransferSummary
      }
    } catch (error) {
      console.error(`Error processing transactionFee for txId ${transaction.txId}:`, error);
      transactionFee = undefined; // Don't display invalid fees
    }
  }

  return {
    id: transaction.txId,
    recipient: transaction.recipientName,
    bank: transaction.fiatBank,
    amount: transaction.fiatAmount,
    amountSpent: Number(transaction.amountSpent) / 1e18,
    transactionFee, // Use pendingTx fee or scaled backend fee
    tokenName,
    status: getStatus(transaction.isCompleted, transaction.isRefunded),
    timestamp: formatted,
    rawTimestamp: raw,
    txHash: transaction.txId as `0x${string}`,
  };
};

export default function TransactionList() {
  const { connectedAddress, transactionTrigger } = useWallet();
  const [confirmedTransactions, setConfirmedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const MAX_DASHBOARD_TRANSACTIONS = 3;
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!connectedAddress) {
      setError("No connected wallet address found.");
      setLoading(false);
      return;
    }

    try {
      const transactionResult = await retrieveTransactions(
        connectedAddress as `0x${string}`
      );

      console.log("Transaction result:", transactionResult);

      if (Array.isArray(transactionResult) && transactionResult.length > 0) {
        const formattedTransactions = transactionResult.map((tx, index) =>
          formatTransaction(tx, index, []) // Pass empty array for pending transactions
        );
        setConfirmedTransactions(formattedTransactions);
        setError(null);
      } else {
        setConfirmedTransactions([]);
        setError(null);
      }
    } catch (err: unknown) {
      setError("Failed to fetch transactions. Please try again.");
      console.error("Error fetching transactions:", err);
      setConfirmedTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [connectedAddress]); // Remove pendingTransactions from dependencies

  useEffect(() => {
    // Fetch transactions immediately when transactionTrigger changes
    fetchTransactions();
  }, [fetchTransactions, transactionTrigger]);

  const allTransactions = confirmedTransactions.sort(
    (a, b) => b.rawTimestamp - a.rawTimestamp
  );

  const displayedTransactions = isDashboard
    ? allTransactions.slice(0, MAX_DASHBOARD_TRANSACTIONS)
    : allTransactions;

  console.log("Displayed transactions:", displayedTransactions);

  if (loading) {
    return <TransactionListSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-4 sm:p-6">
        <TransactionHeader
          showViewAll={
            isDashboard && allTransactions.length > MAX_DASHBOARD_TRANSACTIONS
          }
        />
        <div className="text-center text-gray-400 py-6 sm:py-8">
          <p className="text-sm sm:text-base">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchTransactions();
            }}
            className="mt-3 sm:mt-4 text-sm sm:text-base text-purple-500 hover:text-purple-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (allTransactions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-4 sm:p-6">
        <TransactionHeader showViewAll={false} />
        <div className="text-center text-gray-400 py-6 sm:py-8">
          <p className="text-sm sm:text-base">No transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C1C27] to-[#1C1C2700] p-4 sm:p-6">
      <TransactionHeader
        showViewAll={
          isDashboard && allTransactions.length > MAX_DASHBOARD_TRANSACTIONS
        }
      />
      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-4">
        {displayedTransactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.txHash || transaction.id}
            transaction={{
              ...transaction,
              amount: transaction.amount || 0,
              amountSpent: transaction.amountSpent || 0,
              transactionFee: transaction.transactionFee,
              tokenName: transaction.tokenName,
            }}
            isLast={index === displayedTransactions.length - 1}
            opacity={1 - index * 0.2}
            onClick={() => {
              setSelectedTransaction(transaction);
              setModalOpen(true);
            }}
          />
        ))}
      </div>
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}

