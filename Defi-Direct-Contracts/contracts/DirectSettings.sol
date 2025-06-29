// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DirectSettings
 * @author DeFi Direct
 * @notice Base contract that manages configuration settings for the FiatBridge system
 * @dev This contract handles token support, fee management, role assignments, and pause functionality
 * It serves as the foundation for the main FiatBridge contract and provides administrative controls
 */
contract DirectSettings is Ownable, Pausable {
    uint256 public constant MAX_FEE = 500;
    uint256 public spreadFeePercentage;
    mapping(address => bool) public supportedTokens;
    address transactionManager;
    address feeReceiver;
    address vaultAddress;

    // ============ EVENTS ============

    /**
     * @notice Emitted when a new token is added to the supported tokens list
     * @param token Address of the token that was added
     */
    event TokenAdded(address indexed token);
    
    /**
     * @notice Emitted when a token is removed from the supported tokens list
     * @param token Address of the token that was removed
     */
    event TokenRemoved(address indexed token);
    
    /**
     * @notice Emitted when fees are withdrawn from the contract
     * @param token Address of the token for which fees were withdrawn
     * @param amount Amount of fees withdrawn
     */
    event FeesWithdrawn(address indexed token, uint256 amount);

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initializes the DirectSettings contract with initial configuration
     * @param _spreadFeePercentage Initial fee percentage (must be <= MAX_FEE)
     * @param _owner Address that will become the contract owner
     * @param _transactionManager Address authorized to manage transactions
     * @param _feeReceiver Address that will receive collected fees
     * @param _vaultAddress Address where converted tokens will be stored
     * @custom:security Validates that fee percentage doesn't exceed maximum limit
     */
    constructor(uint256 _spreadFeePercentage, address _owner, address _transactionManager, address _feeReceiver, address _vaultAddress) Ownable(_owner) {
        require(_spreadFeePercentage <= MAX_FEE, "Fee too high");
        spreadFeePercentage = _spreadFeePercentage;
        transactionManager = _transactionManager;
        feeReceiver = _feeReceiver;
        vaultAddress = _vaultAddress;
    }

    // ============ TOKEN MANAGEMENT FUNCTIONS ============

    /**
     * @notice Adds a token to the list of supported tokens for fiat bridge transactions
     * @param token Address of the ERC20 token to add support for
     * @custom:access Only callable by contract owner
     * @custom:events Emits TokenAdded event upon successful addition
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }
    
    /**
     * @notice Removes a token from the list of supported tokens
     * @dev Sets the token's support status to false, preventing new transactions
     * @param token Address of the ERC20 token to remove support for
     * @custom:access Only callable by contract owner
     * @custom:events Emits TokenRemoved event upon successful removal
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    // ============ FEE MANAGEMENT FUNCTIONS ============
    
    /**
     * @notice Updates the spread fee percentage charged on transactions
     * @param newFee New fee percentage in basis points (e.g., 250 = 2.5%)
     * @custom:access Only callable by contract owner
     * @custom:security Fee cannot exceed MAX_FEE to protect users
     */
    function updateSpreadFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        spreadFeePercentage = newFee;
    }

    // ============ ADDRESS MANAGEMENT FUNCTIONS ============

    /**
     * @notice Updates the address that receives collected transaction fees
     * @param _feeReceiver New address to receive fees
     * @custom:access Only callable by contract owner
     * @custom:security Validates that the new address is not zero address
     */
    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid address");
        feeReceiver = _feeReceiver;
    }

    /**
     * @notice Updates the vault address where converted tokens are stored
     * @param _vaultAddress New vault address for storing converted tokens
     * @custom:access Only callable by contract owner
     * @custom:security Validates that the new address is not zero address
     */
    function setVaultAddress(address _vaultAddress) external onlyOwner {
        require(_vaultAddress != address(0), "Invalid address");
        vaultAddress = _vaultAddress;
    }

    /**
     * @notice Updates the transaction manager address
     * @param _transactionManager New address authorized to manage transactions
     * @custom:access Only callable by contract owner
     * @custom:security Validates that the new address is not zero address
     */
    function setTokenManager(address _transactionManager) external onlyOwner {
        require(_transactionManager != address(0), "Invalid address");
        transactionManager = _transactionManager;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Returns the current fee receiver address
     * @return The address that receives collected fees
     * @custom:access Only callable by contract owner for security
     */
    function getFeeReceiver() external view onlyOwner returns (address) {
        return feeReceiver;
    }

    /**
     * @notice Returns the current vault address
     * @return The address where converted tokens are stored
     * @custom:access Only callable by contract owner for security
     */
    function getVaultAddress() external view onlyOwner returns (address) {
        return vaultAddress;
    }
    
    /**
     * @notice Returns the current transaction manager address
     * @return The address authorized to manage transactions
     * @custom:access Only callable by contract owner for security
     */
    function getTokenManager() external view onlyOwner returns (address) {
        return transactionManager;
    }

    // ============ PAUSE FUNCTIONS ============

    /**
     * @notice Pauses the contract, preventing certain operations
     * @dev Uses OpenZeppelin's Pausable functionality to halt operations when needed
     * @custom:access Only callable by contract owner
     * @custom:emergency Used for emergency situations or maintenance
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the contract, resuming normal operations
     * @dev Restores contract functionality after maintenance or emergency pause
     * @custom:access Only callable by contract owner
     * @custom:recovery Used to restore normal operations after pause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}