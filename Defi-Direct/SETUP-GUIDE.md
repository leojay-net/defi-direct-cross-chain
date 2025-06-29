# Setup Guide for DeFi Direct Frontend

## Environment Variables Configuration

To fix the issue where the complete transaction function is not being called, you need to set up the environment variables properly.

### 1. Create `.env.local` file

Create a `.env.local` file in the `Defi-Direct` directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://backend-cf8a.onrender.com

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# Transaction Manager Private Key (REQUIRED for complete transaction functionality)
# This should be the private key of the account that has TRANSACTION_MANAGER role in the smart contract
# IMPORTANT: Keep this secure and never commit it to version control
TRANSACTION_MANAGER_PRIVATE_KEY=your_transaction_manager_private_key_here

# Paystack Configuration (for fiat transfers)
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Civic Pass Configuration (if using)
CLIENT_ID=your_civic_client_id_here
AUTH_SERVER=https://auth.civic.com/oauth

# Subgraph Configuration (if using)
NEXT_PUBLIC_SUBGRAPH_API_KEY=your_subgraph_api_key_here

# JSON RPC Server (if using custom RPC)
NEXT_PUBLIC_JSON_RPC_SERVER_URL=your_custom_rpc_url_here
```

### 2. Get the Transaction Manager Private Key

The most important variable is `TRANSACTION_MANAGER_PRIVATE_KEY`. This should be the private key of the account that has the `TRANSACTION_MANAGER` role in your smart contract.

From the deployment logs, the contract was deployed by address: `0xa35d2c518710d3f953ce4f69cddeaafc0c6b156c`

You need to:

1. **Find the private key** for this address from your deployment configuration
2. **Set it in the environment variable**:
   ```env
   TRANSACTION_MANAGER_PRIVATE_KEY=0x1234567890abcdef... # Replace with actual private key
   ```

### 3. Verify the Setup

After setting up the environment variables:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the console logs** when making a transfer to see if the transaction manager is properly configured

3. **Test a transfer** and check if the complete transaction function is called

### 4. Common Issues and Solutions

#### Issue: "Transaction manager not configured"
**Solution**: Set the `TRANSACTION_MANAGER_PRIVATE_KEY` environment variable

#### Issue: "Insufficient funds for gas"
**Solution**: Ensure the transaction manager account has enough native tokens for gas fees

#### Issue: "Contract revert"
**Solution**: Check if the transaction manager has the correct role in the smart contract

### 5. Security Notes

- **Never commit** the `.env.local` file to version control
- **Keep the private key secure** - it has access to complete transactions
- **Use environment-specific keys** for different networks (testnet vs mainnet)

### 6. Testing the Setup

1. Make a small test transfer
2. Check the browser console for detailed logs
3. Verify that the complete transaction API is called
4. Confirm the transaction is marked as completed in the backend

### 7. Debugging

If you're still having issues:

1. **Check the browser console** for error messages
2. **Check the server logs** in your terminal
3. **Verify the contract address** matches your deployment
4. **Ensure the RPC URL** is correct for your network

The improved error handling will now show more specific error messages to help identify the exact issue. 