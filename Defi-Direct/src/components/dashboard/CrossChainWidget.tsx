"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, TrendingUp, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BackendService, BackendCrossChainTransfer } from '@/services/backendService';

// Define proper types for the data
interface Transfer {
    id: string;
    amount: string;
    from: string;
    to: string;
    status: string;
    time: string;
    messageId: string;
    transactionHash?: string;
}

interface Analytics {
    totalTransfers: number;
    volume24h: number;
    avgTime: number;
    recentTransfers: Transfer[];
    change24h: number;
    avgTimeChange: number;
}

// Hook to fetch CCIP analytics from backend
const useCCIPAnalytics = () => {
    return useQuery({
        queryKey: ['ccip-analytics'],
        queryFn: async () => {
            try {
                // Get all cross-chain transfers from backend
                const transfers = await BackendService.getAllCrossChainTransfers({
                    page_size: 100 // Get more data for analytics
                });
                return transfers;
            } catch (error) {
                console.error('Error fetching CCIP analytics:', error);
                return [];
            }
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};

// Calculate analytics from backend data
const calculateAnalytics = (transfers: BackendCrossChainTransfer[]): Analytics => {
    if (!transfers || transfers.length === 0) {
        return {
            totalTransfers: 0,
            volume24h: 0,
            avgTime: 0,
            recentTransfers: [],
            change24h: 0,
            avgTimeChange: 0,
        };
    }

    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400; // 24 hours ago

    // Calculate total transfers
    const totalTransfers = transfers.length;

    // Calculate 24h volume (sum of amounts)
    const volume24h = transfers
        .filter((t) => parseInt(t.timestamp) > oneDayAgo)
        .reduce((sum, t) => {
            const amount = parseFloat(t.amount) || 0;
            return sum + amount;
        }, 0);

    // Calculate average time (simplified - using timestamps)
    const recentTransfers: Transfer[] = transfers.slice(0, 10).map((t) => ({
        id: t.id,
        amount: `${parseFloat(t.amount || '0').toFixed(2)} ${t.tokenSymbol || 'TOKEN'}`,
        from: t.sourceChain || 'Current Chain',
        to: t.destinationChain || 'Unknown',
        status: t.status,
        time: `${Math.floor((now - parseInt(t.timestamp)) / 60)}m ago`,
        messageId: t.messageId,
        transactionHash: t.transactionHash,
    }));

    // Calculate changes (simplified)
    const change24h = totalTransfers > 0 ? Math.floor(Math.random() * 20) + 5 : 0; // Mock change for now
    const avgTimeChange = Math.floor(Math.random() * 5) - 2; // Mock change for now

    return {
        totalTransfers,
        volume24h,
        avgTime: 8, // Mock average time
        recentTransfers,
        change24h,
        avgTimeChange,
    };
};

export const CrossChainWidget = () => {
    const { data, isLoading, error } = useCCIPAnalytics();
    const analytics = calculateAnalytics(data || []);

    const stats = [
        {
            label: "Total Transfers",
            value: analytics.totalTransfers.toLocaleString(),
            change: analytics.totalTransfers > 0 ? `+${analytics.change24h}%` : "0%",
            icon: <ArrowRight className="h-4 w-4" />
        },
        {
            label: "Volume (24h)",
            value: analytics.volume24h > 0 ? `$${(analytics.volume24h * 1.5).toFixed(1)}K` : "$0K",
            change: analytics.volume24h > 0 ? `+${Math.floor(Math.random() * 15) + 5}%` : "0%",
            icon: <TrendingUp className="h-4 w-4" />
        },
        {
            label: "Avg. Time",
            value: `${analytics.avgTime} min`,
            change: analytics.avgTimeChange > 0 ? `+${analytics.avgTimeChange} min` : `${analytics.avgTimeChange} min`,
            icon: <Clock className="h-4 w-4" />
        }
    ];

    if (isLoading) {
        return (
            <Card className="bg-[#1C1C27] border-[#9C2CFF]/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        CCIP Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-600 rounded"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-[#1C1C27] border-[#9C2CFF]/20">
                <CardHeader>
                    <CardTitle className="text-white">CCIP Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">Unable to load analytics</p>
                        <p className="text-gray-500 text-xs mt-1">Check backend connection</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[#1C1C27] border-[#9C2CFF]/20">
            <CardHeader>
                <CardTitle className="text-white">CCIP Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                {stat.icon}
                                <span className="text-xs text-gray-400">{stat.label}</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{stat.value}</div>
                            <div className="text-xs text-green-400">{stat.change}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Transfers */}
                <div>
                    <h4 className="text-white font-medium mb-3">Recent Transfers</h4>
                    <div className="space-y-2">
                        {analytics.recentTransfers.length > 0 ? (
                            analytics.recentTransfers.slice(0, 3).map((transfer: Transfer) => (
                                <div key={transfer.id} className="flex items-center justify-between p-2 bg-[#2F2F3A] rounded-lg">
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{transfer.amount}</div>
                                        <div className="text-xs text-gray-400">{transfer.from} → {transfer.to}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {transfer.status}
                                        </Badge>
                                        <span className="text-xs text-gray-400">{transfer.time}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-400 text-sm">No transfers yet</p>
                                <p className="text-gray-500 text-xs mt-1">Complete your first cross-chain transfer</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Link href="/crosschain" className="w-full">
                        <Button className="w-full bg-[#9C2CFF] hover:bg-[#8A1FD9]">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Start Cross-Chain Transfer
                        </Button>
                    </Link>
                    <Link href="/crosschain?tab=history" className="w-full">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-[#2F2F3A]">
                            View All Transfers
                        </Button>
                    </Link>
                </div>

                {/* Info */}
                <div className="p-3 bg-[#1C1C27] border border-[#9C2CFF]/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-[#9C2CFF] mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-300">
                            <div className="font-medium mb-1">Powered by Chainlink CCIP</div>
                            <div>Secure, reliable cross-chain transfers with real-time price feeds</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
