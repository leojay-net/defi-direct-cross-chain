"use client";

import React from 'react';
import { useState } from "react";
import { CrossChainTransferForm } from "@/components/crosschain/CrossChainTransferForm";
import TransferHistory from "@/components/crosschain/TransferHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Zap,
    Shield,
    Clock,
    TrendingUp,
    Network,
    CheckCircle,
    Link as LinkIcon,
    Layers
} from "lucide-react";
import { SUPPORTED_CHAINS, TOKEN_ADDRESSES } from "@/config";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CrossChainPage() {
    const [activeTab, setActiveTab] = useState("transfer");

    const features = [
        {
            icon: <Shield className="h-6 w-6 text-green-500" />,
            title: "Secure Transfers",
            description: "Powered by Chainlink CCIP for maximum security and reliability"
        },
        {
            icon: <Clock className="h-6 w-6 text-yellow-500" />,
            title: "Fast Settlement",
            description: "Cross-chain transfers typically complete in 5-20 minutes"
        },
        {
            icon: <Network className="h-6 w-6 text-[#9C2CFF]" />,
            title: "Multi-Chain Support",
            description: "Transfer between all major blockchains seamlessly"
        },
        {
            icon: <TrendingUp className="h-6 w-6 text-green-500" />,
            title: "Dynamic Pricing",
            description: "Real-time fee calculation with Chainlink price feeds"
        }
    ];

    const supportedTokens = Object.keys(TOKEN_ADDRESSES);

    return (
        <div className="min-h-screen bg-[#0A0014] text-white">
            {/* Header Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-[#9C2CFF] rounded-full">
                            <Layers className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#9C2CFF]">
                        Cross-Chain Bridge
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Transfer your tokens across different blockchains with enterprise-grade security using Chainlink CCIP
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-[#1C1C27] border-gray-700">
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-[#9C2CFF] mb-2">
                                {SUPPORTED_CHAINS.length}
                            </div>
                            <div className="text-gray-400">Supported Chains</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1C1C27] border-gray-700">
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-[#9C2CFF] mb-2">
                                {supportedTokens.length}
                            </div>
                            <div className="text-gray-400">Available Tokens</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1C1C27] border-gray-700">
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-500 mb-2">
                                99.9%
                            </div>
                            <div className="text-gray-400">Uptime</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1C1C27] border-gray-700">
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-yellow-500 mb-2">
                                24/7
                            </div>
                            <div className="text-gray-400">Support</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-[#1C1C27] border-gray-700">
                        <TabsTrigger value="transfer" className="data-[state=active]:bg-[#9C2CFF]">
                            Transfer
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-[#9C2CFF]">
                            History
                        </TabsTrigger>
                        <TabsTrigger value="features" className="data-[state=active]:bg-[#9C2CFF]">
                            Features
                        </TabsTrigger>
                        <TabsTrigger value="supported" className="data-[state=active]:bg-[#9C2CFF]">
                            Supported
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transfer" className="mt-8">
                        <CrossChainTransferForm />
                    </TabsContent>

                    <TabsContent value="history" className="mt-8">
                        <TransferHistory />
                    </TabsContent>

                    <TabsContent value="features" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="bg-[#1C1C27] border-gray-700 hover:border-[#9C2CFF]/50 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-[#2F2F3A] rounded-lg">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-400">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* How it Works Section */}
                        <Card className="mt-8 bg-[#1C1C27] border-[#9C2CFF]/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#9C2CFF]" />
                                    How Cross-Chain Transfers Work
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[#9C2CFF] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-white font-bold">1</span>
                                        </div>
                                        <h4 className="font-semibold text-white mb-2">Initiate Transfer</h4>
                                        <p className="text-gray-400 text-sm">
                                            Select your tokens, destination chain, and receiver address
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-white font-bold">2</span>
                                        </div>
                                        <h4 className="font-semibold text-white mb-2">CCIP Processing</h4>
                                        <p className="text-gray-400 text-sm">
                                            Chainlink CCIP securely routes your tokens cross-chain
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-white font-bold">3</span>
                                        </div>
                                        <h4 className="font-semibold text-white mb-2">Receive Tokens</h4>
                                        <p className="text-gray-400 text-sm">
                                            Tokens arrive in your destination wallet within minutes
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="supported" className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Supported Chains */}
                            <Card className="bg-[#1C1C27] border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Network className="h-5 w-5 text-[#9C2CFF]" />
                                        Supported Chains
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {SUPPORTED_CHAINS.map((chain) => (
                                        <div key={chain.id} className="flex items-center justify-between p-4 bg-[#2F2F3A] rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                                    style={{ backgroundColor: chain.iconColor }}
                                                >
                                                    {chain.icon}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{chain.name}</div>
                                                    <div className="text-gray-400 text-sm">Chain ID: {chain.id}</div>
                                                </div>
                                            </div>
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Supported Tokens */}
                            <Card className="bg-[#1C1C27] border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-[#9C2CFF]" />
                                        Supported Tokens
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {supportedTokens.map((token) => (
                                        <div key={token} className="flex items-center justify-between p-4 bg-[#2F2F3A] rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#9C2CFF] flex items-center justify-center text-sm font-bold">
                                                    {token.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{token}</div>
                                                    <div className="text-gray-400 text-sm">
                                                        {TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES].slice(0, 10)}...
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Supported
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Integration Info */}
                        <Card className="mt-8 bg-[#1C1C27] border-[#9C2CFF]/20">
                            <CardHeader>
                                <CardTitle className="text-white">Chainlink CCIP Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                                        <ul className="space-y-2 text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Decentralized oracle network
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Built-in risk management
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Programmable token transfers
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Real-time price feeds
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-3">Security Measures:</h4>
                                        <ul className="space-y-2 text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-[#9C2CFF]" />
                                                Multi-layer validation
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-[#9C2CFF]" />
                                                Rate limiting protection
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-[#9C2CFF]" />
                                                Anomaly detection
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-[#9C2CFF]" />
                                                Emergency pause mechanism
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
