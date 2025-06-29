import axios from 'axios';

// Backend API configuration
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cf8a.onrender.com';

// Create axios instance for backend API
const backendApi = axios.create({
    baseURL: BACKEND_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Types for backend API responses
export interface BackendCrossChainTransfer {
    id: string;
    messageId: string;
    txId?: string;
    userAddress: string;
    token: string;
    tokenSymbol?: string;
    tokenDecimals: number;
    amount: string;
    amountSpent: string;
    fee: string;
    sourceChain: string;
    destinationChain: string;
    status: 'pending' | 'initiated' | 'in_progress' | 'completed' | 'failed' | 'refunded';
    blockNumber?: number;
    transactionHash?: string;
    timestamp: string;
    gasUsed?: number;
    gasPrice?: number;
    created_at: string;
    updated_at: string;
}

export interface BackendTransferStats {
    total_transfers: number;
    completed_transfers: number;
    pending_transfers: number;
    failed_transfers: number;
    total_volume: string;
    unique_users: number;
    average_gas_used?: number;
}

export interface BackendApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export class BackendService {
    /**
     * Get all cross-chain transfers
     */
    static async getAllCrossChainTransfers(params?: {
        page?: number;
        page_size?: number;
    }): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/', {
                params: {
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching all cross-chain transfers:', error);
            throw new Error('Failed to fetch cross-chain transfers');
        }
    }

    /**
     * Get cross-chain transfers by user address
     */
    static async getUserCrossChainTransfers(
        userAddress: string,
        params?: {
            page?: number;
            page_size?: number;
        }
    ): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/by_user_address/', {
                params: {
                    userAddress: userAddress.toLowerCase(),
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching user cross-chain transfers:', error);
            throw new Error('Failed to fetch user cross-chain transfers');
        }
    }

    /**
     * Get cross-chain transfer by message ID
     */
    static async getCrossChainTransferByMessageId(messageId: string): Promise<BackendCrossChainTransfer> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/by_message_id/', {
                params: { messageId },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching cross-chain transfer by message ID:', error);
            throw new Error('Failed to fetch cross-chain transfer');
        }
    }

    /**
     * Get cross-chain transfers by status
     */
    static async getCrossChainTransfersByStatus(
        status: string,
        userAddress?: string,
        params?: {
            page?: number;
            page_size?: number;
        }
    ): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/by_status/', {
                params: {
                    status,
                    userAddress: userAddress?.toLowerCase(),
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching cross-chain transfers by status:', error);
            throw new Error('Failed to fetch cross-chain transfers by status');
        }
    }

    /**
     * Get completed cross-chain transfers
     */
    static async getCompletedCrossChainTransfers(
        userAddress?: string,
        params?: {
            page?: number;
            page_size?: number;
        }
    ): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/completed_transfers/', {
                params: {
                    userAddress: userAddress?.toLowerCase(),
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching completed cross-chain transfers:', error);
            throw new Error('Failed to fetch completed cross-chain transfers');
        }
    }

    /**
     * Get pending cross-chain transfers
     */
    static async getPendingCrossChainTransfers(
        userAddress?: string,
        params?: {
            page?: number;
            page_size?: number;
        }
    ): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/pending_transfers/', {
                params: {
                    userAddress: userAddress?.toLowerCase(),
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching pending cross-chain transfers:', error);
            throw new Error('Failed to fetch pending cross-chain transfers');
        }
    }

    /**
     * Get cross-chain transfer statistics
     */
    static async getCrossChainTransferStats(userAddress?: string): Promise<BackendTransferStats> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/stats/', {
                params: {
                    userAddress: userAddress?.toLowerCase(),
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching cross-chain transfer stats:', error);
            throw new Error('Failed to fetch cross-chain transfer statistics');
        }
    }

    /**
     * Store cross-chain transfer initiated event
     */
    static async storeCrossChainInitiated(transferData: {
        messageId: string;
        txId?: string;
        userAddress: string;
        token: string;
        tokenSymbol?: string;
        tokenDecimals: number;
        amount: string;
        amountSpent: string;
        fee: string;
        sourceChain: string;
        destinationChain: string;
        blockNumber?: number;
        transactionHash?: string;
        timestamp: string;
        gasUsed?: number;
        gasPrice?: number;
    }): Promise<BackendCrossChainTransfer> {
        try {
            const response = await backendApi.post('/crosschain/cross-chain-transfers/store_cross_chain_initiated/', transferData);
            return response.data.transfer;
        } catch (error) {
            console.error('Error storing cross-chain initiated event:', error);
            throw new Error('Failed to store cross-chain initiated event');
        }
    }

    /**
     * Update cross-chain transfer status
     */
    static async updateTransferStatus(
        messageId: string,
        status: string,
        additionalData?: {
            blockNumber?: number;
            transactionHash?: string;
            gasUsed?: number;
            gasPrice?: number;
        }
    ): Promise<BackendCrossChainTransfer> {
        try {
            const response = await backendApi.put('/crosschain/cross-chain-transfers/update_transfer_status/', {
                messageId,
                status,
                ...additionalData,
            });
            return response.data.transfer;
        } catch (error) {
            console.error('Error updating transfer status:', error);
            throw new Error('Failed to update transfer status');
        }
    }

    /**
     * Mark cross-chain transfer as completed
     */
    static async markTransferCompleted(
        messageId: string,
        completionData?: {
            blockNumber?: number;
            transactionHash?: string;
            gasUsed?: number;
            gasPrice?: number;
        }
    ): Promise<BackendCrossChainTransfer> {
        try {
            const response = await backendApi.put('/crosschain/cross-chain-transfers/mark_completed/', {
                messageId,
                ...completionData,
            });
            return response.data.transfer;
        } catch (error) {
            console.error('Error marking transfer as completed:', error);
            throw new Error('Failed to mark transfer as completed');
        }
    }

    /**
     * Mark cross-chain transfer as failed
     */
    static async markTransferFailed(
        messageId: string,
        reason?: string
    ): Promise<BackendCrossChainTransfer> {
        try {
            const response = await backendApi.put('/crosschain/cross-chain-transfers/mark_failed/', {
                messageId,
                reason,
            });
            return response.data.transfer;
        } catch (error) {
            console.error('Error marking transfer as failed:', error);
            throw new Error('Failed to mark transfer as failed');
        }
    }

    /**
     * Get transfers between specific chain pairs
     */
    static async getTransfersByChainPair(
        sourceChain: string,
        destinationChain: string,
        params?: {
            page?: number;
            page_size?: number;
        }
    ): Promise<BackendCrossChainTransfer[]> {
        try {
            const response = await backendApi.get('/crosschain/cross-chain-transfers/by_chain_pair/', {
                params: {
                    sourceChain,
                    destinationChain,
                    page: params?.page || 1,
                    page_size: params?.page_size || 20,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching transfers by chain pair:', error);
            throw new Error('Failed to fetch transfers by chain pair');
        }
    }
}

export default BackendService; 