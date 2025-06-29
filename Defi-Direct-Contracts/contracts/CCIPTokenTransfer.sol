// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CCIPTokenTransfer
 * @author DeFi Direct
 * @notice Contract for transferring tokens across chains using Chainlink CCIP
 * @dev This contract integrates with Chainlink CCIP to enable secure cross-chain token transfers
 * Users can transfer tokens to different chains and pay fees in either LINK or native gas tokens
 */
contract CCIPTokenTransfer is OwnerIsCreator, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ ERRORS ============

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value);
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector);
    error InvalidReceiverAddress();
    error TokenNotSupported(address token);
    error InvalidTransferAmount(uint256 amount);

    // ============ EVENTS ============
    
    /**
     * @notice Emitted when tokens are transferred across chains
     * @param messageId Unique identifier of the CCIP message
     * @param destinationChainSelector Chain selector of the destination chain
     * @param receiver Address of the receiver on the destination chain
     * @param token Address of the token that was transferred
     * @param tokenAmount Amount of tokens transferred
     * @param feeToken Address of the token used to pay CCIP fees
     * @param fees Amount of fees paid for the transfer
     * @param sender Address that initiated the transfer
     */
    event TokensTransferred(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees,
        address indexed sender
    );
    
    /**
     * @notice Emitted when a destination chain is allowlisted or removed from allowlist
     * @param destinationChainSelector Chain selector that was updated
     * @param allowed Whether the chain is now allowed or not
     */
    event ChainAllowlistUpdated(uint64 indexed destinationChainSelector, bool allowed);
    
    /**
     * @notice Emitted when a token is added or removed from supported tokens
     * @param token Token address that was updated
     * @param supported Whether the token is now supported or not
     */
    event TokenSupportUpdated(address indexed token, bool supported);

    // ============ STATE VARIABLES ============
    
    mapping(uint64 => bool) public allowlistedChains;
    mapping(address => bool) public supportedTokens;
    IRouterClient private s_router;
    IERC20 public s_linkToken;
    uint256 public constant MIN_TRANSFER_AMOUNT = 1000;
    uint256 public constant MAX_GAS_LIMIT = 5_000_000;
    address public fiatBridgeContract;

    // ============ MODIFIERS ============
    
    /**
     * @notice Ensures the destination chain is allowlisted
     * @param _destinationChainSelector Chain selector to check
     */
    modifier onlyAllowlistedChain(uint64 _destinationChainSelector) {
        if (!allowlistedChains[_destinationChainSelector])
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }
    
    /**
     * @notice Validates the receiver address is not zero
     * @param _receiver Address to validate
     */
    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }
    
    /**
     * @notice Ensures the token is supported for cross-chain transfers
     * @param _token Token address to check
     */
    modifier onlySupportedToken(address _token) {
        if (!supportedTokens[_token]) revert TokenNotSupported(_token);
        _;
    }
    
    /**
     * @notice Validates transfer amount is within acceptable range
     * @param _amount Amount to validate
     */
    modifier validateAmount(uint256 _amount) {
        if (_amount < MIN_TRANSFER_AMOUNT) revert InvalidTransferAmount(_amount);
        _;
    }

    // ============ CONSTRUCTOR ============
    
    /**
     * @notice Initializes the CCIP token transfer contract
     * @param _router Address of the CCIP router contract
     * @param _link Address of the LINK token contract
     * @param _fiatBridgeContract Address of the main FiatBridge contract
     */
    constructor(
        address _router, 
        address _link,
        address _fiatBridgeContract
    ) {
        s_router = IRouterClient(_router);
        s_linkToken = IERC20(_link);
        fiatBridgeContract = _fiatBridgeContract;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Updates the allowlist status of a destination chain
     * @param _destinationChainSelector Chain selector to update
     * @param _allowed Whether to allow or disallow the chain
     */
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external onlyOwner {
        allowlistedChains[_destinationChainSelector] = _allowed;
        emit ChainAllowlistUpdated(_destinationChainSelector, _allowed);
    }
    
    /**
     * @notice Updates the support status of a token for cross-chain transfers
     * @param _token Token address to update
     * @param _supported Whether to support or remove support for the token
     */
    function updateTokenSupport(
        address _token,
        bool _supported
    ) external onlyOwner {
        supportedTokens[_token] = _supported;
        emit TokenSupportUpdated(_token, _supported);
    }
    
    /**
     * @notice Updates the FiatBridge contract address
     * @param _newFiatBridge New FiatBridge contract address
     */
    function updateFiatBridgeContract(address _newFiatBridge) external onlyOwner {
        fiatBridgeContract = _newFiatBridge;
    }
    
    /**
     * @notice Pauses the contract (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ TRANSFER FUNCTIONS ============
    
    /**
     * @notice Transfers tokens to a receiver on the destination chain, paying fees in LINK
     * @param _destinationChainSelector Chain selector for the destination blockchain
     * @param _receiver Address of the recipient on the destination blockchain
     * @param _token Token address to transfer
     * @param _amount Amount of tokens to transfer
     * @param _gasLimit Gas limit for execution on destination chain
     * @return messageId The ID of the CCIP message that was sent
     */
    function transferTokensPayLINK(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        uint256 _gasLimit
    )
        external
        nonReentrant
        whenNotPaused
        onlyAllowlistedChain(_destinationChainSelector)
        validateReceiver(_receiver)
        onlySupportedToken(_token)
        validateAmount(_amount)
        returns (bytes32 messageId)
    {
        require(_gasLimit <= MAX_GAS_LIMIT, "Gas limit too high");
        
        // Build CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(s_linkToken),
            _gasLimit
        );

        // Calculate required fees
        uint256 fees = s_router.getFee(_destinationChainSelector, evm2AnyMessage);

        // Check LINK balance
        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        // Transfer tokens from sender to this contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Approve router to spend LINK for fees
        s_linkToken.approve(address(s_router), fees);

        // Approve router to spend tokens
        IERC20(_token).approve(address(s_router), _amount);

        // Send message through CCIP
        messageId = s_router.ccipSend(_destinationChainSelector, evm2AnyMessage);

        // Emit event
        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(s_linkToken),
            fees,
            msg.sender
        );

        return messageId;
    }
    
    /**
     * @notice Transfers tokens to a receiver on the destination chain, paying fees in native gas
     * @param _destinationChainSelector Chain selector for the destination blockchain
     * @param _receiver Address of the recipient on the destination blockchain
     * @param _token Token address to transfer
     * @param _amount Amount of tokens to transfer
     * @param _gasLimit Gas limit for execution on destination chain
     * @return messageId The ID of the CCIP message that was sent
     */
    function transferTokensPayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        uint256 _gasLimit
    )
        external
        payable
        nonReentrant
        whenNotPaused
        onlyAllowlistedChain(_destinationChainSelector)
        validateReceiver(_receiver)
        onlySupportedToken(_token)
        validateAmount(_amount)
        returns (bytes32 messageId)
    {
        require(_gasLimit <= MAX_GAS_LIMIT, "Gas limit too high");
        
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0),
            _gasLimit
        );
        uint256 fees = s_router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (msg.value < fees)
            revert NotEnoughBalance(msg.value, fees);

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        IERC20(_token).approve(address(s_router), _amount);

        messageId = s_router.ccipSend{value: fees}(_destinationChainSelector, evm2AnyMessage);

        if (msg.value > fees) {
            (bool success, ) = msg.sender.call{value: msg.value - fees}("");
            require(success, "Refund failed");
        }

        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(0),
            fees,
            msg.sender
        );

        return messageId;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Estimates the fee for a cross-chain token transfer
     * @param _destinationChainSelector Chain selector for the destination
     * @param _receiver Receiver address on destination chain
     * @param _token Token to transfer
     * @param _amount Amount to transfer
     * @param _feeToken Token to pay fees in (address(0) for native, LINK address for LINK)
     * @param _gasLimit Gas limit for destination execution
     * @return fee The estimated fee amount
     */
    function estimateTransferFee(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeToken,
        uint256 _gasLimit
    ) external view returns (uint256 fee) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            _feeToken,
            _gasLimit
        );
        
        return s_router.getFee(_destinationChainSelector, evm2AnyMessage);
    }
    
    /**
     * @notice Checks if a destination chain is allowlisted
     * @param _destinationChainSelector Chain selector to check
     * @return Whether the chain is allowlisted
     */
    function isChainAllowlisted(uint64 _destinationChainSelector) external view returns (bool) {
        return allowlistedChains[_destinationChainSelector];
    }
    
    /**
     * @notice Checks if a token is supported for cross-chain transfers
     * @param _token Token address to check
     * @return Whether the token is supported
     */
    function isTokenSupported(address _token) external view returns (bool) {
        return supportedTokens[_token];
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Constructs a CCIP message for token transfer
     * @param _receiver Receiver address
     * @param _token Token address
     * @param _amount Token amount
     * @param _feeTokenAddress Fee token address
     * @param _gasLimit Gas limit for destination execution
     * @return CCIP message struct
     */
    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress,
        uint256 _gasLimit
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Set up token amounts
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        return Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: _gasLimit,
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: _feeTokenAddress
        });
    }

    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @notice Allows contract owner to withdraw native tokens
     * @param _beneficiary Address to receive the withdrawn tokens
     */
    function withdraw(address _beneficiary) external onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();

        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }
    
    /**
     * @notice Allows contract owner to withdraw ERC20 tokens
     * @param _beneficiary Address to receive the tokens
     * @param _token Token contract address
     */
    function withdrawToken(address _beneficiary, address _token) external onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }

    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {}
}
