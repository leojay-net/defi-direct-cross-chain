"use client";

import { useState } from 'react';
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

interface CrossChainTransfer {
    id: string;
    messageId: string;
    transactionHash: string;
    sourceChain: string;
    destinationChain: string;
    token: string;
    amount: string;
    receiver: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: Date;
    estimatedFee: string;
    feeToken: string;
}

// Mock data for demonstration
const mockTransfers: CrossChainTransfer[] = [
    {
        id: '1',
        messageId: '0x1234...5678',
        transactionHash: '0xabcd...efgh',
        sourceChain: 'Base Sepolia',
        destinationChain: 'Ethereum Sepolia',
        token: 'CCIP-BnM',
        amount: '100.0',
        receiver: '0x9876...5432',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        estimatedFee: '0.005',
        feeToken: 'ETH'
    },
    {
        id: '2',
        messageId: '0x2345...6789',
        transactionHash: '0xbcde...fghi',
        sourceChain: 'Base Sepolia',
        destinationChain: 'Ethereum Sepolia',
        token: 'CCIP-LnM',
        amount: '50.0',
        receiver: '0x8765...4321',
        status: 'pending',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        estimatedFee: '0.003',
        feeToken: 'ETH'
    }
];

export const CrossChainTransferHistory = () => {
    const [transfers] = useState<CrossChainTransfer[]>(mockTransfers);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshTransfers = async () => {
        setIsRefreshing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

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
            case 'confirmed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'failed':
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
                    {transfers.length === 0 ? (
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
                                                        {formatAddress(transfer.transactionHash)}
                                                    </code>
                                                    <Button
                                                        onClick={() => copyToClipboard(transfer.transactionHash)}
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
