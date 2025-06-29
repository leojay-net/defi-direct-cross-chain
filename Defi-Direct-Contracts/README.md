# DEFI-Direct

## Deployed Contract Addresses

### Ethereum Sepolia (Latest Deployment)
- **FiatBridge Contract**: `0x47EC71e8979ec93fCF71FE64FF1F5ee81D51B024`
- **CCIPTokenTransfer Contract**: `0x428e8EB515a8f3d52fDCA8044F1C9334D86a6F2A`
- **Mock USDC Token**: `0xF1Cfc4A96166158ED568Ea2d6aBc739Ec0ddAcAb`
- **Mock USDT Token**: `0xBA00240A1EfD8E2cc702216c19EF07B2E594bcA6`
- **CCIP-BnM Token**: `0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05`
- **CCIP-LnM Token**: `0x466D489b6d36E7E3b824ef491C225F5830E81cC1`
- **CCIP Router**: `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59`
- **LINK Token**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`
- **Chain Selector**: `16015286601757825753`

### Base Sepolia (Previous Deployment)
- **FiatBridge Contract**: `0x9A45135179f1cca3f1d29B67c6A24C78e0Ca2945`
- **CCIPTokenTransfer Contract**: `0xF3378424B7caBb455B07cEfCbC26CA56f9CC01d9`
- **Mock USDC Token**: `0x65ab50EB5da48a3Dc36E4E5D1EB682986a069BE5`
- **Mock USDT Token**: `0x215B6D88f52bb8edaFad77196cf98515D0cd3199`
- **CCIP Router**: `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93`
- **LINK Token**: `0xE4aB69C077896252FAFBD49EFD26B5D171A32410`
- **Chain Selector**: `10344971235874465080`

### Other Networks
- **Cronos**: `0x22e4068964e11648729Df47b160070f1d9B89C6d`
- **Scroll**: `0x88b11aB13cd7BE9846FA38AB85Ef133e3093375c`
- **Sepolia**: `0x88b11aB13cd7BE9846FA38AB85Ef133e3093375c`
- **Lisk**: `0x88b11aB13cd7BE9846FA38AB85Ef133e3093375c`

## Ethereum Sepolia Deployment Configuration

### Contract Configuration
- **Deployer Account**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Transaction Manager**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Fee Receiver**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Vault Address**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Spread Fee**: 100 basis points (1%)

### Supported Tokens
- **Mock USDC**: 50,000 minted to deployer
- **Mock USDT**: 50,000 minted to deployer
- **CCIP-BnM**: Test token for cross-chain transfers
- **CCIP-LnM**: Test token for cross-chain transfers
- **LINK**: For CCIP fee payments

### Cross-Chain Configuration
- **Supported Destination Chains**:
  - Base Sepolia (Chain Selector: `10344971235874465080`)
  - Avalanche Fuji (Chain Selector: `14767482510784806043`)
  - Polygon Mumbai (Chain Selector: `12532609583862916517`)

## Base Sepolia Deployment Configuration

### Contract Configuration
- **Deployer Account**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Transaction Manager**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Fee Receiver**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Vault Address**: `0xeD6c9f2573343043DD443bc633f9071ABDF688Fd`
- **Spread Fee**: 100 basis points (1%)

### Test Token Balances
- 10,000 USDC minted to deployer
- 10,000 USDT minted to deployer



## Deployment History

### Ethereum Sepolia - December 23, 2024
✅ **Successfully Deployed and Configured**
- All contracts deployed and configured successfully
- All tokens (USDC, USDT, CCIP-BnM, CCIP-LnM, LINK) added to support lists  
- Test tokens minted to deployer (50,000 USDC/USDT each)
- CCIP configuration completed with multi-chain support
- Cross-chain transfers enabled to Base Sepolia, Avalanche Fuji, and Polygon Mumbai
- FiatBridge contract properly linked with CCIPTokenTransfer

### Base Sepolia - December 19, 2024
✅ **Successfully Deployed and Configured**
- All contracts deployed and configured successfully
- All tokens added to support lists  
- Test tokens minted to deployer
- CCIP configuration completed
- Chain allowlisted for cross-chain transfers

### Base (Previous Deployment)
- Mock USDC: `0x88b11aB13cd7BE9846FA38AB85Ef133e3093375c`
- Mock USDT: `0x22e4068964e11648729Df47b160070f1d9B89C6d`
- FiatBridge: `0xe6cC80FD22712604376CDDB639eE2E52952740df`

## Features

- **Cross-chain token transfers** via Chainlink CCIP
- **Real-time price feeds** via Chainlink Data Feeds for dynamic USD-based fee calculations
- **Fiat bridge functionality** for crypto-to-fiat conversions with oracle-powered pricing
- **Multi-token support** (USDC, USDT, CCIP-BnM, CCIP-LnM, LINK) with individual price feed integration
- **Dynamic chain configuration** - Frontend automatically adapts to connected network (Ethereum Sepolia or Base Sepolia)
- **Configurable fees** calculated in USD using Chainlink price oracles
- **Pausable contracts** for emergency stops
- **Owner-controlled allowlists** for chains and tokens

## Frontend Integration

### Dynamic Chain Configuration
The frontend now automatically switches between different chain configurations based on the connected wallet's network:

- **Ethereum Sepolia (Chain ID: 11155111)** - Default/Latest deployment
- **Base Sepolia (Chain ID: 84532)** - Previous deployment

Contract addresses, token addresses, and CCIP configurations are automatically selected based on the active chain.

### Updated Architecture
- **FiatBridge Integration**: Users interact with the FiatBridge contract, which internally manages CCIP functionality
- **Dynamic Token Support**: Token lists and contract addresses adapt to the connected chain
- **Chain-Specific Configurations**: Each deployment maintains its own set of supported tokens and cross-chain destinations

## Chainlink Integration Details

### Chainlink CCIP (Cross-Chain Interoperability Protocol)
- **Purpose**: Enables secure cross-chain token transfers
- **Router Address**: `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93` (Base Sepolia)
- **Supported Chains**: Base Sepolia (Chain Selector: `10344971235874465080`)
- **Transfer Methods**: Native gas payment and LINK token payment options

### Chainlink Data Feeds (Price Feeds)
- **Purpose**: Provides real-time, reliable price data for dynamic fee calculations
- **Implementation**: Direct integration with `AggregatorV3Interface`
- **Key Functions**:
  - `calculateTokenPriceAndFee()`: Gets live token prices and calculates USD-based fees
  - `getTokenPrice()`: Fetches current token price from Chainlink aggregators
- **Security Features**:
  - Price validation (ensures positive prices)
  - Timestamp verification (ensures recent data)
  - Round completion checks
- **Benefits**:
  - Dynamic fee calculation based on real USD value
  - Protection against price manipulation
  - Consistent fee structure across different tokens
  - Automatic adjustment to market conditions

### Price Feed Integration Flow
1. User initiates a fiat transaction with token amount
2. Contract queries Chainlink price feed for current token/USD price
3. Fee is calculated in USD terms and converted back to token amount
4. Transaction proceeds with precise, market-based fee calculation
5. Price feed usage is logged via `PriceFeedUsed` event


### Cross-Chain Operations
- CCIP enables token transfers between supported chains
- Price feeds ensure consistent fee calculation across all chains
- Unified contract architecture supports multi-chain deployment
- Dynamic frontend configuration ensures seamless user experience across different networks

## Configuration Usage

### For Developers
The frontend uses dynamic configuration functions that automatically select the correct contract addresses based on the connected chain:

```typescript
// Get chain-specific contract addresses
const contractAddresses = getContractAddresses(chainId);

// Get chain-specific fiat token addresses
const fiatTokenAddresses = getFiatTokenAddresses(chainId);

// Get chain-specific configuration
const chainConfig = getChainConfig(chainId);
```

### Supported Networks
- **Ethereum Sepolia** (Chain ID: 11155111) - Primary network with latest features
- **Base Sepolia** (Chain ID: 84532) - Secondary network for testing

Both networks support cross-chain transfers to:
- Base Sepolia
- Avalanche Fuji  
- Polygon Mumbai