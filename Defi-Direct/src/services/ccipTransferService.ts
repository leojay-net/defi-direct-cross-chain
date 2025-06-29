import { getContractAddresses, GAS_LIMITS, getChainConfig } from '@/config';
import { ethers } from 'ethers';
import { type WalletClient, type PublicClient } from 'viem';

// CCIP Token Transfer Contract ABI (minimal interface)
export const CCIP_TOKEN_TRANSFER_ABI = [
    {
        inputs: [
            { name: "_destinationChainSelector", type: "uint64" },
            { name: "_receiver", type: "address" },
            { name: "_token", type: "address" },
            { name: "_amount", type: "uint256" },
            { name: "_gasLimit", type: "uint256" }
        ],
        name: "transferTokensPayLINK",
        outputs: [{ name: "messageId", type: "bytes32" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { name: "_destinationChainSelector", type: "uint64" },
            { name: "_receiver", type: "address" },
            { name: "_token", type: "address" },
            { name: "_amount", type: "uint256" },
            { name: "_gasLimit", type: "uint256" }
        ],
        name: "transferTokensPayNative",
        outputs: [{ name: "messageId", type: "bytes32" }],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { name: "_destinationChainSelector", type: "uint64" },
            { name: "_receiver", type: "address" },
            { name: "_token", type: "address" },
            { name: "_amount", type: "uint256" },
            { name: "_feeToken", type: "address" },
            { name: "_gasLimit", type: "uint256" }
        ],
        name: "estimateTransferFee",
        outputs: [{ name: "fee", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ name: "_destinationChainSelector", type: "uint64" }],
        name: "isChainAllowlisted",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ name: "_token", type: "address" }],
        name: "isTokenSupported",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    }
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
    {
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" }
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function"
    }
] as const;

export interface CCIPTransferParams {
    destinationChainSelector: bigint;
    receiver: `0x${string}`;
    token: `0x${string}`;
    amount: bigint;
    gasLimit?: number;
    payWithNative?: boolean;
}

export interface TransferEstimate {
    fee: bigint;
    gasLimit: number;
    feeToken: `0x${string}` | null; // null for native
}

export interface TransferResult {
    messageId: `0x${string}`;
    transactionHash: `0x${string}`;
    estimatedFee: bigint;
}

// Type guard for error objects
function isErrorWithProps(e: unknown): e is {
    shortMessage?: string;
    message?: string;
    details?: unknown;
    data?: unknown;
    cause?: unknown;
} {
    return typeof e === 'object' && e !== null;
}

/**
 * Estimates the fee for a cross-chain token transfer
 */
