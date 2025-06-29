'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    RefreshCw,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Copy,
    ArrowUpRight,
    ChevronDown
} from 'lucide-react';
import { useBackendTransferHistory } from '@/hooks/useBackendTransferHistory';
import type { BackendTransaction, BackendCrossChainTransferFormatted } from '@/hooks/useBackendTransferHistory';

// Chain ID to names mapping
const CHAIN_NAMES: Record<string, string> = {
    '1': 'Ethereum Mainnet',
    '11155111': 'Ethereum Sepolia',
    '8453': 'Base',
    '84532': 'Base Sepolia',
    '137': 'Polygon',
    '80002': 'Polygon Amoy',
    '43114': 'Avalanche',
    '43113': 'Avalanche Fuji'
};

// Status icons and colors
const STATUS_CONFIG = {
    initiated: { icon: Clock, color: 'bg-yellow-500', label: 'Initiated' },
    pending: { icon: AlertCircle, color: 'bg-blue-500', label: 'Pending' },
    in_progress: { icon: Clock, color: 'bg-orange-500', label: 'In Progress' },
    completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
    failed: { icon: XCircle, color: 'bg-red-500', label: 'Failed' },
    refunded: { icon: RefreshCw, color: 'bg-purple-500', label: 'Refunded' }
};

interface TransferHistoryProps {
    className?: string;
}

