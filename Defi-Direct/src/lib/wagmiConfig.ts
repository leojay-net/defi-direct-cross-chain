import { http, createConfig } from 'wagmi'
import { embeddedWallet } from '@civic/auth-web3/wagmi'
import { walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { avalancheFuji } from './chains'

// WalletConnect project ID - you should add this to your environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        walletConnect({
            projectId,
            metadata: {
                name: 'DeFi Direct',
                description: 'Cross-chain DeFi platform',
                url: 'https://defi-direct.app',
                icons: ['https://defi-direct.app/favicon.ico'],
            },
            showQrModal: true,
        }),
        coinbaseWallet({
            appName: 'DeFi Direct',
            appLogoUrl: 'https://defi-direct.app/favicon.ico',
        }),
        // Civic embedded wallet (fallback for users without browser extensions)
        embeddedWallet(),
    ],
    transports: {
        [avalancheFuji.id]: http(),
    },
    ssr: true,
    multiInjectedProviderDiscovery: true, // Enable multi-injected provider discovery for browser extensions
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
