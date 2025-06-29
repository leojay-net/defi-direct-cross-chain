// Function to add Avalanche Fuji to user's wallet if not present
export const addAvalancheFujiToWallet = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) {
        return false;
    }

    try {
        // Check if Avalanche Fuji is already added
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId === '0xa869') { // Avalanche Fuji chain ID in hex
            return true; // Already on Avalanche Fuji
        }

        // Add Avalanche Fuji to wallet
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: '0xa869', // 43113 in hex
                    chainName: 'Avalanche Fuji',
                    nativeCurrency: {
                        name: 'Avalanche',
                        symbol: 'AVAX',
                        decimals: 18,
                    },
                    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                    blockExplorerUrls: ['https://testnet.snowtrace.io'],
                },
            ],
        });

        // Switch to Avalanche Fuji
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }],
        });

        return true;
    } catch (error) {
        console.error('Error adding Avalanche Fuji to wallet:', error);
        return false;
    }
};

// Function to check if user is on Avalanche Fuji
export const isOnAvalancheFuji = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) {
        return false;
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        return chainId === '0xa869'; // Avalanche Fuji chain ID in hex
    } catch (error) {
        console.error('Error checking chain ID:', error);
        return false;
    }
};

// Function to get wallet icon based on connector ID
export const getWalletIcon = (connectorId: string): string => {
    const walletIcons: Record<string, string> = {
        'metaMask': 'https://cryptologos.cc/logos/metamask-logo.png',
        'coinbaseWallet': 'https://cryptologos.cc/logos/coinbase-logo.png',
        'walletConnect': 'https://cryptologos.cc/logos/walletconnect-logo.png',
        'civic': 'https://cryptologos.cc/logos/civic-logo.png',
        'injected': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    };

    return walletIcons[connectorId] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
};

// Function to get wallet name based on connector ID
export const getWalletName = (connectorId: string): string => {
    const walletNames: Record<string, string> = {
        'metaMask': 'MetaMask',
        'coinbaseWallet': 'Coinbase Wallet',
        'walletConnect': 'WalletConnect',
        'civic': 'Civic Wallet',
        'injected': 'Browser Wallet',
    };

    return walletNames[connectorId] || 'Unknown Wallet';
};
