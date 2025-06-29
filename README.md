# DeFi Direct Project

A comprehensive decentralized finance (DeFi) platform that enables cross-chain token transfers and fiat-to-crypto conversions using Chainlink's Cross-Chain Interoperability Protocol (CCIP) and price feeds.

## Project Architecture

This project consists of four main components:

### Backend (`/Backend`)
**Django REST API** - Handles transaction management, cross-chain transfer tracking, and user data storage.

**Key Features:**
- Django with Django REST Framework
- PostgreSQL database integration
- Cross-chain transaction tracking
- Comprehensive API documentation with OpenAPI/Swagger

**Main Apps:**
- `CrossChainTransaction` - Manages cross-chain transfer data and status tracking
- `Transaction` - Handles fiat bridge transactions
- `Waitlist` - User registration and email management

**API Endpoints:**
- `/crosschain/cross-chain-transfers/` - CRUD operations for cross-chain transfers
- `/transaction/transactions/` - Fiat bridge transaction management
- `/waitlistapi/waitlist/` - User registration and email management

### Frontend (`/Defi-Direct`)
**Next.js 14 Application** - Modern React-based user interface with comprehensive DeFi functionality.

**Key Features:**
- Next.js 14 with TypeScript
- Ant Design UI components
- Wagmi for Web3 integration
- Civic Pass integration for authentication
- Cross-chain transfer interface
- Real-time transaction tracking
- Responsive design with Tailwind CSS

**Main Components:**
- Cross-chain transfer forms and history
- Dashboard with transaction overview
- Wallet integration and management
- Settings and user preferences

### Smart Contracts (`/Defi-Direct-Contracts`)
**Solidity Smart Contracts** - Core DeFi functionality with Chainlink Data Feed and CCIP integration.

**Key Contracts:**

#### `FiatBridge.sol` - Main Bridge Contract
- **Purpose**: Enables crypto-to-fiat conversions with dynamic pricing
- **Chainlink Integration**: Uses Chainlink price feeds for real-time token pricing
- **Features**:
  - Dynamic fee calculation based on USD value
  - Transaction management and completion
  - Refund mechanisms
  - Cross-chain transfer integration

#### `CCIPTokenTransfer.sol` - Cross-Chain Transfer Contract
- **Purpose**: Handles secure cross-chain token transfers using Chainlink CCIP
- **Chainlink Integration**: Full CCIP protocol implementation
- **Features**:
  - Multi-chain token transfers
  - Fee payment in LINK or native gas
  - Chain allowlisting for security
  - Token support management
  - Emergency pause functionality

#### `DirectSettings.sol` - Configuration Contract
- **Purpose**: Manages contract settings and access control
- **Features**:
  - Fee percentage management
  - Role-based access control
  - Vault and fee receiver management

### Subgraph (`/defi-direct-graph`)
**The Graph Protocol** - Indexes blockchain events for efficient data querying.

**Key Features:**
- Event indexing for FiatBridge contract
- Cross-chain transfer tracking
- Transaction history and statistics
- Real-time data updates

##  Chainlink Integration

### Cross-Chain Interoperability Protocol (CCIP)

The project leverages Chainlink CCIP for secure cross-chain token transfers:

#### CCIP Implementation in `CCIPTokenTransfer.sol`:

```solidity
// CCIP Router integration
IRouterClient private s_router;

// Transfer function with CCIP
function transferTokensPayLINK(
    uint64 _destinationChainSelector,
    address _receiver,
    address _token,
    uint256 _amount,
    uint256 _gasLimit
) external returns (bytes32 messageId) {
    // CCIP message creation
    Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver),
        data: "",
        tokenAmounts: new Client.TokenAmount[](1),
        extraArgs: Client._argsToBytes(
            Client.EVMExtraArgsV1({gasLimit: _gasLimit})
        ),
        feeToken: address(s_linkToken)
    });
    
    // Execute CCIP transfer
    messageId = s_router.ccipSend(_destinationChainSelector, evm2AnyMessage);
}
```

#### Key CCIP Features:
- **Secure Transfers**: Decentralized oracle network validates all transfers
- **Risk Management**: Built-in anomaly detection and rate limiting
- **Multi-Chain Support**: Transfer between Ethereum, Base, Avalanche, and more
- **Flexible Fees**: Pay in LINK tokens or native gas

