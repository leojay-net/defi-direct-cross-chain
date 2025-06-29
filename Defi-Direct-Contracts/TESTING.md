# Testing Guide

This project includes comprehensive tests for the FiatBridge contract with Chainlink price feed integration.


### 1. Fork Tests (`test/Direct.fork.ts`)
- **Purpose**: Integration testing with real Chainlink price feeds
- **Use Case**: Integration testing, pre-deployment validation
- **Requirements**: Sepolia RPC URL in environment

**Run fork tests:**
```bash
npm run test:fork
```

### Hardhat Configuration

The project is configured to:
- **Fork Sepolia** by default for accessing real Chainlink contracts

## Running Tests

```bash
# Run all tests
npm test

# Run only mock tests (fast)
npm run test:mock

# Run only fork tests (integration)
npm run test:fork

# Run both test suites
npm run test:all

# Compile contracts
npm run compile
```

## Test Coverage

### Fork Tests Cover:
- ✅ Real Chainlink price feed integration
- ✅ Live price data validation
- ✅ USD-based fee calculations with real prices
- ✅ Network-specific aggregator addresses
- ✅ Price feed error handling
- ✅ Stale data detection

## Chainlink Price Feeds Used

### Sepolia Testnet Addresses:
- **ETH/USD**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **USDC/USD**: `0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E`

## Development Workflow

1. **Integration**: Use fork tests before deployment
   ```bash
   npm run test:fork
   ```


## Troubleshooting

### Fork Tests Failing?
- Check your RPC URL is correct and has sufficient rate limits
- Ensure you have a stable internet connection
- Verify the Chainlink aggregator addresses are correct for Sepolia
