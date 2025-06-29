import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { avalancheFuji } from '@/lib/chains';
import { addAvalancheFujiToWallet, isOnAvalancheFuji } from '@/utils/walletDetection';

export function useChainManagement() {
    const { isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const userContext = useUser();

    useEffect(() => {
        const ensureCorrectChain = async () => {
            // Only proceed if user is connected and authenticated
            if (!isConnected || !userContext.user || !userHasWallet(userContext)) {
                return;
            }

            try {
                // Check if we're on Avalanche Fuji
                const onCorrectChain = await isOnAvalancheFuji();

                if (!onCorrectChain) {
                    console.log('Switching to Avalanche Fuji...');

                    // Try to switch chain first
                    try {
                        await switchChain({ chainId: avalancheFuji.id });
                    } catch {
                        console.log('Chain switch failed, adding network...');

                        // If switch fails, try to add the network
                        const success = await addAvalancheFujiToWallet();
                        if (!success) {
                            console.warn('Failed to add Avalanche Fuji to wallet');
                        }
                    }
                }
            } catch (error) {
                console.error('Error ensuring correct chain:', error);
            }
        };

        ensureCorrectChain();
    }, [isConnected, chainId, userContext, switchChain]);

    return {
        isOnCorrectChain: chainId === avalancheFuji.id,
        switchToAvalancheFuji: () => switchChain({ chainId: avalancheFuji.id }),
    };
} 