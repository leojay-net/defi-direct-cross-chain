// src/services/retrieveTransactions.ts

// Define proper interfaces for transaction types
interface BackendTransaction {
  userAddress?: string;
  txId?: string;
  isCompleted?: boolean;
  token?: string;
  amount?: string;
  amountSpent?: string;
  transactionFee?: string;
  transactionTimestamp?: string;
  fiatBankAccountNumber?: string;
  fiatBank?: string;
  recipientName?: string;
  fiatAmount?: string;
  isRefunded?: boolean;
}

// Update to match TransactionResult in src/types/transaction.ts
interface FormattedTransaction {
  user: `0x${string}`; // Changed from string to `0x${string}`
  token: `0x${string}`; // Changed from string to `0x${string}`
  amount: bigint;
  amountSpent: bigint;
  transactionFee: bigint;
  transactionTimestamp: bigint;
  fiatBankAccountNumber: bigint;
  fiatBank: string;
  recipientName: string;
  fiatAmount: number;
  isCompleted: boolean;
  isRefunded: boolean;
  txId: string;
}

export const retrieveTransactions = async (userAddress: `0x${string}`): Promise<FormattedTransaction[]> => {
  console.log("=== RETRIEVE TRANSACTIONS SERVICE START ===");
  console.log("1. retrieveTransactions called with address:", userAddress);

  if (!userAddress) {
    console.log("❌ User address is undefined");
    console.error("User address is undefined. Provide a valid address.");
    return [];
  }

  try {
    console.log("2. Fetching transactions from backend...");
    // Fetch transactions from the backend
    let backendTransactions: BackendTransaction[] = [];
    try {
      console.log("3. Making GET request to backend...");
      const response = await fetch(
        "https://backend-cf8a.onrender.com/transaction/transactions/",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("4. Backend response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Backend GET failed:", errorText);
        throw new Error(
          `Backend GET failed: ${response.status} - ${errorText}`
        );
      }

      backendTransactions = await response.json();
      console.log("5. Backend transactions received:", backendTransactions);
      console.log("6. Number of transactions:", backendTransactions.length);
    } catch (error) {
      console.log("❌ Backend GET error:", error);
      console.error("Backend GET error:", error);
      backendTransactions = [];
    }

    // Log raw transactions
    console.log(
      `7. Raw transactions for user ${userAddress}:`,
      backendTransactions
    );

    console.log("8. Filtering and deduplicating transactions...");
    // Filter and deduplicate backend transactions
    const dedupedBackendTransactions = backendTransactions
      .filter((tx: BackendTransaction) => {
        const isValid =
          tx.userAddress &&
          tx.userAddress.toLowerCase() === userAddress.toLowerCase();
        if (!isValid) {
          console.log("9. Filtered out transaction:", tx);
        }
        return isValid;
      })
      .reduce((acc: BackendTransaction[], tx: BackendTransaction) => {
        const existing = acc.find((t) => t.txId === tx.txId);
        if (!existing && tx.txId) {
          acc.push(tx);
        } else if (existing && tx.isCompleted) {
          acc = acc.filter((t) => t.txId !== tx.txId);
          acc.push(tx);
        }
        return acc;
      }, []);

    console.log(
      `10. Deduped backend transactions for ${userAddress}:`,
      dedupedBackendTransactions
    );
    console.log("11. Number of deduped transactions:", dedupedBackendTransactions.length);

    console.log("12. Mapping to consistent format...");
    // Map to consistent format
    const formattedTransactions = dedupedBackendTransactions.map(
      (tx: BackendTransaction, index: number): FormattedTransaction => {
        // Validate transactionTimestamp
        const timestamp = Number(tx.transactionTimestamp) || Math.floor(Date.now() / 1000);
        const formattedTx: FormattedTransaction = {
          user: userAddress, // Already correct type
          token: (tx.token || "0x0") as `0x${string}`, // Cast to correct type
          amount: BigInt(tx.amount || "0"),
          amountSpent: BigInt(
            Math.round(parseFloat(tx.amountSpent || "0") * 1e18)
          ),
          transactionFee: BigInt(
            Math.round(parseFloat(tx.transactionFee || "0") * 1e18)
          ),
          transactionTimestamp: BigInt(timestamp),
          fiatBankAccountNumber: BigInt(tx.fiatBankAccountNumber || "0"),
          fiatBank: tx.fiatBank || "Unknown",
          recipientName: tx.recipientName || "Unknown",
          fiatAmount: parseFloat(tx.fiatAmount || "0"),
          isCompleted: tx.isCompleted || false,
          isRefunded: tx.isRefunded || false,
          txId: tx.txId || `tx-${index}-${timestamp}`,
        };
        console.log(`13. Formatted transaction ${index}:`, formattedTx);
        return formattedTx;
      }
    );

    console.log("14. Sorting transactions by timestamp...");
    // Sort by transactionTimestamp (newest first)
    const sortedTransactions = formattedTransactions.sort(
      (a, b) =>
        Number(b.transactionTimestamp) - Number(a.transactionTimestamp)
    );

    console.log(`15. Sorted transactions for ${userAddress}:`, sortedTransactions);
    console.log("16. Final number of transactions:", sortedTransactions.length);
    console.log("=== RETRIEVE TRANSACTIONS SERVICE END ===");

    return sortedTransactions;
  } catch (error) {
    console.log("❌ Failed to retrieve transactions:", error);
    console.error("Failed to retrieve transactions:", error);
    return [];
  }
};