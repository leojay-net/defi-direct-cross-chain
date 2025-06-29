import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { BackendService, BackendCrossChainTransfer } from '@/services/backendService';

// Type definitions for backend data (compatible with existing frontend)
export interface BackendTransaction {
    id: string;
    txId: string;
    user: {
        id: string;
        address: string;
    };
    token: {
        id: string;
        address: string;
        symbol: string;
        decimals: string;
    };
    amount: string;
    amountSpent?: string;
    fee?: string;
    status: string;
    timestamp: string;
    blockNumber: string;
    crossChain: boolean;
    crossChainTransfer?: {
        id: string;
        messageId: string;
        destinationChain: string;
        status: string;
    };
}

export interface BackendCrossChainTransferFormatted {
    id: string;
    messageId: string;
    user: {
        id: string;
        address: string;
    };
    token: {
        id: string;
        address: string;
        symbol: string;
        decimals: string;
    };
    amount: string;
    destinationChain: string;
    status: string;
    timestamp: string;
    blockNumber: string;
    transaction: {
        id: string;
        txId: string;
        amount: string;
        status: string;
        timestamp: string;
    };
}

export interface UseBackendTransferHistoryReturn {
    // Transfer data
    transactions: BackendTransaction[];
    crossChainTransfers: BackendCrossChainTransferFormatted[];
    isLoading: boolean;
    error: string | null;

    // Functions
    refreshHistory: () => Promise<void>;
    loadMore: () => Promise<void>;

    // Pagination
    hasMore: boolean;
    currentPage: number;
}

interface UseBackendTransferHistoryOptions {
    pageSize?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

/**
 * Convert backend cross-chain transfer to frontend format
 */
const formatBackendTransfer = (transfer: BackendCrossChainTransfer): BackendCrossChainTransferFormatted => {
    return {
        id: transfer.id,
        messageId: transfer.messageId,
        user: {
            id: transfer.userAddress,
            address: transfer.userAddress,
        },
        token: {
            id: transfer.token,
            address: transfer.token,
            symbol: transfer.tokenSymbol || 'UNKNOWN',
            decimals: transfer.tokenDecimals.toString(),
        },
        amount: transfer.amount,
        destinationChain: transfer.destinationChain,
        status: transfer.status,
        timestamp: transfer.timestamp,
        blockNumber: transfer.blockNumber?.toString() || '0',
        transaction: {
            id: transfer.id,
            txId: transfer.txId || transfer.messageId,
            amount: transfer.amount,
            status: transfer.status,
            timestamp: transfer.timestamp,
        },
    };
};

export const useBackendTransferHistory = (
    options: UseBackendTransferHistoryOptions = {}
): UseBackendTransferHistoryReturn => {
    const {
        pageSize = 20,
        autoRefresh = false,
        refreshInterval = 30000 // 30 seconds
    } = options;

    const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
    const [crossChainTransfers, setCrossChainTransfers] = useState<BackendCrossChainTransferFormatted[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const { address } = useAccount();

    /**
     * Fetch user cross-chain transfers from backend
     */
    const fetchCrossChainTransfers = useCallback(async (page: number = 0, reset: boolean = true) => {
        if (!address) return;

        try {
            setIsLoading(true);
            setError(null);

            const userTransfers = await BackendService.getUserCrossChainTransfers(address, {
                page_size: pageSize,
                page: page + 1, // Backend uses 1-based pagination
            });

            const formattedTransfers = userTransfers.map(formatBackendTransfer);

            if (reset) {
                setCrossChainTransfers(formattedTransfers);
            } else {
                setCrossChainTransfers(prev => [...prev, ...formattedTransfers]);
            }

            // Check if there are more transfers
            setHasMore(formattedTransfers.length === pageSize);
            setCurrentPage(page);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cross-chain transfers';
            setError(errorMessage);
            console.error('Error fetching cross-chain transfers:', err);
        } finally {
            setIsLoading(false);
        }
    }, [address, pageSize]);

    /**
     * Fetch user transactions from backend (if needed)
     * For now, we'll focus on cross-chain transfers
     */
    const fetchTransactions = useCallback(async (reset: boolean = true) => {
        if (!address) return;

        try {
            // For now, we'll return empty array for regular transactions
            // This can be expanded later if needed
            if (reset) {
                setTransactions([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            console.error('Error fetching transactions:', err);
        }
    }, [address]);

    /**
     * Refresh history (reload from backend)
     */
    const refreshHistory = useCallback(async () => {
        if (!address) return;

        setCurrentPage(0);
        await Promise.all([
            fetchTransactions(true),
            fetchCrossChainTransfers(0, true)
        ]);
    }, [address, fetchTransactions, fetchCrossChainTransfers]);

    /**
     * Load more transfers (pagination)
     */
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;

        const nextPage = currentPage + 1;
        await Promise.all([
            fetchTransactions(false),
            fetchCrossChainTransfers(nextPage, false)
        ]);
    }, [hasMore, isLoading, currentPage, fetchTransactions, fetchCrossChainTransfers]);

    /**
     * Load initial history when component mounts or user address changes
     */
    useEffect(() => {
        if (address) {
            refreshHistory();
        } else {
            // Clear data when user disconnects
            setTransactions([]);
            setCrossChainTransfers([]);
            setError(null);
            setCurrentPage(0);
            setHasMore(true);
        }
    }, [address, refreshHistory]);

    /**
     * Auto-refresh functionality
     */
    useEffect(() => {
        if (!autoRefresh || !address) return;

        const interval = setInterval(() => {
            refreshHistory();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, address, refreshInterval, refreshHistory]);

    return {
        transactions,
        crossChainTransfers,
        isLoading,
        error,
        refreshHistory,
        loadMore,
        hasMore,
        currentPage,
    };
};

export default useBackendTransferHistory; 