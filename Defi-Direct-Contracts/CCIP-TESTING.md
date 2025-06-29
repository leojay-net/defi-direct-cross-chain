# CCIP Token Transfer Testing Guide

This document provides comprehensive testing guidance for the CCIPTokenTransfer contract and its integration with the FiatBridge system.

## Test Structure

### 1. Unit Tests (`CCIPTokenTransfer.unit.ts`)
Tests individual contract functions in isolation without external dependencies.

**Coverage Areas:**
- Contract initialization and deployment
- Ownership and access control
- Chain allowlist management
- Token support management
- FiatBridge contract management
- Pause/unpause functionality
- Input validation and modifiers
- State management
- Withdrawal functions
- Error handling

**Key Features:**
- Uses mock contracts and addresses
- No external dependencies on Chainlink infrastructure
- Fast execution
- Comprehensive modifier testing
- Edge case coverage

**Running Unit Tests:**
```bash
npm run test:ccip:unit
```

### 2. Fork Tests (`CCIPTokenTransfer.fork.ts`)
Tests contract functionality using forked Sepolia testnet with real Chainlink CCIP infrastructure.

**Coverage Areas:**
- Real CCIP router integration
- Actual fee estimation with Chainlink
- Cross-chain transfer simulation
- LINK token integration
- Native gas payment testing
- Real chain selector validation
- Gas optimization testing
- Integration with live Chainlink contracts

**Prerequisites:**
- Sepolia testnet fork configured in `hardhat.config.ts`
- Real CCIP router and LINK token addresses
- Sufficient testnet tokens for testing

**Running Fork Tests:**
```bash
npm run test:ccip:fork
```

### 3. Integration Tests (`CCIPTokenTransfer.integration.ts`)
Tests the complete integration between FiatBridge and CCIPTokenTransfer contracts.

**Coverage Areas:**
- Cross-contract communication
- FiatBridge → CCIP workflow
- Fee estimation integration
- Chain/token management through FiatBridge
- Error propagation between contracts
- Security and access control integration
- Gas optimization for integrated operations
- Complete user workflows

**Running Integration Tests:**
```bash
npm run test:ccip:integration
```

## Test Scenarios

### Contract Deployment and Setup
- ✅ Proper initialization with correct parameters
- ✅ Initial state validation
- ✅ Cross-reference setup between contracts
- ✅ Constants verification

### Access Control and Security
- ✅ Owner-only functions protection
- ✅ Ownership transfer functionality
- ✅ Reentrancy protection
- ✅ Pause/unpause emergency controls
- ✅ Invalid input rejection

### Chain Management
- ✅ Adding chains to allowlist
- ✅ Removing chains from allowlist
- ✅ Chain validation during transfers
- ✅ Event emission for chain updates
- ✅ Multiple chain handling

### Token Support
- ✅ Adding token support
- ✅ Removing token support
- ✅ Token validation during transfers
- ✅ Event emission for token updates
- ✅ Multiple token handling

### Cross-Chain Transfers
- ✅ LINK token fee payment
- ✅ Native gas fee payment
- ✅ Token transfer mechanics
- ✅ Fee calculation and refunds
- ✅ Event emission
- ✅ Error handling for failed transfers

### Fee Estimation
- ✅ LINK fee estimation accuracy
- ✅ Native gas fee estimation accuracy
- ✅ Gas limit impact on fees
- ✅ Different token/chain combinations

### Integration Workflows
- ✅ FiatBridge managing CCIP settings
- ✅ Combined fiat + cross-chain operations
- ✅ Error handling across contracts
- ✅ State consistency between contracts

### Gas Optimization
- ✅ Transfer operation gas usage
- ✅ Fee estimation gas usage
- ✅ Batch operation efficiency
- ✅ Integration operation gas costs

## Test Data and Constants

