"use client";

import React, { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { Web3ConnectModal } from '@/components/ui/Web3ConnectModal';
import { Wallet } from 'lucide-react';
import { addAvalancheFujiToWallet, isOnAvalancheFuji } from '@/utils/walletDetection';

export function ConnectButton() {
    const [modalOpen, setModalOpen] = useState(false);
    const [isAddingChain, setIsAddingChain] = useState(false);
    const { isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const userContext = useUser();

    // Function to handle wallet connection with chain validation
    const handleConnect = async () => {
        try {
            // If user is logged in but doesn't have a wallet, create one
            if (userContext.user && !userHasWallet(userContext)) {
                console.log('Creating wallet for user...');
                await userContext.createWallet();
            }

            // Check if we're on Avalanche Fuji
            const onCorrectChain = await isOnAvalancheFuji();

            if (!onCorrectChain) {
                setIsAddingChain(true);
                const success = await addAvalancheFujiToWallet();
                setIsAddingChain(false);

                if (!success) {
                    console.warn('Failed to add Avalanche Fuji to wallet');
                    // Continue with connection anyway
                }
            }

            // Try to connect to browser wallet first, then fallback to embedded
            const browserConnectors = connectors.filter(connector =>
                connector.id !== 'civic' && connector.ready
            );

            if (browserConnectors.length > 0) {
                // Connect to the first available browser wallet
                console.log('Connecting to browser wallet...');
                connect({ connector: browserConnectors[0] });
            } else {
                // Fallback to embedded wallet
                const embeddedConnector = connectors.find(connector => connector.id === 'civic');
                if (embeddedConnector && !isConnected) {
                    console.log('Connecting to embedded wallet...');
                    connect({ connector: embeddedConnector });
                }
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setIsAddingChain(false);
            // Fallback to modal if auto-connect fails
            setModalOpen(true);
        }
    };

    // If wallet is connected, don't show this button
    if (isConnected && userContext.user && userHasWallet(userContext)) {
        return null;
    }

    return (
        <>
            <button
                onClick={userContext.user ? handleConnect : () => setModalOpen(true)}
                disabled={isAddingChain}
                className="group relative overflow-hidden bg-[#7b40e3] hover:bg-[#6830d1] disabled:bg-gray-500 text-white rounded-2xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 h-[44px] active:scale-95 disabled:scale-100"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                    <Wallet className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>
                        {isAddingChain
                            ? 'Adding Network...'
                            : userContext.user
                                ? 'Connect Wallet'
                                : 'Login & Connect'
                        }
                    </span>
                </div>
            </button>

            <Web3ConnectModal
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    );
}
