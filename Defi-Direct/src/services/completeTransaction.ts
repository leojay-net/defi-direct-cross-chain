import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/paydirect";
import { type WalletClient, type Client, type PublicClient } from "viem";
import { ethers } from "ethers";

// Type guard for error objects
function isErrorWithProps(e: unknown): e is { shortMessage?: string; message?: string; details?: unknown; data?: unknown } {
  return typeof e === 'object' && e !== null;
}

/**
 * Complete a transaction using wagmi-style client-side contract interaction
 * 
 * NOTE: This function requires the connected wallet to have TRANSACTION_MANAGER role
 * in the smart contract. This is different from the previous server-side approach
 * that used a dedicated private key.
 * 
 * @param transactionId - The transaction ID (bytes32)
 * @param amountSpent - The amount spent (must match original amount)
 * @param publicClient - Wagmi public client for blockchain interaction
 * @param walletClient - Wagmi wallet client for transaction signing
 * @returns Transaction hash
 */
export const completeTransaction = async (
  transactionId: string,
  amountSpent: number,
  publicClient: Client, // Using generic Client type to avoid viem version conflicts
  walletClient: WalletClient
): Promise<`0x${string}`> => {
  if (!walletClient) {
    console.error("Wallet client is undefined. Connect wallet first.");
    throw new Error("Wallet client is undefined");
  }

  if (!walletClient.account) {
    console.error("No account found in wallet client.");
    throw new Error("No account found in wallet client");
  }

  try {
    // Ensure transactionId is properly formatted as bytes32
    const encodedTxId = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32"],
      [transactionId]
    ) as `0x${string}`;

    // Use wagmi wallet client to write to the contract
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'completeTransaction',
      args: [encodedTxId, BigInt(amountSpent)],
      account: walletClient.account,
      chain: publicClient.chain,
    });

    console.log("Complete transaction hash:", txHash);
    console.log("Transaction ID:", transactionId);
    console.log("Amount spent:", amountSpent);

    return txHash;
  } catch (error) {
    console.error("Complete transaction failed:", error);

    // Handle different types of errors safely using type guard
    let errorMessage = 'Complete transaction failed. Please try again.';

    if (isErrorWithProps(error)) {
      try {
        if (error.shortMessage && typeof error.shortMessage === 'string') {
          console.error("Contract revert:", error.shortMessage);
          errorMessage = error.shortMessage;
        } else if (error.message && typeof error.message === 'string') {
          console.error("Error message:", error.message);
          errorMessage = error.message;
        }
        if (error.details) {
          console.error("Error details:", error.details);
        }
        if (error.data) {
          console.error("Error data:", error.data);
        }
      } catch (propCheckError) {
        console.error("Error checking error properties:", propCheckError);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Wait for a complete transaction to be mined and return the receipt
 * 
 * @param txHash - Transaction hash from completeTransaction
 * @param publicClient - Wagmi public client for blockchain interaction
 * @returns Transaction receipt
 */
export const waitForCompleteTransaction = async (
  txHash: `0x${string}`,
  publicClient: PublicClient
) => {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("Complete transaction mined:", receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to wait for complete transaction:", error);

    // Handle different types of errors safely using type guard
    let errorMessage = 'Failed to wait for transaction completion. Please try again.';

    if (isErrorWithProps(error)) {
      try {
        if (error.shortMessage && typeof error.shortMessage === 'string') {
          console.error("Contract revert:", error.shortMessage);
          errorMessage = error.shortMessage;
        } else if (error.message && typeof error.message === 'string') {
          console.error("Error message:", error.message);
          errorMessage = error.message;
        }
        if (error.details) {
          console.error("Error details:", error.details);
        }
        if (error.data) {
          console.error("Error data:", error.data);
        }
      } catch (propCheckError) {
        console.error("Error checking error properties:", propCheckError);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(errorMessage);
  }
};