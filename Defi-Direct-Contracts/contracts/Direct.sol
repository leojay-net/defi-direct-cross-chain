// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./DirectSettings.sol";
import "./CCIPTokenTransfer.sol";

/**
 * @title FiatBridge
 * @author DeFi Direct
 * @notice A decentralized bridge contract that enables users to convert cryptocurrency to fiat currency
 * @dev This contract integrates with Chainlink price feeds for dynamic pricing and USD-based fee calculations
 * It allows users to initiate fiat transactions by locking crypto tokens and provides mechanisms
 * for transaction completion and refunds
 */
contract FiatBridge is DirectSettings, ReentrancyGuard {

    /**
     * @notice Structure representing a fiat bridge transaction
     * @dev Contains all necessary information for processing crypto-to-fiat conversions
     */
    struct Transaction {
        address user;           
        address token;
        uint256 amount;
        uint256 amountSpent;   
        uint256 transactionFee;
        uint256 transactionTimestamp;
        uint256 fiatBankAccountNumber;
        string fiatBank;
        string recipientName;
        uint256 fiatAmount;
        bool isCompleted;
        bool isRefunded;        
    }

    
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => bytes32[]) public userTransactionIds;
    mapping(address => uint256) public collectedFees;
    
    /// @notice CCIP token transfer contract instance
    /// @dev Used for cross-chain token transfers
    CCIPTokenTransfer public ccipTokenTransfer;
    
    // ============ EVENTS ============
    
    /**
     * @notice Emitted when a new fiat transaction is initiated
     * @param txId Unique identifier for the transaction
     * @param user Address of the user who initiated the transaction
     * @param amount Amount of tokens locked for conversion
     */
    event TransactionInitiated(bytes32 indexed txId, address indexed user, uint256 amount);
    
    /**
     * @notice Emitted when a transaction is successfully completed
     * @param txId Unique identifier for the completed transaction
     * @param amountSpent Amount of tokens that were actually converted
     */
    event TransactionCompleted(bytes32 indexed txId, uint256 amountSpent);
    
    /**
     * @notice Emitted when a transaction is refunded to the user
     * @param txId Unique identifier for the refunded transaction
     * @param amountRefunded Total amount refunded to the user (including fees)
     */
    event TransactionRefunded(bytes32 indexed txId, uint256 amountRefunded);
    
    /**
     * @notice Emitted when a Chainlink price feed is used for price calculation
     * @param aggregator Address of the Chainlink aggregator used
     * @param price The price retrieved from the aggregator
     */
    event PriceFeedUsed(address indexed aggregator, int256 price);
    
    /**
     * @notice Emitted when CCIP token transfer contract is updated
     * @param oldContract Previous CCIP contract address
     * @param newContract New CCIP contract address
     */
    event CCIPContractUpdated(address indexed oldContract, address indexed newContract);
    
    /**
     * @notice Emitted when a cross-chain token transfer is initiated
     * @param messageId CCIP message ID
     * @param user User who initiated the transfer
     * @param destinationChain Destination chain selector
     * @param token Token address
     * @param amount Amount transferred
     */
    event CrossChainTransferInitiated(
        bytes32 indexed messageId,
        address indexed user,
        uint64 indexed destinationChain,
        address token,
        uint256 amount
    );

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initializes the FiatBridge contract
     * @param _spreadFeePercentage Fee percentage charged on transactions (in basis points)
     * @param _transactionManager Address authorized to complete transactions
     * @param _feeReceiver Address that receives collected fees
     * @param _vaultAddress Address where converted tokens are sent
     * @param _ccipContract Address of the CCIPTokenTransfer contract (can be set to zero and updated later)
     */
    constructor(
        uint256 _spreadFeePercentage, 
        address _transactionManager, 
        address _feeReceiver, 
        address _vaultAddress,
        address payable _ccipContract
    ) DirectSettings(_spreadFeePercentage, msg.sender, _transactionManager, _feeReceiver, _vaultAddress) {
        if (_ccipContract != address(0)) {
            ccipTokenTransfer = CCIPTokenTransfer(_ccipContract);
        }
    }

    // ============ MODIFIERS ============

    /**
     * @notice Restricts function access to the transaction manager only
     * @dev Used for functions that complete or manage transactions
     */
    modifier onlyTransactionManager() {
        require(msg.sender == transactionManager, "Not transaction manager");
        _;
    }

    // ============ PRICE FEED FUNCTIONS ============

    /**
     * @notice Helper function to get token price in USD and calculate fees using Chainlink price feeds
     * @dev Integrates with Chainlink aggregators to get real-time token prices and calculate USD-based fees
     * @param aggregatorAddress The Chainlink price feed aggregator address for the token
     * @param tokenAmount The amount of tokens to calculate price and fees for
     * @param tokenDecimals The number of decimals for the token (used for precise calculations)
     * @return tokenPriceUSD The current price of the token in USD (scaled by aggregator decimals, typically 1e8)
     * @return totalValueUSD The total value of the token amount in USD (scaled by 1e8)
     * @return feeInTokens The calculated fee amount in tokens based on USD value
     * @custom:security This function validates price feed data and ensures prices are positive and recent
     */
    function calculateTokenPriceAndFee(
        address aggregatorAddress,
        uint256 tokenAmount,
        uint8 tokenDecimals
    ) public view returns (
        int256 tokenPriceUSD,
        uint256 totalValueUSD,
        uint256 feeInTokens
    ) {
        require(aggregatorAddress != address(0), "Invalid aggregator address");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(aggregatorAddress);
        
        // Get the latest price from Chainlink
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint256 startedAt*/,
            uint256 timeStamp,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        
        require(price > 0, "Invalid price from oracle");
        require(timeStamp > 0, "Round not complete");
        
        tokenPriceUSD = price;
        
        // Calculate total value in USD
        // Price is typically in 8 decimals, so we need to adjust for token decimals
        totalValueUSD = (tokenAmount * uint256(price)) / (10 ** tokenDecimals);
        
        // Calculate fee based on USD value
        uint256 feeValueUSD = (totalValueUSD * spreadFeePercentage) / 10000;
        
        // Convert fee back to tokens
        feeInTokens = (feeValueUSD * (10 ** tokenDecimals)) / uint256(price);
        
        return (tokenPriceUSD, totalValueUSD, feeInTokens);
    }

    /**
     * @notice Get current token price from Chainlink aggregator
     * @dev Fetches the latest price data from a Chainlink price feed
     * @param aggregatorAddress The Chainlink price feed aggregator address
     * @return price The latest price from the aggregator
     * @return decimals The number of decimals in the price (typically 8 for USD pairs)
     * @custom:security Validates that the price is positive and the round is complete
     */
    function getTokenPrice(address aggregatorAddress) external view returns (int256 price, uint8 decimals) {
        require(aggregatorAddress != address(0), "Invalid aggregator address");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(aggregatorAddress);
        
        (
            /*uint80 roundID*/,
            int256 latestPrice,
            /*uint256 startedAt*/,
            uint256 timeStamp,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        
        require(latestPrice > 0, "Invalid price from oracle");
        require(timeStamp > 0, "Round not complete");
        
        return (latestPrice, priceFeed.decimals());
    }
    
    // ============ MAIN TRANSACTION FUNCTIONS ============
    
    /**
     * @notice Initiates a new fiat bridge transaction
     * @dev Locks user's tokens and creates a transaction record for fiat conversion
     * Uses Chainlink price feeds to calculate USD-based fees dynamically
     * @param token Address of the ERC20 token to be converted
     * @param amount Amount of tokens to convert (excluding fees)
     * @param aggregatorAddress Chainlink price feed aggregator address for the token
     * @param _fiatBankAccountNumber Recipient's bank account number for fiat transfer
     * @param _fiatAmount Expected amount of fiat currency to be received
     * @param _fiatBank Name of the recipient's bank
     * @param _recipientName Name of the fiat recipient
     * @return txId Unique identifier for the created transaction
     * @custom:security Implements reentrancy protection and validates all input parameters
     * @custom:fee Fees are calculated based on USD value using Chainlink price feeds
     */
    function initiateFiatTransaction(
        address token,
        uint256 amount,
        address aggregatorAddress,
        uint256 _fiatBankAccountNumber,
        uint256 _fiatAmount,
        string memory _fiatBank,
        string memory _recipientName
    )
        external
        nonReentrant
        whenNotPaused
        returns (bytes32 txId)
    {
        require(amount > 0, "Amount must be greater than zero");
        require(supportedTokens[token], "Token not supported");
        require(aggregatorAddress != address(0), "Invalid aggregator address");
        require(_fiatBankAccountNumber > 0, "Invalid bank account number");
        require(bytes(_fiatBank).length > 0, "Invalid bank name");
        require(bytes(_recipientName).length > 0, "Invalid recipient name");

        // Calculate price and fee using Chainlink price feed
        (, , uint256 feeAmount) = calculateTokenPriceAndFee(
            aggregatorAddress, 
            amount, 
            IERC20Metadata(token).decimals()
        );
        
        // Transfer tokens including fees
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = amount + feeAmount;
        require(tokenContract.balanceOf(msg.sender) >= totalAmount, "Insufficient Balance");
        require(tokenContract.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        
        // Track collected fees and generate transaction ID
        collectedFees[token] += feeAmount;
        txId = keccak256(abi.encodePacked(msg.sender, token, amount, block.timestamp));
        
        // Store transaction
        transactions[txId] = Transaction({
            user: msg.sender,
            token: token,
            amount: amount,
            amountSpent: 0,
            transactionFee: feeAmount,
            transactionTimestamp: block.timestamp,
            fiatBankAccountNumber: _fiatBankAccountNumber,
            fiatBank: _fiatBank,
            recipientName: _recipientName,
            fiatAmount: _fiatAmount,
            isCompleted: false,
            isRefunded: false
        });

        userTransactionIds[msg.sender].push(txId);
        
        // Emit events - get price for event
        (int256 tokenPriceUSD,,) = calculateTokenPriceAndFee(aggregatorAddress, amount, IERC20Metadata(token).decimals());
        emit TransactionInitiated(txId, msg.sender, amount);
        emit PriceFeedUsed(aggregatorAddress, tokenPriceUSD);
        
        return txId;
    }

    // ============ TRANSACTION MANAGEMENT FUNCTIONS ============

    /**
     * @notice Completes a fiat transaction after successful fiat transfer
     * @dev Can only be called by the transaction manager after verifying fiat transfer
     * Transfers tokens to vault and fees to fee receiver
     * @param txId Unique identifier of the transaction to complete
     * @param amountSpent Amount of tokens that were actually converted (must equal locked amount)
     * @custom:access Only callable by transaction manager
     * @custom:security Implements reentrancy protection and validates transaction state
     */
    function completeTransaction(bytes32 txId, uint256 amountSpent)
        external
        onlyTransactionManager
        nonReentrant
    {
        Transaction storage txn = transactions[txId];
        require(!txn.isCompleted && !txn.isRefunded, "Transaction already processed");
        require(amountSpent == txn.amount, "Amount spent not equal locked amount");
        
        txn.amountSpent = amountSpent;
        txn.isCompleted = true;

        require(IERC20(txn.token).transfer(feeReceiver, txn.transactionFee), "Fee transfer failed");
        require(IERC20(txn.token).transfer(vaultAddress, amountSpent), "Transfer failed");

        
        emit TransactionCompleted(txId, amountSpent);
    }
    
    /**
     * @notice Refunds a transaction back to the user
     * @dev Can only be called by the contract owner in case of failed fiat transfer
     * Returns both the original token amount and fees to the user
     * @param txId Unique identifier of the transaction to refund
     * @custom:access Only callable by contract owner
     * @custom:security Implements reentrancy protection and validates transaction state
     * @custom:refund Returns the full amount including fees to the user
     */
    function refund(bytes32 txId)
        external
        onlyOwner
        nonReentrant
    {
        Transaction storage txn = transactions[txId];
        require(!txn.isCompleted && !txn.isRefunded, "Transaction already processed");
        
        txn.isRefunded = true;
        require(IERC20(txn.token).balanceOf(address(this)) >= txn.amount+txn.transactionFee, "Insufficient balance");
        require(IERC20(txn.token).transfer(txn.user, txn.amount+txn.transactionFee), "Transfer failed");
        
        emit TransactionRefunded(txId, txn.amount);
    }
    
    // ============ CCIP INTEGRATION FUNCTIONS ============
    
    /**
     * @notice Sets the CCIP token transfer contract address
     * @dev Can only be called by the contract owner to set or update the CCIP contract
     * @param _ccipContract Address of the deployed CCIPTokenTransfer contract
     * @custom:access Only callable by contract owner
     * @custom:integration Establishes connection between FiatBridge and CCIP contracts
     */
    function setCCIPContract(address payable _ccipContract) external onlyOwner {
        require(_ccipContract != address(0), "Invalid CCIP contract address");
        address oldContract = address(ccipTokenTransfer);
        ccipTokenTransfer = CCIPTokenTransfer(_ccipContract);
        emit CCIPContractUpdated(oldContract, _ccipContract);
    }
    
    /**
     * @notice Initiates a cross-chain token transfer using CCIP (paying fees in LINK)
     * @dev Transfers tokens from the user to the CCIP contract and initiates cross-chain transfer
     * @param destinationChainSelector Chain selector for the destination blockchain
     * @param receiver Address of the recipient on the destination blockchain
     * @param token Token address to transfer
     * @param amount Amount of tokens to transfer
     * @param gasLimit Gas limit for execution on destination chain
     * @return messageId The ID of the CCIP message that was sent
     * @custom:security Implements reentrancy protection and validates CCIP contract exists
     * @custom:ccip Uses Chainlink CCIP for secure cross-chain transfers
     */
    function initiateCrossChainTransfer(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount,
        uint256 gasLimit
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bytes32 messageId) 
    {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        require(amount > 0, "Amount must be greater than zero");
        require(supportedTokens[token], "Token not supported");
        
        // Transfer tokens from user to CCIP contract
        IERC20 tokenContract = IERC20(token);
        require(tokenContract.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(tokenContract.transferFrom(msg.sender, address(ccipTokenTransfer), amount), "Transfer failed");
        
        // Initiate cross-chain transfer
        messageId = ccipTokenTransfer.transferTokensPayLINK(
            destinationChainSelector,
            receiver,
            token,
            amount,
            gasLimit
        );
        
        emit CrossChainTransferInitiated(messageId, msg.sender, destinationChainSelector, token, amount);
        
        return messageId;
    }
    
    /**
     * @notice Initiates a cross-chain token transfer using CCIP (paying fees in native gas)
     * @dev Transfers tokens from the user to the CCIP contract and initiates cross-chain transfer
     * @param destinationChainSelector Chain selector for the destination blockchain
     * @param receiver Address of the recipient on the destination blockchain
     * @param token Token address to transfer
     * @param amount Amount of tokens to transfer
     * @param gasLimit Gas limit for execution on destination chain
     * @return messageId The ID of the CCIP message that was sent
     * @custom:security Implements reentrancy protection and validates CCIP contract exists
     * @custom:ccip Uses Chainlink CCIP for secure cross-chain transfers
     * @custom:payable Requires native gas to be sent to cover CCIP fees
     */
    function initiateCrossChainTransferNative(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount,
        uint256 gasLimit
    ) 
        external 
        payable
        nonReentrant 
        whenNotPaused 
        returns (bytes32 messageId) 
    {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        require(amount > 0, "Amount must be greater than zero");
        require(supportedTokens[token], "Token not supported");
        require(msg.value > 0, "Must send native gas for fees");
        
        // Transfer tokens from user to CCIP contract
        IERC20 tokenContract = IERC20(token);
        require(tokenContract.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(tokenContract.transferFrom(msg.sender, address(ccipTokenTransfer), amount), "Transfer failed");
        
        // Initiate cross-chain transfer (forward native gas for fees)
        messageId = ccipTokenTransfer.transferTokensPayNative{value: msg.value}(
            destinationChainSelector,
            receiver,
            token,
            amount,
            gasLimit
        );
        
        emit CrossChainTransferInitiated(messageId, msg.sender, destinationChainSelector, token, amount);
        
        return messageId;
    }
    
    /**
     * @notice Estimates the fee for a cross-chain token transfer (LINK payment)
     * @dev Calls the CCIP contract to get fee estimation for planning transfers
     * @param destinationChainSelector Chain selector for the destination blockchain
     * @param receiver Address of the recipient on the destination blockchain
     * @param token Token address to transfer
     * @param amount Amount of tokens to transfer
     * @param gasLimit Gas limit for execution on destination chain
     * @return fee The estimated fee in LINK tokens
     * @custom:view This is a view function that doesn't modify state
     * @custom:ccip Estimates fees using Chainlink CCIP fee calculation
     */
    function estimateCrossChainFeeLINK(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount,
        uint256 gasLimit
    ) 
        external 
        view 
        returns (uint256 fee) 
    {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        
        return ccipTokenTransfer.estimateTransferFee(
            destinationChainSelector,
            receiver,
            token,
            amount,
            address(ccipTokenTransfer.s_linkToken()),
            gasLimit
        );
    }
    
    /**
     * @notice Estimates the fee for a cross-chain token transfer (native gas payment)
     * @dev Calls the CCIP contract to get fee estimation for planning transfers
     * @param destinationChainSelector Chain selector for the destination blockchain
     * @param receiver Address of the recipient on the destination blockchain
     * @param token Token address to transfer
     * @param amount Amount of tokens to transfer
     * @param gasLimit Gas limit for execution on destination chain
     * @return fee The estimated fee in native gas tokens
     * @custom:view This is a view function that doesn't modify state
     * @custom:ccip Estimates fees using Chainlink CCIP fee calculation
     */
    function estimateCrossChainFeeNative(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount,
        uint256 gasLimit
    ) 
        external 
        view 
        returns (uint256 fee) 
    {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        
        return ccipTokenTransfer.estimateTransferFee(
            destinationChainSelector,
            receiver,
            token,
            amount,
            address(0), // Use address(0) for native gas payment
            gasLimit
        );
    }
    
    /**
     * @notice Allows contract owner to manage CCIP destination chain allowlist
     * @dev Wrapper function to manage which chains are allowed for cross-chain transfers
     * @param destinationChainSelector Chain selector to update
     * @param allowed Whether to allow or disallow the chain
     * @custom:access Only callable by contract owner
     * @custom:ccip Manages CCIP destination chain security
     */
    function manageCCIPChainAllowlist(uint64 destinationChainSelector, bool allowed) external onlyOwner {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        ccipTokenTransfer.allowlistDestinationChain(destinationChainSelector, allowed);
    }
    
    /**
     * @notice Allows contract owner to manage CCIP supported tokens
     * @dev Wrapper function to manage which tokens are supported for cross-chain transfers
     * @param token Token address to update
     * @param supported Whether to support or remove support for the token
     * @custom:access Only callable by contract owner
     * @custom:ccip Manages CCIP token support security
     */
    function manageCCIPTokenSupport(address token, bool supported) external onlyOwner {
        require(address(ccipTokenTransfer) != address(0), "CCIP contract not set");
        ccipTokenTransfer.updateTokenSupport(token, supported);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Retrieves all transaction IDs for a specific user
     * @dev Returns an array of transaction IDs that can be used to query individual transactions
     * @param user Address of the user to query transactions for
     * @return Array of transaction IDs associated with the user
     * @custom:view This is a view function that doesn't modify state
     */
    function getTransactionIds(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userTransactionIds[user];
    }
    
    /**
     * @notice Retrieves all transaction details for a specific user
     * @dev Returns complete transaction data for all transactions associated with a user
     * Useful for frontend applications to display user transaction history
     * @param user Address of the user to query transactions for
     * @return Array of Transaction structs containing full transaction details
     * @custom:view This is a view function that doesn't modify state
     * @custom:gas Gas cost increases with the number of user transactions
     */
    function getTransactionsByAddress(address user)
        external
        view
        returns (Transaction[] memory)
    {
        bytes32[] memory txIds = userTransactionIds[user];
        Transaction[] memory userTransactions = new Transaction[](txIds.length);
        for (uint256 i = 0; i < txIds.length; i++) {
            userTransactions[i] = transactions[txIds[i]];
        }
        return userTransactions;
    }
    
}