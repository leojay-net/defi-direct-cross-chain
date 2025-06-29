import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { type PublicClient } from 'viem';
import {
    CCIPTransferParams,
    TransferResult,
    TransferEstimate,
    executeFiatBridgeCrossChainTransfer,
    estimateFiatBridgeTransferFee,
    isFiatBridgeTokenSupported,
    getTokenInfoForFiatBridge
} from '@/services/fiatBridgeService';
import { formatUnits } from 'viem';

export interface UseCCIPTransferReturn {
    // State
    isLoading: boolean;
    isEstimating: boolean;
    estimate: TransferEstimate | null;
    error: string | null;
    result: TransferResult | null;

    // Functions
    estimateFee: (params: CCIPTransferParams) => Promise<void>;
    executeTransfer: (params: CCIPTransferParams) => Promise<TransferResult>;
    checkChainSupport: (chainSelector: bigint) => Promise<boolean>;
    checkTokenSupport: (tokenAddress: `0x${string}`) => Promise<boolean>;
    getTokenBalance: (tokenAddress: `0x${string}`, userAddress: `0x${string}`) => Promise<{
        balance: string;
        decimals: number;
        allowance: string;
    }>;
    reset: () => void;
}

export const useCCIPTransfer = (): UseCCIPTransferReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [estimate, setEstimate] = useState<TransferEstimate | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<TransferResult | null>(null);

    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const chainId = useChainId();

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsEstimating(false);
        setEstimate(null);
        setError(null);
        setResult(null);
    }, []);

    const estimateFee = useCallback(async (params: CCIPTransferParams) => {
        if (!publicClient) {
            setError('Public client not available');
            return;
        }

        setIsEstimating(true);
        setError(null);

        try {
            const transferEstimate = await estimateFiatBridgeTransferFee(params, publicClient as PublicClient, chainId);
            setEstimate(transferEstimate);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to estimate fee';
            setError(errorMessage);
            console.error('Fee estimation error:', err);
        } finally {
            setIsEstimating(false);
        }
    }, [publicClient, chainId]);

    const executeTransfer = useCallback(async (params: CCIPTransferParams): Promise<TransferResult> => {
        if (!publicClient) {
            throw new Error('Public client not available');
        }
        if (!walletClient || !walletClient.account) {
            throw new Error('Wallet not connected');
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const transferResult = await executeFiatBridgeCrossChainTransfer(params, publicClient as PublicClient, walletClient, chainId);
            setResult(transferResult);
            return transferResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
            setError(errorMessage);
            console.error('Transfer error:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [publicClient, walletClient, chainId]);

    const checkChainSupport = useCallback(async (chainSelector: bigint): Promise<boolean> => {
        if (!publicClient) {
            return false;
        }

        try {
            // Check against our supported chains list from Avalanche Fuji deployment
            // These are the chains allowlisted in the deployed CCIP contract
            const supportedSelectors = [
                BigInt('16015286601757825753'), // Ethereum Sepolia (allowlisted in deployment)
                BigInt('10344971235874465080'), // Base Sepolia (allowlisted in deployment)
                BigInt('12532609583862916517'), // Polygon Mumbai (allowlisted in deployment)
                BigInt('14767482510784806043'), // Avalanche Fuji (current chain)
            ];

            return supportedSelectors.includes(chainSelector);
        } catch (err) {
            console.error('Error checking chain support:', err);
            return false;
        }
    }, [publicClient]);

    const checkTokenSupport = useCallback(async (tokenAddress: `0x${string}`): Promise<boolean> => {
        if (!publicClient) {
            return false;
        }

        try {
            return await isFiatBridgeTokenSupported(tokenAddress, publicClient as PublicClient, chainId);
        } catch (err) {
            console.error('Error checking token support:', err);
            return false;
        }
    }, [publicClient, chainId]);

    const getTokenBalance = useCallback(async (
        tokenAddress: `0x${string}`,
        userAddress: `0x${string}`
    ) => {
        if (!publicClient) {
            throw new Error('Public client not available');
        }

        try {
            const tokenInfo = await getTokenInfoForFiatBridge(tokenAddress, userAddress, publicClient as PublicClient, chainId);

            return {
                balance: formatUnits(tokenInfo.balance, tokenInfo.decimals),
                decimals: tokenInfo.decimals,
                allowance: formatUnits(tokenInfo.allowance, tokenInfo.decimals),
            };
        } catch (err) {
            console.error('Error getting token balance:', err);
            throw err;
        }
    }, [publicClient, chainId]);

    return {
        isLoading,
        isEstimating,
        estimate,
        error,
        result,
        estimateFee,
        executeTransfer,
        checkChainSupport,
        checkTokenSupport,
        getTokenBalance,
        reset,
    };
};
