// Chain configurations for the application
import { Chain } from 'wagmi/chains'

// Avalanche Fuji Testnet - Primary chain
export const avalancheFuji: Chain = {
    id: 43113,
    name: 'Avalanche Fuji',
    nativeCurrency: {
        decimals: 18,
        name: 'Avalanche',
        symbol: 'AVAX',
    },
    rpcUrls: {
        public: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
        default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
    },
    blockExplorers: {
        etherscan: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
        default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
    },
    testnet: true,
}

// Supported chains for the application
export const supportedChains = [avalancheFuji] as const

// Default chain
export const defaultChain = avalancheFuji

// Chain metadata
export const chainMetadata = {
    [avalancheFuji.id]: {
        name: 'Avalanche Fuji',
        shortName: 'Fuji',
        icon: 'A',
        iconColor: '#E84142',
        color: '#E84142',
        description: 'Avalanche Fuji Testnet - Primary network for DeFi Direct',
        faucetUrl: 'https://faucet.avax.network/',
        ccipSupported: true,
        isDefault: true,
    },
} as const

// Helper functions
export const getChainMetadata = (chainId: number) => {
    return chainMetadata[chainId as keyof typeof chainMetadata]
}

export const isChainSupported = (chainId: number): boolean => {
    return supportedChains.some(chain => chain.id === chainId)
}

export const getChainById = (chainId: number): Chain | undefined => {
    return supportedChains.find(chain => chain.id === chainId)
}