'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import TransferHistory from './TransferHistory';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface TransferHistoryIntegrationProps {
    className?: string;
}

const TransferHistoryIntegration: React.FC<TransferHistoryIntegrationProps> = ({ className }) => {
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Connect your wallet to view transfer history</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <TransferHistory className={className} />;
};

export default TransferHistoryIntegration;