### Price Feeds Integration

Chainlink price feeds provide real-time token pricing for fee calculations:

```solidity
// Price feed integration in FiatBridge.sol
function calculateTokenPriceAndFee(
    address aggregatorAddress,
    uint256 tokenAmount,
    uint8 tokenDecimals
) public view returns (
    int256 tokenPriceUSD,
    uint256 totalValueUSD,
    uint256 feeInTokens
) {
    AggregatorV3Interface priceFeed = AggregatorV3Interface(aggregatorAddress);
    
    // Get latest price from Chainlink
    (
        /*uint80 roundID*/,
        int256 price,
        /*uint256 startedAt*/,
        uint256 timeStamp,
        /*uint80 answeredInRound*/
    ) = priceFeed.latestRoundData();
    
    // Calculate fees based on USD value
    totalValueUSD = (tokenAmount * uint256(price)) / (10 ** tokenDecimals);
    uint256 feeValueUSD = (totalValueUSD * spreadFeePercentage) / 10000;
    feeInTokens = (feeValueUSD * (10 ** tokenDecimals)) / uint256(price);
}
```

## 🏔️ Avalanche Deployment

### Network Configuration

The project is deployed on multiple Avalanche networks with **Avalanche Fuji Testnet** as the primary deployment:

#### Avalanche Fuji Testnet (Chain ID: 43113) - **Primary Network**
```typescript
avalancheFuji: {
    url: process.env.AVALANCHE_FUJI_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    accounts: [myPrivateKey, vaultPrivateKey, feePrivateKey],
    gasPrice: 30000000000, // 30 gwei
}
```

**Deployed Contracts:**
- **FiatBridge**: `0x6184fE404FEa2f1ea523B7F32B460F89Aaa6A566`
- **CCIPTokenTransfer**: `0xCcc45b4e9Ef6B93CD9194aaD5Ae0565495EF21DC`
- **Mock USDC**: `0x6d0FfeF04952180E4dc4AcF549aAC0146DF76313`
- **Mock USDT**: `0x14e1E11956b7fCd46BE6a46f019a22298fc60219`

**Cross-Chain Support:**
- Ethereum Sepolia (Chain Selector: `16015286601757825753`)
- Base Sepolia (Chain Selector: `10344971235874465080`)
- Polygon Mumbai (Chain Selector: `12532609583862916517`)

#### Echo L1 Subnet (Chain ID: 173750)
```typescript
echoL1: {
    url: "https://subnets.avax.network/echo/testnet/rpc",
    chainId: 173750,
    accounts: [myPrivateKey, vaultPrivateKey, feePrivateKey],
    gasPrice: 25000000000, // 25 gwei
}
```

#### Dispatch L1 Subnet (Chain ID: 779672)
```typescript
dispatchL1: {
    url: "https://subnets.avax.network/dispatch/testnet/rpc",
    chainId: 779672,
    accounts: [myPrivateKey, vaultPrivateKey, feePrivateKey],
    gasPrice: 25000000000, // 25 gwei
}
```


## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL
- MetaMask or compatible Web3 wallet

### Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd Defi-Direct
npm install
npm run dev
```

### Smart Contracts Setup
```bash
cd Defi-Direct-Contracts
npm install
npx hardhat compile
npx hardhat test
```

### Subgraph Setup
```bash
cd defi-direct-graph
npm install
npm run codegen
npm run build
```

### CCIP Security
- **Decentralized Oracles**: Multiple independent validators
- **Risk Management**: Automatic anomaly detection
- **Rate Limiting**: Protection against excessive transfers
- **Chain Allowlisting**: Controlled destination chains

## Testing

### Smart Contract Tests
```bash
cd Defi-Direct-Contracts
npx hardhat test
npx hardhat coverage
```

### Frontend Tests
```bash
cd Defi-Direct
npm run test
npm run lint
```

### Backend Tests
```bash
cd Backend
python manage.py test
```

### CCIP Explorer Integration
- Real-time transfer status
- Message ID tracking
- Cross-chain transaction history


## 🔗 Resources

- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds)
- [Avalanche Documentation](https://docs.avax.network/)
- [The Graph Protocol](https://thegraph.com/docs/)