### Sepolia Testnet Addresses
```typescript
const SEPOLIA_ADDRESSES = {
    CCIP_ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    LINK_TOKEN: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    WETH_TOKEN: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    ETH_USD_AGGREGATOR: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    // Chain selectors
    BASE_SEPOLIA: 10344971235874465080n,
    AVALANCHE_FUJI: 14767482510784806043n,
    POLYGON_MUMBAI: 12532609583862916517n,
};
```

### Test Configuration
```typescript
const TEST_CONFIG = {
    GAS_LIMIT: 200000,
    TRANSFER_AMOUNT: ethers.parseUnits("100", 18),
    MIN_TRANSFER_AMOUNT: 1000,
    MAX_GAS_LIMIT: 2000000,
    SPREAD_FEE_PERCENTAGE: 100, // 1%
};
```

## Running All Tests

### Individual Test Suites
```bash
# Unit tests only
npm run test:ccip:unit

# Fork tests only
npm run test:ccip:fork

# Integration tests only
npm run test:ccip:integration

# All CCIP tests
npm run test:ccip:all

# All tests including FiatBridge
npm run test:all
```

### Test Environment Setup

1. **Environment Variables**: Ensure `.env` file contains:
   ```
   ETHEREUM_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   MY_PRIVATE_KEY=your_private_key_here
   ```

2. **Hardhat Configuration**: Fork configuration in `hardhat.config.ts`:
   ```typescript
   networks: {
       hardhat: {
           forking: {
               url: process.env.ETHEREUM_SEPOLIA_URL,
               blockNumber: undefined, // Use latest block
           }
       }
   }
   ```

3. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Test Coverage Goals

### Functional Coverage
- ✅ 100% of public functions tested
- ✅ All modifiers validated
- ✅ All error conditions covered
- ✅ Event emission verified
- ✅ State changes validated

### Integration Coverage
- ✅ Cross-contract communication
- ✅ Real Chainlink integration
- ✅ End-to-end workflows
- ✅ Error propagation
- ✅ Gas optimization

### Security Coverage
- ✅ Access control enforcement
- ✅ Reentrancy protection
- ✅ Input validation
- ✅ Overflow/underflow protection
- ✅ Emergency pause functionality

## Debugging and Troubleshooting

### Common Issues

1. **Fork Test Failures**: 
   - Check Sepolia RPC URL and API key
   - Verify testnet contract addresses
   - Ensure sufficient gas for transactions

2. **LINK Token Funding**:
   - Tests attempt to impersonate LINK whale addresses
   - Some tests may fail if impersonation fails
   - Consider using faucets for real testing

3. **Gas Estimation**:
   - Chainlink fees can vary significantly
   - Tests include buffers for fee estimation
   - Monitor gas price fluctuations

4. **Network Congestion**:
   - Fork tests may be slow during high congestion
   - Consider using specific block numbers for consistency

### Test Output Analysis

Monitor test output for:
- Gas usage metrics
- Fee estimation accuracy
- Transaction success rates
- Event emission verification
- State consistency checks

### Performance Benchmarks

Expected performance metrics:
- Unit tests: < 30 seconds total
- Fork tests: < 2 minutes total (network dependent)
- Integration tests: < 1 minute total
- Gas usage: < 500k gas per transaction

## Continuous Integration

For CI/CD pipelines:

1. **Unit Tests**: Always run in CI
2. **Fork Tests**: Run on staging/testnet deployments
3. **Integration Tests**: Run before production deployments
4. **Gas Regression**: Monitor gas usage changes

### CI Configuration Example
```yaml
test:
  stage: test
  script:
    - npm install
    - npm run compile
    - npm run test:ccip:unit
    - npm run test:ccip:integration
  only:
    - merge_requests
    - main
```

## Test Maintenance

### Regular Updates
- Update testnet addresses if changed
- Verify Chainlink contract addresses
- Update gas limits based on network changes
- Refresh test data periodically

### Test Quality
- Add new tests for new features
- Update tests for contract changes
- Maintain test documentation
- Monitor test execution times

This comprehensive testing approach ensures the reliability, security, and performance of the CCIP integration with the FiatBridge system.
