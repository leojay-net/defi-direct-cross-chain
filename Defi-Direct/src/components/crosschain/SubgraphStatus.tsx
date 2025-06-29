'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { SubgraphService } from '@/services/subgraphService';

export const SubgraphStatus: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'checking' | 'connected' | 'not-syncing' | 'error'>('checking');
    const [error, setError] = useState<string | null>(null);

    const checkSubgraphStatus = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Try to fetch a simple query to check if subgraph is syncing
            await SubgraphService.getAllCrossChainTransfers({ first: 1 });
            setStatus('connected');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';

            if (errorMessage.includes('not started syncing yet')) {
                setStatus('not-syncing');
            } else {
                setStatus('error');
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSubgraphStatus();
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    icon: CheckCircle,
                    color: 'text-green-500',
                    bgColor: 'bg-green-500/10',
                    borderColor: 'border-green-500/20',
                    title: 'Subgraph Connected',
                    description: 'The subgraph is syncing and ready to serve data'
                };
            case 'not-syncing':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                    title: 'Subgraph Not Syncing',
                    description: 'The subgraph is deployed but has not started syncing yet'
                };
            case 'error':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                    title: 'Subgraph Error',
                    description: 'There was an error connecting to the subgraph'
                };
            default:
                return {
                    icon: RefreshCw,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/20',
                    title: 'Checking Subgraph',
                    description: 'Verifying subgraph connection...'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <Card className={`bg-[#1C1C27] border-gray-700 ${config.bgColor} ${config.borderColor}`}>
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    Subgraph Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status:</span>
                    <Badge variant={status === 'connected' ? 'default' : 'destructive'}>
                        {isLoading ? 'Checking...' :
                            status === 'connected' ? 'Connected' :
                                status === 'not-syncing' ? 'Not Syncing' : 'Error'}
                    </Badge>
                </div>

                <p className="text-gray-300 text-sm">{config.description}</p>

                {status === 'not-syncing' && (
                    <Alert className="border-yellow-500/50 bg-yellow-900/20">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-yellow-400">
                            <div className="space-y-2">
                                <p>The subgraph is deployed but hasn&apos;t started syncing yet. This usually happens when:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>No events have been emitted from the contract yet</li>
                                    <li>The start block is too recent</li>
                                    <li>The subgraph needs to be redeployed</li>
                                </ul>
                                <div className="mt-3 space-y-2">
                                    <p className="font-medium">To fix this:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm">
                                        <li>Perform a cross-chain transfer to trigger events</li>
                                        <li>Redeploy the subgraph with an earlier start block</li>
                                        <li>Check the subgraph deployment status</li>
                                    </ol>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert className="border-red-500/50 bg-red-900/20">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-400">
                            Error: {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={checkSubgraphStatus}
                        disabled={isLoading}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                    >
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Check Status
                    </Button>

                    <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                        onClick={() => window.open('https://thegraph.com/studio/subgraph/107317/defi-direct-graph', '_blank')}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Studio
                    </Button>
                </div>

                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-[#9C2CFF] mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-300">
                            <div className="font-medium mb-1">Subgraph Details:</div>
                            <div>Network: Avalanche Fuji</div>
                            <div>Contract: 0xfE2567096081eB4CF4E0DE60f4E76A9cFD3b39D7</div>
                            <div>Start Block: 42583659</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 