const TransferHistory: React.FC<TransferHistoryProps> = ({ className }) => {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const {
        transactions,
        crossChainTransfers,
        isLoading,
        error,
        refreshHistory,
        loadMore,
        hasMore
    } = useBackendTransferHistory({
        pageSize: 20,
        autoRefresh: true,
        refreshInterval: 30000
    });

    /**
     * Copy text to clipboard
     */
    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setTimeout(() => setCopiedText(null), 2000);
            console.log(`${type} copied to clipboard`);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    /**
     * Get block explorer URL for transaction
     */
    const getExplorerUrl = (txHash: string, chainId: string) => {
        const explorers: Record<string, string> = {
            '1': 'https://etherscan.io/tx',
            '11155111': 'https://sepolia.etherscan.io/tx',
            '8453': 'https://basescan.org/tx',
            '84532': 'https://sepolia.basescan.org/tx',
            '137': 'https://polygonscan.com/tx',
            '80002': 'https://www.oklink.com/amoy/tx',
            '43114': 'https://snowtrace.io/tx',
            '43113': 'https://testnet.snowtrace.io/tx'
        };

        const baseUrl = explorers[chainId];
        return baseUrl ? `${baseUrl}/${txHash}` : null;
    };

    /**
     * Format timestamp to readable date
     */
    const formatTimestamp = (timestamp: string) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleString();
    };

    /**
     * Format token amount with proper decimals
     */
    const formatTokenAmount = (amount: string, decimals: string = '18') => {
        const divisor = Math.pow(10, parseInt(decimals));
        const formattedAmount = (parseFloat(amount) / divisor).toFixed(6);
        return parseFloat(formattedAmount).toString(); // Remove trailing zeros
    };

    /**
     * Get chain name from chain ID
     */
    const getChainName = (chainId: string) => {
        return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
    };

    /**
     * Render status badge
     */
    const renderStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
        const Icon = config.icon;

        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    /**
     * Render transaction hash with copy and explorer links
     */
    const renderTxHash = (txHash: string, chainId: string) => {
        const explorerUrl = getExplorerUrl(txHash, chainId);

        return (
            <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1">
                    {`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}
                </code>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(txHash, 'Transaction Hash')}
                    className="h-6 w-6 p-0"
                >
                    <Copy className={`w-3 h-3 ${copiedText === txHash ? 'text-green-500' : ''}`} />
                </Button>
                {explorerUrl && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(explorerUrl, '_blank')}
                        className="h-6 w-6 p-0"
                    >
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                )}
            </div>
        );
    };

    /**
     * Render regular transaction item
     */
    const renderTransaction = (transaction: BackendTransaction) => (
        <Card key={transaction.id} className="mb-4">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">
                            {transaction.crossChain ? 'Cross-Chain Transaction' : 'Transaction'}
                        </h4>
                        {renderStatusBadge(transaction.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                        {formatTimestamp(transaction.timestamp)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Amount:</p>
                        <p className="font-mono">
                            {formatTokenAmount(transaction.amount, transaction.token.decimals)} {transaction.token.symbol}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Token:</p>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{transaction.token.symbol}</span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {`${transaction.token.address.slice(0, 6)}...${transaction.token.address.slice(-4)}`}
                            </code>
                        </div>
                    </div>

                    {transaction.crossChainTransfer && (
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Destination Chain:</p>
                            <p>{getChainName(transaction.crossChainTransfer.destinationChain)}</p>
                        </div>
                    )}

                    {transaction.fee && (
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Fee:</p>
                            <p className="font-mono">{formatTokenAmount(transaction.fee)} tokens</p>
                        </div>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Transaction ID:</p>
                    {renderTxHash(transaction.txId, '1')}
                </div>
            </CardContent>
        </Card>
    );

    /**
     * Render cross-chain transfer item
     */
    const renderCrossChainTransfer = (transfer: BackendCrossChainTransferFormatted) => (
        <Card key={transfer.id} className="mb-4">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium">Cross-Chain Transfer</h4>
                        {renderStatusBadge(transfer.status)}
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-500">
                        {formatTimestamp(transfer.timestamp)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Amount:</p>
                        <p className="font-mono">
                            {formatTokenAmount(transfer.amount, transfer.token.decimals)} {transfer.token.symbol}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-600 dark:text-gray-400">To:</p>
                        <p>{getChainName(transfer.destinationChain)}</p>
                    </div>

                    <div>
                        <p className="text-gray-600 dark:text-gray-400">User:</p>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {`${transfer.user.address.slice(0, 6)}...${transfer.user.address.slice(-4)}`}
                        </code>
                    </div>

                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Message ID:</p>
                        <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {`${transfer.messageId.slice(0, 6)}...${transfer.messageId.slice(-4)}`}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(transfer.messageId, 'Message ID')}
                                className="h-6 w-6 p-0"
                            >
                                <Copy className={`w-3 h-3 ${copiedText === transfer.messageId ? 'text-green-500' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Transaction ID:</p>
                    {renderTxHash(transfer.transaction.txId, '1')}
                </div>
            </CardContent>
        </Card>
    );

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-red-500">
                        <XCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Error loading transfer history: {error}</p>
                        <Button onClick={refreshHistory} className="mt-2">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Combine and sort all transfers by timestamp
    const allTransfers = [
        ...transactions.map(tx => ({ ...tx, type: 'transaction' as const })),
        ...crossChainTransfers.map(transfer => ({ ...transfer, type: 'crosschain' as const }))
    ].sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

    const completedTransfers = allTransfers.filter(t => t.status === 'completed');
    // const pendingTransfers = allTransfers.filter(t => ['initiated', 'pending'].includes(t.status));

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Transfer History</CardTitle>
                        <CardDescription>
                            Your transaction and cross-chain transfer history
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshHistory}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">
                            All ({allTransfers.length})
                        </TabsTrigger>
                        <TabsTrigger value="transactions">
                            Transactions ({transactions.length})
                        </TabsTrigger>
                        <TabsTrigger value="crosschain">
                            Cross-Chain ({crossChainTransfers.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedTransfers.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                        {isLoading && allTransfers.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>Loading transfer history...</p>
                            </div>
                        ) : allTransfers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>No transfers found</p>
                                <p className="text-sm">Your transactions and transfers will appear here</p>
                            </div>
                        ) : (
                            <div>
                                {allTransfers.map((item) =>
                                    item.type === 'crosschain'
                                        ? renderCrossChainTransfer(item as BackendCrossChainTransferFormatted)
                                        : renderTransaction(item as BackendTransaction)
                                )}

                                {hasMore && (
                                    <div className="text-center mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={loadMore}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 mr-2" />
                                            )}
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="transactions" className="mt-4">
                        {isLoading && transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            <div>
                                {transactions.map(renderTransaction)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="crosschain" className="mt-4">
                        {isLoading && crossChainTransfers.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>Loading cross-chain transfers...</p>
                            </div>
                        ) : crossChainTransfers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ArrowUpRight className="w-8 h-8 mx-auto mb-2" />
                                <p>No cross-chain transfers found</p>
                            </div>
                        ) : (
                            <div>
                                {crossChainTransfers.map(renderCrossChainTransfer)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="mt-4">
                        {isLoading && completedTransfers.length === 0 ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>Loading completed transfers...</p>
                            </div>
                        ) : completedTransfers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>No completed transfers found</p>
                            </div>
                        ) : (
                            <div>
                                {completedTransfers.map((item) =>
                                    item.type === 'crosschain'
                                        ? renderCrossChainTransfer(item as BackendCrossChainTransferFormatted)
                                        : renderTransaction(item as BackendTransaction)
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default TransferHistory;