export const estimateCCIPTransferFee = async (
    params: CCIPTransferParams,
    publicClient: PublicClient, // Use actual viem type
    chainId: number = 11155111
): Promise<TransferEstimate> => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        const chainConfig = getChainConfig(chainId);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;
        const feeToken = params.payWithNative ? null : chainConfig.LINK_TOKEN;

        const fee = await publicClient.readContract({
            address: contractAddresses.CCIP_TOKEN_TRANSFER,
            abi: CCIP_TOKEN_TRANSFER_ABI,
            functionName: 'estimateTransferFee',
            args: [
                params.destinationChainSelector,
                params.receiver,
                params.token,
                params.amount,
                feeToken || '0x0000000000000000000000000000000000000000' as `0x${string}`,
                BigInt(gasLimit)
            ]
        }) as bigint;

        return {
            fee,
            gasLimit,
            feeToken
        };
    } catch (error) {
        console.error('Error estimating CCIP transfer fee:', error);
        throw new Error(`Failed to estimate transfer fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Checks if a destination chain is allowlisted
 */
export const isChainAllowlisted = async (
    chainSelector: bigint,
    publicClient: PublicClient, // Use actual viem type
    chainId: number = 11155111
): Promise<boolean> => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        return await publicClient.readContract({
            address: contractAddresses.CCIP_TOKEN_TRANSFER,
            abi: CCIP_TOKEN_TRANSFER_ABI,
            functionName: 'isChainAllowlisted',
            args: [chainSelector]
        }) as boolean;
    } catch (error) {
        console.error('Error checking chain allowlist:', error);
        return false;
    }
};

/**
 * Checks if a token is supported for cross-chain transfers
 */
export const isTokenSupported = async (
    tokenAddress: `0x${string}`,
    publicClient: PublicClient, // Use actual viem type
    chainId: number = 11155111
): Promise<boolean> => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        return await publicClient.readContract({
            address: contractAddresses.CCIP_TOKEN_TRANSFER,
            abi: CCIP_TOKEN_TRANSFER_ABI,
            functionName: 'isTokenSupported',
            args: [tokenAddress]
        }) as boolean;
    } catch (error) {
        console.error('Error checking token support:', error);
        return false;
    }
};

/**
 * Gets token balance and allowance
 */
export const getTokenInfo = async (
    tokenAddress: `0x${string}`,
    userAddress: `0x${string}`,
    publicClient: PublicClient, // Use actual viem type
    chainId: number = 11155111
) => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        const [balance, allowance, decimals] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [userAddress]
            }) as Promise<bigint>,
            publicClient.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [userAddress, contractAddresses.CCIP_TOKEN_TRANSFER]
            }) as Promise<bigint>,
            publicClient.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'decimals'
            }) as Promise<number>
        ]);

        return { balance, allowance, decimals };
    } catch (error) {
        console.error('Error getting token info:', error);
        throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Approves tokens for cross-chain transfer
 */
export const approveTokenTransfer = async (
    tokenAddress: `0x${string}`,
    amount: bigint,
    walletClient: WalletClient, // Use actual viem type
    chainId?: number
): Promise<`0x${string}`> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const contractAddresses = getContractAddresses(chainId || walletClient.chain?.id || 11155111);
        const hash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddresses.CCIP_TOKEN_TRANSFER, amount],
            account: walletClient.account,
            chain: walletClient.chain
        });

        return hash;
    } catch (error) {
        console.error('Error approving token transfer:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to approve token transfer');
        }
        throw new Error('Failed to approve token transfer');
    }
};

/**
 * Initiates a cross-chain token transfer using LINK for fees
 */
export const transferTokensPayLINK = async (
    params: CCIPTransferParams,
    walletClient: WalletClient, // Use actual viem type
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const contractAddresses = getContractAddresses(chainId || walletClient.chain?.id || 11155111);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;

        const hash = await walletClient.writeContract({
            address: contractAddresses.CCIP_TOKEN_TRANSFER,
            abi: CCIP_TOKEN_TRANSFER_ABI,
            functionName: 'transferTokensPayLINK',
            args: [
                params.destinationChainSelector,
                params.receiver,
                params.token,
                params.amount,
                BigInt(gasLimit)
            ],
            account: walletClient.account,
            chain: walletClient.chain
        });

        // For this implementation, we'll return a mock messageId since we can't easily decode logs
        const messageId = ethers.keccak256(hash) as `0x${string}`;

        return {
            messageId,
            transactionHash: hash,
            estimatedFee: BigInt(0) // Will be populated from estimate call
        };
    } catch (error) {
        console.error('Error transferring tokens with LINK:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to transfer tokens');
        }
        throw new Error('Failed to transfer tokens');
    }
};

/**
 * Initiates a cross-chain token transfer using native gas for fees
 */
export const transferTokensPayNative = async (
    params: CCIPTransferParams,
    feeAmount: bigint,
    walletClient: WalletClient, // Use actual viem type
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const contractAddresses = getContractAddresses(chainId || walletClient.chain?.id || 11155111);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;

        const hash = await walletClient.writeContract({
            address: contractAddresses.CCIP_TOKEN_TRANSFER,
            abi: CCIP_TOKEN_TRANSFER_ABI,
            functionName: 'transferTokensPayNative',
            args: [
                params.destinationChainSelector,
                params.receiver,
                params.token,
                params.amount,
                BigInt(gasLimit)
            ],
            value: feeAmount,
            account: walletClient.account,
            chain: walletClient.chain
        });

        // For this implementation, we'll return a mock messageId since we can't easily decode logs
        const messageId = ethers.keccak256(hash) as `0x${string}`;

        return {
            messageId,
            transactionHash: hash,
            estimatedFee: feeAmount
        };
    } catch (error) {
        console.error('Error transferring tokens with native gas:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to transfer tokens');
        }
        throw new Error('Failed to transfer tokens');
    }
};

/**
 * Complete workflow for cross-chain transfer
 */
export const executeCrossChainTransfer = async (
    params: CCIPTransferParams,
    publicClient: PublicClient, // Use actual viem type
    walletClient: WalletClient,  // Use actual viem type
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const currentChainId = chainId || walletClient.chain?.id || 11155111;
        const chainConfig = getChainConfig(currentChainId);

        // 1. Check if chain is allowlisted
        const chainAllowed = await isChainAllowlisted(params.destinationChainSelector, publicClient, currentChainId);
        if (!chainAllowed) {
            throw new Error('Destination chain is not allowlisted');
        }

        // 2. Check if token is supported
        const tokenSupported = await isTokenSupported(params.token, publicClient, currentChainId);
        if (!tokenSupported) {
            throw new Error('Token is not supported for cross-chain transfers');
        }

        // 3. Get token info
        const tokenInfo = await getTokenInfo(params.token, walletClient.account.address, publicClient, currentChainId);

        if (tokenInfo.balance < params.amount) {
            throw new Error('Insufficient token balance');
        }

        // 4. Check and approve if necessary
        if (tokenInfo.allowance < params.amount) {
            console.log('Approving token transfer...');
            const approveHash = await approveTokenTransfer(params.token, params.amount, walletClient, currentChainId);

            // Wait for approval transaction
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            console.log('Token approved successfully');
        }

        // 5. Estimate fee
        const estimate = await estimateCCIPTransferFee(params, publicClient, currentChainId);

        // 6. Execute transfer
        let result: TransferResult;
        if (params.payWithNative) {
            result = await transferTokensPayNative(params, estimate.fee, walletClient, currentChainId);
        } else {
            // For LINK payment, need to check LINK balance and allowance
            const linkInfo = await getTokenInfo(chainConfig.LINK_TOKEN, walletClient.account.address, publicClient, currentChainId);

            if (linkInfo.balance < estimate.fee) {
                throw new Error('Insufficient LINK balance for fees');
            }

            if (linkInfo.allowance < estimate.fee) {
                console.log('Approving LINK for fees...');
                const linkApproveHash = await approveTokenTransfer(chainConfig.LINK_TOKEN, estimate.fee, walletClient, currentChainId);
                await publicClient.waitForTransactionReceipt({ hash: linkApproveHash });
                console.log('LINK approved for fees');
            }

            result = await transferTokensPayLINK(params, walletClient, currentChainId);
        }

        result.estimatedFee = estimate.fee;
        return result;

    } catch (error) {
        console.error('Error executing cross-chain transfer:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Cross-chain transfer failed');
        }
        throw new Error('Cross-chain transfer failed');
    }
};
