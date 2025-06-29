"use client";

import React, { useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { addAvalancheFujiToWallet, isOnAvalancheFuji } from '@/utils/walletDetection';

export function useAutoConnect() {
    const { connectors, connect } = useConnect();
    const { isConnected } = useAccount();
    const userContext = useUser();

    useEffect(() => {
        const handleAutoConnect = async () => {
            // Only proceed if user is logged in but not connected to wallet
            if (!userContext.user || isConnected) return;

            try {
                // Check if we're on Avalanche Fuji
                const onCorrectChain = await isOnAvalancheFuji();

                if (!onCorrectChain) {
                    console.log('Adding Avalanche Fuji to wallet...');
                    const success = await addAvalancheFujiToWallet();
                    if (!success) {
                        console.warn('Failed to add Avalanche Fuji to wallet');
                    }
                }

                // Try to connect to browser wallet first, then fallback to embedded
                const browserConnectors = connectors.filter(connector =>
                    connector.id !== 'civic' && connector.ready
                );

                if (browserConnectors.length > 0) {
                    // Connect to the first available browser wallet
                    console.log('Auto-connecting to browser wallet...');
                    connect({ connector: browserConnectors[0] });
                } else {
                    // Fallback to embedded wallet
                    if (!userHasWallet(userContext)) {
                        console.log('Creating wallet for new user...');
                        await userContext.createWallet();
                    }

                    const embeddedConnector = connectors.find(connector => connector.id === 'civic');
                    if (embeddedConnector && !isConnected) {
                        console.log('Auto-connecting to embedded wallet...');
                        connect({ connector: embeddedConnector });
                    }
                }
            } catch (error) {
                console.error('Error in auto-connect:', error);
            }
        };

        handleAutoConnect();
    }, [userContext.user, isConnected, connectors, connect, userContext]);
}

// Wrapper component for auto-connect functionality
export function AutoConnectWrapper({ children }: { children: React.ReactNode }) {
    useAutoConnect();
    return <>{children}</>;
}
