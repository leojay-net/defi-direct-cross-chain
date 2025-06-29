'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { BackendService } from '@/services/backendService';

export const BackendStatus: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'not_syncing'>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkBackendStatus = async () => {
        try {
            setStatus('checking');

            // Try to fetch a simple query to check if backend is responding
            await BackendService.getAllCrossChainTransfers({ page_size: 1 });

            setStatus('connected');
            setLastCheck(new Date());
        } catch (error) {
            console.error('Backend status check failed:', error);
            setStatus('error');
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        checkBackendStatus();
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    badge: <Badge variant="default" className="bg-green-500">Connected</Badge>,
                    title: 'Backend Connected',
                    description: 'The backend API is responding and ready to serve data'
                };
            case 'not_syncing':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
                    badge: <Badge variant="default" className="bg-yellow-500">Not Syncing</Badge>,
                    title: 'Backend Not Syncing',
                    description: 'The backend is deployed but has not started syncing yet'
                };
            case 'error':
                return {
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                    badge: <Badge variant="default" className="bg-red-500">Error</Badge>,
                    title: 'Backend Error',
                    description: 'There was an error connecting to the backend API'
                };
            default:
                return {
                    icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
                    badge: <Badge variant="default" className="bg-blue-500">Checking</Badge>,
                    title: 'Checking Backend',
                    description: 'Verifying backend connection...'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Card className="bg-[#1C1C27] border-[#9C2CFF]/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    {config.icon}
                    Backend Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-white">{config.title}</h3>
                        <p className="text-gray-400 text-sm">{config.description}</p>
                    </div>
                    {config.badge}
                </div>

                {status === 'not_syncing' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-400 mb-2">Backend Not Syncing</h4>
                        <p className="text-gray-400 text-sm mb-3">The backend is deployed but hasn&apos;t started syncing yet. This usually happens when:</p>
                        <ul className="text-gray-400 text-sm space-y-1 mb-3">
                            <li>• The backend needs to be restarted</li>
                            <li>• Database connection issues</li>
                            <li>• Environment configuration problems</li>
                        </ul>
                        <div className="text-gray-400 text-sm">
                            <p className="font-medium mb-1">Troubleshooting steps:</p>
                            <ul className="space-y-1">
                                <li>• Check backend logs for errors</li>
                                <li>• Verify database connectivity</li>
                                <li>• Restart the backend service</li>
                            </ul>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-red-400 mb-2">Connection Error</h4>
                        <p className="text-gray-400 text-sm">Unable to connect to the backend API. Please check:</p>
                        <ul className="text-gray-400 text-sm space-y-1 mt-2">
                            <li>• Backend service is running</li>
                            <li>• Network connectivity</li>
                            <li>• API endpoint configuration</li>
                        </ul>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={checkBackendStatus}
                        disabled={status === 'checking'}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
                        Refresh Status
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://backend-cf8a.onrender.com', '_blank')}
                        className="flex items-center gap-2"
                    >
                        View Backend
                    </Button>
                </div>

                {lastCheck && (
                    <div className="text-xs text-gray-500">
                        Last checked: {lastCheck.toLocaleTimeString()}
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="font-medium mb-1">Backend Details:</div>
                    <div className="text-sm text-gray-400 space-y-1">
                        <div>URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-cf8a.onrender.com'}</div>
                        <div>Status: {status}</div>
                        <div>Last Check: {lastCheck ? lastCheck.toLocaleString() : 'Never'}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 