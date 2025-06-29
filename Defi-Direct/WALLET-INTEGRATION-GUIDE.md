# Wallet Integration Guide

## Overview

This guide documents the enhanced wallet integration system that supports both browser wallet extensions (MetaMask, Coinbase Wallet, etc.) and Civic's embedded wallet authentication.

## Key Features

### 1. Dual Wallet Support
- **Browser Wallet Extensions**: MetaMask, Coinbase Wallet, WalletConnect, and other injected providers
- **Civic Embedded Wallet**: Secure embedded wallet for users without browser extensions
- **Automatic Fallback**: Seamlessly falls back to embedded wallet if browser extensions are unavailable

### 2. Avalanche Fuji Network
- **Default Chain**: Avalanche Fuji (43113) is the only supported network
- **Automatic Network Addition**: Automatically adds Avalanche Fuji to user's wallet if not present
- **Network Switching**: Provides easy switching to Avalanche Fuji if user is on a different network

### 3. Enhanced User Experience
- **Choice Modal**: Users can choose between browser wallet and embedded wallet
- **Auto-Connect**: Automatically connects to preferred wallet type
- **Chain Validation**: Ensures users are always on the correct network

## Configuration

### Wagmi Configuration (`src/lib/wagmiConfig.ts`)

```typescript
export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        // Browser wallet extensions
        metaMask(),
        walletConnect({
            projectId,
            metadata: { /* ... */ },
            showQrModal: true,
        }),
        coinbaseWallet({
            appName: 'DeFi Direct',
            appLogoUrl: 'https://defi-direct.app/favicon.ico',
        }),
        // Civic embedded wallet (fallback)
        embeddedWallet(),
    ],
    transports: {
        [avalancheFuji.id]: http(),
    },
    ssr: true,
    multiInjectedProviderDiscovery: true, // Enables browser extension detection
})
```

### Civic Auth Configuration (`src/components/Providers.tsx`)

```typescript
<CivicAuthProvider
    chains={[avalancheFuji]}
    initialChain={avalancheFuji}
>
    {/* ... */}
</CivicAuthProvider>
```

## Components

### 1. ConnectButton (`src/components/ui/ConnectButton.tsx`)
- Primary wallet connection button
- Handles both browser wallet and Civic auth
- Automatically adds Avalanche Fuji network
- Shows loading states during connection

### 2. Web3ConnectModal (`src/components/ui/Web3ConnectModal.tsx`)
- Enhanced modal with wallet type selection
- Provides choice between browser wallet and embedded wallet
- Handles network addition and switching
- Shows connection progress and success states

### 3. AutoConnect (`src/components/ui/AutoConnect.tsx`)
- Automatically connects to preferred wallet type
- Prioritizes browser wallet extensions
- Falls back to embedded wallet if needed
- Handles network validation

## Utilities

### 1. Wallet Detection (`src/utils/walletDetection.ts`)

#### `addAvalancheFujiToWallet()`
```typescript
const success = await addAvalancheFujiToWallet();
// Adds Avalanche Fuji to user's wallet if not present
```

#### `isOnAvalancheFuji()`
```typescript
const onCorrectChain = await isOnAvalancheFuji();
// Checks if user is currently on Avalanche Fuji
```

### 2. Chain Management (`src/hooks/useChainManagement.ts`)

```typescript
const { isOnCorrectChain, switchToAvalancheFuji } = useChainManagement();
// Automatically ensures user is on Avalanche Fuji
```

## User Flow

### 1. First-Time User
1. User clicks "Login & Connect"
2. Civic auth modal appears for authentication
3. After authentication, wallet type selection modal appears
4. User chooses between browser wallet or embedded wallet
5. If browser wallet: network is added automatically if needed
6. Wallet connects and user is ready to use the app

### 2. Returning User with Browser Extension
1. User clicks "Connect Wallet"
2. System automatically detects browser wallet
3. Connects to browser wallet
4. Validates network (switches to Avalanche Fuji if needed)
5. User is ready to use the app

### 3. Returning User without Browser Extension
1. User clicks "Connect Wallet"
2. System falls back to embedded wallet
3. Civic wallet is created/connected automatically
4. User is ready to use the app

## Network Management

### Automatic Network Addition
When a user connects with a browser wallet that doesn't have Avalanche Fuji:

1. System detects incorrect network
2. Attempts to switch to Avalanche Fuji
3. If switch fails, automatically adds Avalanche Fuji to wallet
4. Switches to Avalanche Fuji after addition

### Network Switching
Users can manually switch to Avalanche Fuji using:
- Dashboard wallet dropdown
- Wallet info dropdown
- Automatic prompts when on wrong network

## Error Handling

### Common Scenarios
1. **User rejects network addition**: App continues with current network
2. **Wallet connection fails**: Falls back to embedded wallet
3. **Network switch fails**: Attempts to add network instead
4. **Civic wallet creation fails**: Shows error message and retry option

### Fallback Strategy
1. Try browser wallet extensions first
2. If no extensions available, use Civic embedded wallet
3. If Civic wallet fails, show error and manual retry option

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
CLIENT_ID=your_civic_client_id
```

## Best Practices

### 1. User Experience
- Always provide clear feedback during connection process
- Show loading states for network operations
- Provide fallback options when primary method fails

### 2. Security
- Validate network before allowing transactions
- Use Civic auth for secure embedded wallet
- Implement proper error handling for failed connections

### 3. Performance
- Cache wallet connection state
- Minimize network requests during connection
- Use optimistic updates for better UX

## Troubleshooting

### Common Issues

1. **Wallet not connecting**
   - Check if browser extension is installed
   - Verify WalletConnect project ID
   - Check Civic auth configuration

2. **Network not switching**
   - Ensure user approves network addition
   - Check if wallet supports network switching
   - Verify Avalanche Fuji RPC URL

3. **Civic wallet not working**
   - Verify Civic client ID
   - Check Civic auth provider configuration
   - Ensure proper Next.js setup

### Debug Information
Enable debug logging by setting:
```typescript
console.log('Wallet connection debug:', { connectors, isConnected, chainId });
```

## Migration from Previous Version

If migrating from a previous wallet integration:

1. Update wagmi configuration to include new connectors
2. Replace old wallet components with new ones
3. Update Civic auth provider configuration
4. Test both browser wallet and embedded wallet flows
5. Verify network switching functionality

## Future Enhancements

Potential improvements for future versions:

1. **Multi-chain Support**: Add support for additional networks
2. **Wallet Analytics**: Track wallet usage and connection success rates
3. **Advanced Security**: Implement additional security measures
4. **Mobile Optimization**: Enhance mobile wallet experience
5. **Offline Support**: Add offline wallet capabilities 