import { getContractAddresses, GAS_LIMITS, getChainConfig } from '@/config';
import { ethers } from 'ethers';
import { type WalletClient, type PublicClient } from 'viem';

// FiatBridge Contract ABI - Based on Direct.sol
export const FIAT_BRIDGE_ABI = [
    // Cross-chain transfer functions
    {
        inputs: [
            { name: "destinationChainSelector", type: "uint64" },
            { name: "receiver", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "gasLimit", type: "uint256" }
        ],
        name: "initiateCrossChainTransfer",
        outputs: [{ name: "messageId", type: "bytes32" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { name: "destinationChainSelector", type: "uint64" },
            { name: "receiver", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "gasLimit", type: "uint256" }
        ],
        name: "initiateCrossChainTransferNative",
        outputs: [{ name: "messageId", type: "bytes32" }],
        stateMutability: "payable",
        type: "function"
    },
    // Fee estimation functions
    {
        inputs: [
            { name: "destinationChainSelector", type: "uint64" },
            { name: "receiver", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "gasLimit", type: "uint256" }
        ],
        name: "estimateCrossChainFeeLINK",
        outputs: [{ name: "fee", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { name: "destinationChainSelector", type: "uint64" },
            { name: "receiver", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "gasLimit", type: "uint256" }
        ],
        name: "estimateCrossChainFeeNative",
        outputs: [{ name: "fee", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    // Token and chain management
    {
        inputs: [{ name: "token", type: "address" }],
        name: "supportedTokens",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    },
    // Fiat transaction functions
    {
        inputs: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "aggregatorAddress", type: "address" },
            { name: "_fiatBankAccountNumber", type: "uint256" },
            { name: "_fiatAmount", type: "uint256" },
            { name: "_fiatBank", type: "string" },
            { name: "_recipientName", type: "string" }
        ],
        name: "initiateFiatTransaction",
        outputs: [{ name: "txId", type: "bytes32" }],
        stateMutability: "nonpayable",
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
 * Estimates the fee for a cross-chain token transfer via FiatBridge
 */
export const estimateFiatBridgeTransferFee = async (
    params: CCIPTransferParams,
    publicClient: PublicClient,
    chainId: number = 11155111
): Promise<TransferEstimate> => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        const chainConfig = getChainConfig(chainId);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;

        const feeFunction = params.payWithNative
            ? 'estimateCrossChainFeeNative'
            : 'estimateCrossChainFeeLINK';

        const fee = await publicClient.readContract({
            address: contractAddresses.FIAT_BRIDGE,
            abi: FIAT_BRIDGE_ABI,
            functionName: feeFunction,
            args: [
                params.destinationChainSelector,
                params.receiver,
                params.token,
                params.amount,
                BigInt(gasLimit)
            ]
        }) as bigint;

        return {
            fee,
            gasLimit,
            feeToken: params.payWithNative ? null : chainConfig.LINK_TOKEN
        };
    } catch (error) {
        console.error('Error estimating FiatBridge transfer fee:', error);
        throw new Error(`Failed to estimate transfer fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Checks if a token is supported by the FiatBridge contract
 */
export const isFiatBridgeTokenSupported = async (
    tokenAddress: `0x${string}`,
    publicClient: PublicClient,
    chainId: number = 11155111
): Promise<boolean> => {
    try {
        const contractAddresses = getContractAddresses(chainId);
        return await publicClient.readContract({
            address: contractAddresses.FIAT_BRIDGE,
            abi: FIAT_BRIDGE_ABI,
            functionName: 'supportedTokens',
            args: [tokenAddress]
        }) as boolean;
    } catch (error) {
        console.error('Error checking FiatBridge token support:', error);
        return false;
    }
};

/**
 * Gets token balance and allowance for FiatBridge
 */
export const getTokenInfoForFiatBridge = async (
    tokenAddress: `0x${string}`,
    userAddress: `0x${string}`,
    publicClient: PublicClient,
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
                args: [userAddress, contractAddresses.FIAT_BRIDGE] // Note: FiatBridge, not CCIP contract
            }) as Promise<bigint>,
            publicClient.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'decimals'
            }) as Promise<number>
        ]);

        return { balance, allowance, decimals };
    } catch (error) {
        console.error('Error getting token info for FiatBridge:', error);
        throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Approves tokens for FiatBridge transfer
 */
export const approveTokenForFiatBridge = async (
    tokenAddress: `0x${string}`,
    amount: bigint,
    walletClient: WalletClient,
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
            args: [contractAddresses.FIAT_BRIDGE, amount], // Note: FiatBridge, not CCIP contract
            account: walletClient.account,
            chain: walletClient.chain
        });

        return hash;
    } catch (error) {
        console.error('Error approving token for FiatBridge:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to approve token transfer');
        }
        throw new Error('Failed to approve token transfer');
    }
};

/**
 * Initiates a cross-chain token transfer via FiatBridge using LINK for fees
 */
export const fiatBridgeTransferWithLINK = async (
    params: CCIPTransferParams,
    walletClient: WalletClient,
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const contractAddresses = getContractAddresses(chainId || walletClient.chain?.id || 11155111);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;

        const hash = await walletClient.writeContract({
            address: contractAddresses.FIAT_BRIDGE,
            abi: FIAT_BRIDGE_ABI,
            functionName: 'initiateCrossChainTransfer',
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
        console.error('Error transferring tokens via FiatBridge with LINK:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to transfer tokens');
        }
        throw new Error('Failed to transfer tokens');
    }
};

/**
 * Initiates a cross-chain token transfer via FiatBridge using native gas for fees
 */
export const fiatBridgeTransferWithNative = async (
    params: CCIPTransferParams,
    feeAmount: bigint,
    walletClient: WalletClient,
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const contractAddresses = getContractAddresses(chainId || walletClient.chain?.id || 11155111);
        const gasLimit = params.gasLimit || GAS_LIMITS.CCIP_TRANSFER;

        const hash = await walletClient.writeContract({
            address: contractAddresses.FIAT_BRIDGE,
            abi: FIAT_BRIDGE_ABI,
            functionName: 'initiateCrossChainTransferNative',
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
        console.error('Error transferring tokens via FiatBridge with native gas:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'Failed to transfer tokens');
        }
        throw new Error('Failed to transfer tokens');
    }
};

/**
 * Complete workflow for cross-chain transfer via FiatBridge
 */
export const executeFiatBridgeCrossChainTransfer = async (
    params: CCIPTransferParams,
    publicClient: PublicClient,
    walletClient: WalletClient,
    chainId?: number
): Promise<TransferResult> => {
    try {
        if (!walletClient.account) {
            throw new Error('Wallet not connected');
        }

        const currentChainId = chainId || walletClient.chain?.id || 11155111;
        const chainConfig = getChainConfig(currentChainId);

        // 1. Check if token is supported by FiatBridge
        const tokenSupported = await isFiatBridgeTokenSupported(params.token, publicClient, currentChainId);
        if (!tokenSupported) {
            throw new Error('Token is not supported by FiatBridge for cross-chain transfers');
        }

        // 2. Get token info
        const tokenInfo = await getTokenInfoForFiatBridge(params.token, walletClient.account.address, publicClient, currentChainId);

        if (tokenInfo.balance < params.amount) {
            throw new Error('Insufficient token balance');
        }

        // 3. Check and approve if necessary
        if (tokenInfo.allowance < params.amount) {
            console.log('Approving token transfer for FiatBridge...');
            const approveHash = await approveTokenForFiatBridge(params.token, params.amount, walletClient, currentChainId);

            // Wait for approval transaction
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            console.log('Token approved for FiatBridge successfully');
        }

        // 4. Estimate fee
        const estimate = await estimateFiatBridgeTransferFee(params, publicClient, currentChainId);

        // 5. Execute transfer
        let result: TransferResult;
        if (params.payWithNative) {
            result = await fiatBridgeTransferWithNative(params, estimate.fee, walletClient, currentChainId);
        } else {
            // For LINK payment, need to check LINK balance and allowance for FiatBridge
            const linkInfo = await getTokenInfoForFiatBridge(chainConfig.LINK_TOKEN, walletClient.account.address, publicClient, currentChainId);

            if (linkInfo.balance < estimate.fee) {
                throw new Error('Insufficient LINK balance for fees');
            }

            if (linkInfo.allowance < estimate.fee) {
                console.log('Approving LINK for FiatBridge fees...');
                const linkApproveHash = await approveTokenForFiatBridge(chainConfig.LINK_TOKEN, estimate.fee, walletClient, currentChainId);
                await publicClient.waitForTransactionReceipt({ hash: linkApproveHash });
                console.log('LINK approved for FiatBridge fees');
            }

            result = await fiatBridgeTransferWithLINK(params, walletClient, currentChainId);
        }

        result.estimatedFee = estimate.fee;
        return result;

    } catch (error) {
        console.error('Error executing FiatBridge cross-chain transfer:', error);
        if (isErrorWithProps(error)) {
            throw new Error(error.shortMessage || error.message || 'FiatBridge cross-chain transfer failed');
        }
        throw new Error('FiatBridge cross-chain transfer failed');
    }
};
