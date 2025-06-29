"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
    ArrowRight,
    Copy,
    Info
} from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config';
import { BackendService } from '@/services/backendService';
import { useAccount } from 'wagmi';

interface CrossChainTransfer {
    id: string;
    messageId: string;
    transactionHash?: string;
    sourceChain: string;
    destinationChain: string;
    token: string;
    amount: string;
    receiver: string;
    status: 'pending' | 'initiated' | 'in_progress' | 'completed' | 'failed' | 'refunded';
    timestamp: Date;
    estimatedFee: string;
    feeToken: string;
}

export const CrossChainTransferHistory = () => {
    const [transfers, setTransfers] = useState<CrossChainTransfer[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { address } = useAccount();

    const fetchTransfers = async () => {
        if (!address) return;

        try {
            setIsLoading(true);
            setError(null);

            const backendTransfers = await BackendService.getUserCrossChainTransfers(address, {
                page_size: 50
            });

            const formattedTransfers: CrossChainTransfer[] = backendTransfers.map(transfer => ({
                id: transfer.id,
                messageId: transfer.messageId,
                transactionHash: transfer.transactionHash,
                sourceChain: transfer.sourceChain,
                destinationChain: transfer.destinationChain,
                token: transfer.tokenSymbol || 'TOKEN',
                amount: transfer.amount,
                receiver: transfer.userAddress,
                status: transfer.status,
                timestamp: new Date(parseInt(transfer.timestamp) * 1000),
                estimatedFee: transfer.fee,
                feeToken: 'LINK'
            }));

            setTransfers(formattedTransfers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfers';
            setError(errorMessage);
            console.error('Error fetching transfers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshTransfers = async () => {
        setIsRefreshing(true);
        await fetchTransfers();
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchTransfers();
    }, [address]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (hours > 0) {
            return `${hours}h ago`;
        } else {
            return `${minutes}m ago`;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
            case 'initiated':
            case 'in_progress':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
            case 'refunded':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'pending':
            case 'initiated':
            case 'in_progress':
                return 'bg-yellow-500';
            case 'failed':
            case 'refunded':
                return 'bg-red-500';
            default:
                return 'bg-gray-600';
        }
    };

    const getChainIcon = (chainName: string) => {
        const chain = SUPPORTED_CHAINS.find(c => c.name === chainName);
        if (chain) {
            return (
                <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: chain.iconColor }}
                >
                    {chain.icon}
                </div>
            );
        }
        return <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold text-white">?</div>;
    };

    return (
        <div className="space-y-6">
            <Card className="bg-[#1C1C27] border-gray-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-[#9C2CFF]" />
                            Cross-Chain Transfer History
                        </CardTitle>
                        <Button
                            onClick={refreshTransfers}
                            disabled={isRefreshing}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                        >
                            {isRefreshing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center mb-4">
                                <RefreshCw className="h-8 w-8 animate-spin text-[#9C2CFF]" />
                            </div>
                            <div className="text-gray-400 mb-2">Loading transfer history...</div>
                            <div className="text-sm text-gray-500">
                                Fetching your cross-chain transfers from the backend
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center mb-4">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="text-red-400 mb-2">Failed to load transfers</div>
                            <div className="text-sm text-gray-500 mb-4">
                                {error}
                            </div>
                            <Button
                                onClick={refreshTransfers}
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">No cross-chain transfers yet</div>
                            <div className="text-sm text-gray-500">
                                Your transfer history will appear here once you make your first cross-chain transaction
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transfers.map((transfer) => (
                                <Card key={transfer.id} className="bg-[#2F2F3A] border-gray-600">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getChainIcon(transfer.sourceChain)}</span>
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    <span className="text-lg">{getChainIcon(transfer.destinationChain)}</span>
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">
                                                        {transfer.amount} {transfer.token}
                                                    </div>
                                                    <div className="text-gray-400 text-sm">
                                                        {transfer.sourceChain} → {transfer.destinationChain}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="default"
                                                    className={getStatusColor(transfer.status)}
                                                >
                                                    {getStatusIcon(transfer.status)}
                                                    <span className="ml-1 capitalize">{transfer.status}</span>
                                                </Badge>
                                                <div className="text-gray-400 text-sm">
                                                    {formatTime(transfer.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-400 mb-1">Message ID</div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[#9C2CFF] bg-[#1C1C27] px-2 py-1 rounded">
                                                        {formatAddress(transfer.messageId)}
                                                    </code>
                                                    <Button
                                                        onClick={() => copyToClipboard(transfer.messageId)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-gray-400 mb-1">Transaction Hash</div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[#9C2CFF] bg-[#1C1C27] px-2 py-1 rounded">
                                                        {formatAddress(transfer.transactionHash || '')}
                                                    </code>
                                                    <Button
                                                        onClick={() => copyToClipboard(transfer.transactionHash || '')}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-gray-400 mb-1">Receiver</div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-green-500 bg-[#1C1C27] px-2 py-1 rounded">
                                                        {formatAddress(transfer.receiver)}
                                                    </code>
                                                    <Button
                                                        onClick={() => copyToClipboard(transfer.receiver)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-gray-400 mb-1">Fee Paid</div>
                                                <div className="text-white">
                                                    {transfer.estimatedFee} {transfer.feeToken}
                                                </div>
                                            </div>
                                        </div>

                                        {transfer.status === 'pending' && (
                                            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                    <div className="text-yellow-300 text-sm">
                                                        <div className="font-medium mb-1">Transfer in Progress</div>
                                                        <div>
                                                            Your transfer is being processed by Chainlink CCIP.
                                                            This typically takes 5-20 minutes depending on network conditions.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                                                onClick={() => window.open(`https://ccip.chain.link/msg/${transfer.messageId}`, '_blank')}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                CCIP Explorer
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                                                onClick={() => window.open(`https://sepolia.basescan.org/tx/${transfer.transactionHash}`, '_blank')}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                View on Explorer
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
