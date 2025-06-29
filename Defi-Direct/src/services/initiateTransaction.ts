import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/paydirect';
import { ethers } from 'ethers';
import { TransactionReceipt as ViemTransactionReceipt } from 'viem';
import { TransactionReceipt as EthersTransactionReceipt } from 'ethers';
import { getPriceFeedAddress, getChainConfig } from '@/config';

type CombinedTransactionReceipt = ViemTransactionReceipt | EthersTransactionReceipt;

// Define interfaces with the specific properties we need
interface PublicClientInterface {
  chain: { id: number };
  waitForTransactionReceipt: (params: { hash: `0x${string}` }) => Promise<ViemTransactionReceipt>;
}

interface WalletClientInterface {
  writeContract: (params: {
    address: `0x${string}`;
    abi: readonly object[];
    functionName: string;
    args: readonly unknown[];
  }) => Promise<`0x${string}`>;
  account: {
    address: `0x${string}`;
  };
}

// Use these custom interfaces for our functions
type WagmiPublicClient = PublicClientInterface;
type WagmiWalletClient = WalletClientInterface;

const TOKEN_CONTRACT_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const approveTransaction = async (
  amount: number,
  tokenAddress: string,
  publicClient: WagmiPublicClient,
  walletClient: WagmiWalletClient
): Promise<{ receipt: CombinedTransactionReceipt | undefined; approvalFee: number; txHash: `0x${string}`; totalAmountApproved: number }> => {
  if (!walletClient) {
    console.error("Wallet client is undefined. Connect wallet first.");
    throw new Error("Wallet client is undefined");
  }

  const fee = (amount * 100) / 10000; // 1% fee
  const totalAmount = Math.round(amount + fee);
  console.log("TotalAmountwithfee:", totalAmount);

  // approve the token
  try {
    // Use walletClient to write to the contract
    const txHash = await walletClient.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_CONTRACT_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, BigInt(totalAmount)],
    });

    console.log("Transaction hash:", txHash);

    // Wait for the transaction to be mined
    const receipt = await publicClient?.waitForTransactionReceipt?.({ hash: txHash });
    console.log("Transaction mined:", receipt);

    return {
      receipt: receipt,
      approvalFee: fee,
      txHash: txHash,
      totalAmountApproved: totalAmount
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

// Type guard for error objects
function isErrorWithProps(e: unknown): e is { shortMessage?: string; message?: string; details?: unknown; data?: unknown } {
  return typeof e === 'object' && e !== null;
}

export const initiateTransaction = async (
  amount: number,
  tokenAddress: string,
  fiatBankAccountNumber: string,
  fiatAmount: number,
  fiatBank: string,
  recipientName: string,
  publicClient: WagmiPublicClient,
  walletClient: WagmiWalletClient
) => {
  if (!walletClient) {
    console.error("Wallet client is undefined. Connect wallet first.");
    return;
  }

  try {
    // Get the current chain ID
    const chainId = publicClient.chain?.id;
    if (!chainId) {
      throw new Error("Unable to determine chain ID");
    }

    // Get the aggregator address for the token based on chain and token type
    let aggregatorAddress: string;
    const config = getChainConfig(chainId);

    if (tokenAddress.toLowerCase() === config.USDC_TOKEN.toLowerCase()) {
      aggregatorAddress = getPriceFeedAddress(chainId, 'USDC');
    } else if (tokenAddress.toLowerCase() === config.USDT_TOKEN.toLowerCase()) {
      aggregatorAddress = getPriceFeedAddress(chainId, 'USDT');
    } else {
      throw new Error("Unsupported token for price feed");
    }

    console.log("Using aggregator address:", aggregatorAddress);
    console.log("Chain ID:", chainId);
    console.log("Token address:", tokenAddress);

    // Use walletClient to write to the contract with all required arguments
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'initiateFiatTransaction',
      args: [
        tokenAddress as `0x${string}`,
        BigInt(amount),
        aggregatorAddress as `0x${string}`,  // Dynamic aggregator address
        BigInt(fiatBankAccountNumber),
        BigInt(fiatAmount),
        fiatBank,
        recipientName
      ],
    });
    console.log("Account number:", Number(fiatBankAccountNumber));
    console.log("amount:", amount);
    console.log("Transaction hash:", txHash);

    // Wait for the transaction to be mined
    const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
    console.log("Transaction mined:", receipt);

    return receipt;
  } catch (error) {
    console.error("Transaction failed:", error);

    // Handle different types of errors safely
    let errorMessage = 'Transaction failed. Please try again.';

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
const contractInterface = new ethers.Interface(CONTRACT_ABI);

export async function parseTransactionReceipt(receipt: CombinedTransactionReceipt) {
  console.log("=== PARSING TRANSACTION RECEIPT ===");
  console.log("1. Starting to parse transaction receipt");
  console.log("2. Number of logs:", receipt.logs.length);
  console.log("3. Receipt logs:", receipt.logs);

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    console.log(`4. Processing log ${i}:`, log);

    try {
      // Decode the log
      const parsedLog = contractInterface.parseLog(log);
      console.log(`5. Parsed log ${i}:`, parsedLog);

      // Check if the log is the TransactionInitiated event
      if (parsedLog && parsedLog.name === "TransactionInitiated") {
        console.log("6. ✅ Found TransactionInitiated event!");
        const txId = parsedLog.args.txId;
        const user = parsedLog.args.user;
        const amount = parsedLog.args.amount;

        console.log("7. Transaction ID:", txId);
        console.log("8. User:", user);
        console.log("9. Amount:", amount.toString());

        return { txId, user, amount };
      } else if (parsedLog) {
        console.log(`6. Found event: ${parsedLog.name} (not TransactionInitiated)`);
      }
    } catch (error) {
      console.log(`5. ❌ Could not parse log ${i}:`, error);
      // Skip logs that cannot be parsed (e.g., logs from other contracts)
      continue;
    }
  }

  console.log("❌ TransactionInitiated event not found in logs");
  console.log("=== END PARSING TRANSACTION RECEIPT ===");
  return null;
}