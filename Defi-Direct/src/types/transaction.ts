// src/types/transaction.ts
export interface Transaction {
  id: string;
  recipient: string;
  bank: string;
  amount: number;
  amountSpent?: number;
  transactionFee?: number; // Added for transaction fee
  tokenName?: string; // Added for token name (e.g., USDC, USDT)
  status: "successful" | "pending" | "failed";
  timestamp: string;
  rawTimestamp: number; // Added for filtering
  txHash?: `0x${string}`;
}
export type TransactionResult = {
  user: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  amountSpent: bigint;
  transactionFee: bigint; // Match retrieveTransactions
  transactionTimestamp: bigint;
  fiatBankAccountNumber: bigint;
  fiatBank: string;
  recipientName: string;
  fiatAmount: number;
  isCompleted: boolean;
  isRefunded: boolean;
  txId: string;
};