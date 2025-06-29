import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { SubgraphService } from '@/services/subgraphService';

// Type definitions for subgraph data
export interface SubgraphTransaction {
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

export interface SubgraphCrossChainTransfer {
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

export interface UseSubgraphTransferHistoryReturn {
    // Transfer data
    transactions: SubgraphTransaction[];
    crossChainTransfers: SubgraphCrossChainTransfer[];
    isLoading: boolean;
    error: string | null;

    // Functions
    refreshHistory: () => Promise<void>;
    loadMore: () => Promise<void>;

    // Pagination
    hasMore: boolean;
    currentPage: number;
}

interface UseSubgraphTransferHistoryOptions {
    pageSize?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export const useSubgraphTransferHistory = (
    options: UseSubgraphTransferHistoryOptions = {}
): UseSubgraphTransferHistoryReturn => {
    const {
        pageSize = 20,
        autoRefresh = false,
        refreshInterval = 30000 // 30 seconds
    } = options;

    const [transactions, setTransactions] = useState<SubgraphTransaction[]>([]);
    const [crossChainTransfers, setCrossChainTransfers] = useState<SubgraphCrossChainTransfer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const { address } = useAccount();

    /**
     * Fetch user transactions from subgraph
     */
    const fetchTransactions = useCallback(async (page: number = 0, reset: boolean = true) => {
        if (!address) return;

        try {
            setIsLoading(true);
            setError(null);

            const skip = page * pageSize;
            const userTransactions = await SubgraphService.getUserTransactions(address, {
                first: pageSize,
                skip,
                orderBy: "timestamp",
                orderDirection: "desc"
            });

            if (reset) {
                setTransactions(userTransactions);
            } else {
                setTransactions(prev => [...prev, ...userTransactions]);
            }

            // Check if there are more transactions
            setHasMore(userTransactions.length === pageSize);
            setCurrentPage(page);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            console.error('Error fetching transactions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [address, pageSize]);

    /**
     * Fetch user cross-chain transfers from subgraph
     */
    const fetchCrossChainTransfers = useCallback(async (page: number = 0, reset: boolean = true) => {
        if (!address) return;

        try {
            const skip = page * pageSize;
            const userTransfers = await SubgraphService.getUserCrossChainTransfers(address, {
                first: pageSize,
                skip
            });

            if (reset) {
                setCrossChainTransfers(userTransfers);
            } else {
                setCrossChainTransfers(prev => [...prev, ...userTransfers]);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cross-chain transfers';
            setError(errorMessage);
            console.error('Error fetching cross-chain transfers:', err);
        }
    }, [address, pageSize]);

    /**
     * Refresh history (reload from subgraph)
     */
    const refreshHistory = useCallback(async () => {
        if (!address) return;

        setCurrentPage(0);
        await Promise.all([
            fetchTransactions(0, true),
            fetchCrossChainTransfers(0, true)
        ]);
    }, [address, fetchTransactions, fetchCrossChainTransfers]);

    /**
     * Load more transactions (pagination)
     */
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;

        const nextPage = currentPage + 1;
        await Promise.all([
            fetchTransactions(nextPage, false),
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

export default useSubgraphTransferHistory;
